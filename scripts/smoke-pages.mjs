#!/usr/bin/env node
/**
 * 首页 / 我的 冒烟测试
 *
 * 覆盖：
 * - 首页卡片初始样式公式（决定首帧位置）
 * - 拖动生命周期：按下 → 跟手重绘 → 松手吸附/回弹 → 误点保护
 * - tabBar 选中态同步
 * - 偏好的持久化与重置，以及八字页读取偏好的链路
 *
 * 用法：node scripts/smoke-pages.mjs
 */

import path from 'node:path';
import Module from 'node:module';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MP = path.join(ROOT, 'miniprogram');

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function patchedResolve(request, ...rest) {
  if (typeof request === 'string' && request.startsWith('/')) {
    return originalResolveFilename.call(this, path.join(MP, request), ...rest);
  }
  return originalResolveFilename.call(this, request, ...rest);
};

const failures = [];
function assert(condition, message) {
  if (!condition) failures.push(message);
}

/* ------------------ 打桩 ------------------ */

let pageConfig = null;
const storage = {};
const toasts = [];

const appStub = {
  globalData: {
    cloudEnabled: false,
    defaultBaziSettings: {
      leapMonthType: 0,
      xuShiSuiType: 1,
      jieQiType: 1,
      qiYunLiuPaiType: 1,
      renYuanType: 0,
      daYunLunShu: 10,
      yearGanZhiType: 2,
      monthGanZhiType: 0,
      dayGanZhiType: 0,
      showShenSha: true,
      showGeJu: true,
    },
  },
  getSafeArea: () => ({ top: 44, bottom: 810, statusBarHeight: 44, screenHeight: 844 }),
};

global.Page = (config) => {
  pageConfig = config;
};
global.getApp = () => appStub;

global.wx = {
  showLoading() {},
  hideLoading() {},
  pageScrollTo() {},
  vibrateShort() {},
  switchTab(options) {
    global.__lastSwitchTab = options && options.url;
  },
  navigateTo(options) {
    global.__lastNavigate = options && options.url;
  },
  navigateBack() {},
  getStorageSync(key) {
    return storage[key];
  },
  setStorageSync(key, value) {
    storage[key] = value;
  },
  removeStorageSync(key) {
    delete storage[key];
  },
  clearStorageSync() {
    Object.keys(storage).forEach((key) => delete storage[key]);
  },
  showToast(options) {
    toasts.push(options);
  },
  showModal(options) {
    if (options && typeof options.success === 'function') {
      options.success({ confirm: true });
    }
  },
  setClipboardData(options) {
    global.__clipboard = options.data;
    if (options && options.success) options.success();
  },
};

/**
 * 模拟 setData 的路径赋值，要支持 `modules[0].style` 这种写法——
 * 真机是支持的，拖动时正是靠它只更新单张卡的样式。
 */
function setPath(target, keyPath, value) {
  const tokens = keyPath.split(/[.[\]]+/).filter((token) => token !== '');
  const toKey = (token) => (/^\d+$/.test(token) ? Number(token) : token);
  let cursor = target;

  for (let i = 0; i < tokens.length - 1; i += 1) {
    const key = toKey(tokens[i]);
    if (cursor[key] === undefined || cursor[key] === null) cursor[key] = {};
    cursor = cursor[key];
  }

  cursor[toKey(tokens[tokens.length - 1])] = value;
}

function loadPage(relPath) {
  pageConfig = null;
  const full = path.join(MP, relPath);
  delete require.cache[require.resolve(full)];
  require(full);

  if (!pageConfig) {
    failures.push(`${relPath} 未调用 Page()`);
    return null;
  }

  const instance = Object.create(pageConfig);
  instance.data = JSON.parse(JSON.stringify(pageConfig.data));
  instance.setData = function setData(patch) {
    for (const [keyPath, value] of Object.entries(patch)) {
      setPath(this.data, keyPath, value);
    }
  };
  instance.getTabBar = () => ({
    setData(patch) {
      instance.__tabBar = Object.assign(instance.__tabBar || {}, patch);
    },
  });
  return instance;
}

/* ================== 首页 ================== */

const home = loadPage('pages/index/index.js');
assert(home !== null, '首页加载失败');

home.onLoad();
assert(home.data.modules.length === 6, `首页卡片数应为 6，实际 ${home.data.modules.length}`);
assert(home.data.current === 0, '首页初始索引应为 0');
assert(home.data.currentName === '八字排盘', `首页当前名称异常：${home.data.currentName}`);
assert(home.data.dots.filter(Boolean).length === 1, '指示点应只有 1 个高亮');

const styles = home.data.modules.map((item) => item.style || '');
assert(styles.every((s) => s.includes('transform:')), '每张卡片都应有初始 transform');
assert(styles[0].includes('translateX(0.00%) scale(1.000)'), `首卡样式异常：${styles[0]}`);
assert(styles[1].includes('translateX(78.00%)'), `第二张卡位移应为 78%：${styles[1]}`);
assert(styles[1].includes('scale(0.860)'), `第二张卡缩放应为 0.860：${styles[1]}`);
assert(styles[2].includes('opacity: 0'), `第三张及以后应隐藏：${styles[2]}`);

// tabBar 同步
home.onShow();
assert(home.__tabBar && home.__tabBar.selected === 0, '首页未把 tabBar 选中态设为 0');

/** 模拟一次横向拖动：pageX 从 press 拖到 release */
function drag(press, release, samples = 4) {
  home.onStackTouchStart({ touches: [{ pageX: press }] });
  for (let i = 1; i <= samples; i += 1) {
    home.onStackTouchMove({ touches: [{ pageX: press + ((release - press) * i) / samples }] });
  }
  home.onStackTouchEnd({ changedTouches: [{ pageX: release }] });
}

const cardWidth = home.data.cardWidth;
assert(cardWidth > 0, `卡片宽度应大于 0，实际 ${cardWidth}`);

// 拖动中：当前卡跟手位移，后一张同时放大
home.onStackTouchStart({ touches: [{ pageX: 300 }] });
assert(home.data.dragging === true, '按下后应进入拖动态（关掉 CSS transition）');
home.onStackTouchMove({ touches: [{ pageX: 300 - cardWidth * 0.3 }] });
assert(
  home.data.modules[0].style.includes('translateX(-23.40%)'),
  `拖动跟手位移异常：${home.data.modules[0].style}`
);
assert(
  home.data.modules[1].style.includes('scale(0.902)'),
  `后一张卡应随拖动放大：${home.data.modules[1].style}`
);
home.onStackTouchEnd({ changedTouches: [{ pageX: 300 - cardWidth * 0.3 }] });
assert(home.data.current === 1, `左拖 30% 卡宽应翻页到 1，实际 ${home.data.current}`);
assert(home.data.dragging === false, '松手后应退出拖动态');
assert(home.data.dots[1] === true, '第 2 个指示点未高亮');
assert(
  home.data.modules[0].style.includes('translateX(-78.00%)'),
  `翻页后原卡应落到侧位：${home.data.modules[0].style}`
);

// 位移不足阈值（18% 卡宽）应回弹
drag(300, 300 - cardWidth * 0.1);
assert(home.data.current === 1, `位移不足阈值应回弹，实际翻到了 ${home.data.current}`);

// 首卡继续往右拖要被阻尼，不能滑出可视区
home.setCurrent(0);
home.onStackTouchStart({ touches: [{ pageX: 200 }] });
home.onStackTouchMove({ touches: [{ pageX: 200 + cardWidth * 0.3 }] });
assert(
  home.data.modules[0].style.includes('translateX(8.19%)'),
  `首卡右拖应被阻尼（30% × 0.35 → 8.19%）：${home.data.modules[0].style}`
);
home.onStackTouchEnd({ changedTouches: [{ pageX: 200 + cardWidth * 0.3 }] });
assert(home.data.current === 0, '首卡右拖不应翻页');

// 下面验证点击，先清掉拖动保护
home.lastDragAt = 0;

home.onTapCard({ currentTarget: { dataset: { index: 2 } } });
assert(home.data.current === 2, '点击侧卡应切换');
assert(home.data.dots[2] === true, '第 3 个指示点未高亮');
assert(!global.__lastNavigate, '点侧卡不应直接跳转');

// 点当前卡（八字已就绪）
home.setCurrent(0);
home.onTapCard({ currentTarget: { dataset: { index: 0 } } });
assert(
  global.__lastNavigate === '/packages/bazi/pages/bazi/bazi',
  `点击八字卡应跳转分包，实际：${global.__lastNavigate}`
);

// 六大模块应全部就绪，且各自指向自己的分包
assert(
  home.data.modules.every((item) => item.ready === true),
  `仍有未就绪模块：${home.data.modules.filter((item) => !item.ready).map((item) => item.name).join('、')}`
);
assert(
  home.data.modules.every((item) => typeof item.route === 'string' && item.route.startsWith('/packages/')),
  '每个模块都应有分包路由'
);

global.__lastNavigate = null;
home.setCurrent(1);
home.onTapCard({ currentTarget: { dataset: { index: 1 } } });
assert(
  global.__lastNavigate === '/packages/liuyao/pages/liuyao/liuyao',
  `点击六爻卡应跳转六爻分包，实际：${global.__lastNavigate}`
);

global.__lastNavigate = null;
home.setCurrent(5);
home.onTapCard({ currentTarget: { dataset: { index: 5 } } });
assert(
  global.__lastNavigate === '/packages/ziwei/pages/ziwei/ziwei',
  `点击紫微卡应跳转紫微分包，实际：${global.__lastNavigate}`
);

// 拖动结束后紧接的 tap 必须被忽略，否则滑完就误进模块
home.setCurrent(0);
home.lastDragAt = 0;
drag(300, 120);
assert(home.data.current === 1, `拖动后应翻页到 1，实际 ${home.data.current}`);
home.onTapCard({ currentTarget: { dataset: { index: 0 } } });
assert(home.data.current === 1, '拖动结束后 350ms 内的 tap 应被忽略');

/* ================== 我的 ================== */

const mine = loadPage('pages/mine/mine.js');
assert(mine !== null, '我的页加载失败');

mine.onLoad();
assert(mine.data.prefs.daYunLunShu === 10, '默认大运轮数应为 10');
assert(mine.data.prefs.xuShiSuiType === 1, '默认年龄口径应为实岁');
assert(mine.data.cityIndex === -1, '默认应未选城市');

mine.onShow();
assert(mine.__tabBar && mine.__tabBar.selected === 1, '我的页未把 tabBar 选中态设为 1');

// 改口径 -> 持久化
mine.onSelectSegment({ currentTarget: { dataset: { field: 'jieQiType', value: 0 } } });
assert(mine.data.prefs.jieQiType === 0, '节气口径未更新');
assert(
  storage['xuanshu.preferences.v1'] && storage['xuanshu.preferences.v1'].jieQiType === 0,
  '节气口径未写入本地存储'
);

mine.onDaYunChange({ detail: { value: 4 } });
assert(mine.data.prefs.daYunLunShu === 10, `大运轮数应为 6+4=10，实际 ${mine.data.prefs.daYunLunShu}`);

const cityIndex = mine.data.cities.indexOf('北京');
mine.onPickCity({ detail: { value: cityIndex } });
assert(mine.data.prefs.defaultCity === '北京', '城市未保存');
assert(mine.data.cityDisplay === '北京', '城市展示未更新');

mine.onClearCity();
assert(mine.data.prefs.defaultCity === '', '清除城市失败');

mine.onToggleHaptic({ detail: { value: false } });
assert(mine.data.prefs.haptic === false, '震动开关未保存');

// 恢复默认
mine.onResetPrefs();
assert(mine.data.prefs.daYunLunShu === 10, '恢复默认后大运轮数应回到 10');
assert(mine.data.prefs.jieQiType === 1, '恢复默认后节气口径应回到 1');

/* ================== 八字页读取偏好 ================== */

storage['xuanshu.preferences.v1'] = {
  xuShiSuiType: 0,
  jieQiType: 0,
  yearGanZhiType: 1,
  monthGanZhiType: 0,
  daYunLunShu: 12,
  defaultCity: '上海',
  haptic: false,
};

const bazi = loadPage('packages/bazi/pages/bazi/bazi.js');
bazi.onLoad();
assert(bazi.data.settings.xuShiSuiType === 0, '八字页未采用偏好的年龄口径');
assert(bazi.data.settings.jieQiType === 0, '八字页未采用偏好的节气口径');
assert(bazi.data.settings.yearGanZhiType === 1, '八字页未采用偏好的年干支口径');
assert(bazi.data.settings.daYunLunShu === 12, '八字页未采用偏好的大运轮数');
assert(bazi.data.settings.city === '上海', '八字页未采用偏好的默认城市');
assert(bazi.data.cityIndex >= 0, '八字页城市索引未同步');
assert(bazi.hapticEnabled === false, '八字页未同步震动偏好');

/* ================== 结果 ================== */

if (failures.length === 0) {
  console.log('\n=== 页面冒烟结果 ===');
  console.log(`  首页卡片：${home.data.modules.length} 张，当前 ${home.data.currentName}`);
  console.log(`  首卡样式：${home.data.modules[0].style}`);
  console.log(`  侧卡样式：${home.data.modules[1].style}`);
  console.log(`  我的偏好：${JSON.stringify(mine.data.prefs)}`);
  console.log(`  八字继承：大运 ${bazi.data.settings.daYunLunShu} 轮 / 城市 ${bazi.data.settings.city}`);
  console.log('\n✅ 全部断言通过');
  process.exit(0);
}

console.log(`\n❌ ${failures.length} 项断言失败：`);
for (const failure of failures) console.log(`   - ${failure}`);
process.exit(1);
