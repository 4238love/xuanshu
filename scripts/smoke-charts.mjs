#!/usr/bin/env node
/**
 * 六爻 / 大六壬 / 奇门 / 梅花 / 紫微 五个排盘页的冒烟测试
 *
 * 在 Node 里打桩 Page / wx / getApp，真实跑一遍「填表 → 排盘 → 视图模型 →
 * 报告文本 → AI 降级」，验证算法层与页面胶水层都能出结果。
 *
 * 用法：node scripts/smoke-charts.mjs
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
const modals = [];

const appStub = {
  globalData: { cloudEnabled: false },
  getSafeArea: () => ({ top: 44, bottom: 810, statusBarHeight: 44, screenHeight: 844, screenWidth: 390 }),
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
  navigateBack() {},
  navigateTo() {},
  showToast(options) {
    toasts.push(options);
  },
  showModal(options) {
    modals.push(options);
  },
  setClipboardData(options) {
    global.__clipboard = options.data;
    if (options && options.success) options.success();
  },
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
};

/** 支持 modules[0].style / a.b 形式的路径赋值，与真机语义一致 */
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
    for (const [keyPath, value] of Object.entries(patch)) setPath(this.data, keyPath, value);
  };
  return instance;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 跑一次完整流程：onLoad → onSubmit → 等计算 → 读 vm */
async function runChart(relPath) {
  const page = loadPage(relPath);
  if (!page) return null;

  page.onLoad();
  assert(page.data.statusBarHeight === 44, `${relPath} 未写入状态栏高度`);
  assert(page.data.vm === null, `${relPath} 初始不应有结果`);

  page.onSubmit();
  await sleep(120);

  assert(page.data.mode === 'result', `${relPath} 排盘后应切到结果态`);
  assert(page.data.loading === false, `${relPath} 排盘后 loading 应复位`);
  assert(modals.length === 0, `${relPath} 排盘不应弹出失败提示：${JSON.stringify(modals[0] || {})}`);

  return page;
}

const CHART_PAGES = [
  { name: '六爻', path: 'packages/liuyao/pages/liuyao/liuyao.js', aiType: 'liuyao' },
  { name: '梅花', path: 'packages/meihua/pages/meihua/meihua.js', aiType: 'meihua' },
  { name: '大六壬', path: 'packages/daliuren/pages/daliuren/daliuren.js', aiType: 'daliuren' },
  { name: '奇门', path: 'packages/qimen/pages/qimen/qimen.js', aiType: 'qimen' },
  { name: '紫微', path: 'packages/ziwei/pages/ziwei/ziwei.js', aiType: 'ziwei' },
];

const summary = [];
const vms = {};
const pages = {};

for (const chart of CHART_PAGES) {
  toasts.length = 0;
  modals.length = 0;

  const page = await runChart(chart.path);
  if (!page) continue;

  const vm = page.data.vm || {};
  assert(Boolean(vm.title), `${chart.name} 结果缺少 title`);
  assert(typeof vm.reportText === 'string' && vm.reportText.length > 80, `${chart.name} 报告文本过短`);
  assert(vm.reportText.includes('玄数排盘'), `${chart.name} 报告缺少落款`);
  assert(page.aiType === chart.aiType, `${chart.name} aiType 不匹配`);

  // 结果态的操作
  page.onCopyReport();
  assert(typeof global.__clipboard === 'string' && global.__clipboard.length > 80, `${chart.name} 复制报告为空`);

  // 云环境未配置时，AI 必须给出明确降级文案而不是静默
  page.onAskAI();
  assert(page.data.ai.open === true, `${chart.name} AI 面板未打开`);
  assert(
    typeof page.data.ai.error === 'string' && page.data.ai.error.length > 0,
    `${chart.name} 未配置云环境时应给出降级提示`
  );

  // 回到表单
  page.onReset();
  assert(page.data.mode === 'form', `${chart.name} 重置后应回到表单`);

  summary.push({
    name: chart.name,
    detail: describe(chart.aiType, vm),
  });
  vms[chart.aiType] = vm;
  pages[chart.aiType] = page;
}

function describe(type, vm) {
  if (type === 'liuyao') {
    return `${vm.title} 之变 · 六爻 ${vm.yaoRows.length} 行 · 卦象 ${vm.guaList.length} 个`;
  }
  if (type === 'meihua') {
    return `${vm.title} · 卦象 ${vm.guaList.length} 个 · 六爻 ${vm.yaoRows.length} 行`;
  }
  if (type === 'daliuren') {
    return `${vm.title} · 十二宫 ${vm.palaceRows.length} 行 · 四课 ${vm.siKe.length} · 三传 ${vm.sanChuan.length}`;
  }
  if (type === 'qimen') {
    return `${vm.title} · 九宫 ${vm.palaces.length} 格 · 值符值使已排`;
  }
  return `${vm.title} · 十二宫 ${vm.gongs.length} · 四化 ${vm.siHua.length}`;
}

/* ------------------ 结构断言 ------------------ */

const liuyao = vms.liuyao;
if (liuyao) {
  assert(liuyao.yaoRows.length === 6, `六爻应有 6 行，实际 ${liuyao.yaoRows.length}`);
  assert(liuyao.guaList.length === 6, `六爻卦象应有 6 个，实际 ${liuyao.guaList.length}`);
  assert(liuyao.yaoRows[0].position === '上爻', '六爻首行应为上爻（传统排法）');
  assert(typeof liuyao.yaoRows[0].isYin === 'boolean', '爻象阴阳标记缺失');
}

const daliuren = vms.daliuren;
if (daliuren) {
  assert(daliuren.palaceRows.length === 12, `大六壬天地盘应有 12 宫，实际 ${daliuren.palaceRows.length}`);
  assert(daliuren.palaceRows[0].diZhi === '寅', `天地盘应从寅起，实际 ${daliuren.palaceRows[0].diZhi}`);
  assert(daliuren.siKe.length === 4, `四课应为 4，实际 ${daliuren.siKe.length}`);
  assert(daliuren.sanChuan.length === 3, `三传应为 3，实际 ${daliuren.sanChuan.length}`);
}

const qimen = vms.qimen;
if (qimen) {
  assert(qimen.palaces.length === 9, `九宫应有 9 格，实际 ${qimen.palaces.length}`);
  assert(qimen.palaces[0].name === '巽4', `首格应为巽4宫，实际 ${qimen.palaces[0].name}`);
  assert(qimen.palaces[2].name === '坤2', `第三格应为坤2宫，实际 ${qimen.palaces[2].name}`);
  assert(qimen.palaces[4].name === '中5', `第五格应为中5宫，实际 ${qimen.palaces[4].name}`);
  assert(qimen.palaces[8].name === '乾6', `末格应为乾6宫，实际 ${qimen.palaces[8].name}`);
  assert(
    qimen.palaces.filter((item) => item.gong !== 5).every((item) => item.shen && item.shen !== '—'),
    '除中五宫外，每宫都应排出八神'
  );
  assert(
    qimen.palaces.filter((item) => item.gong !== 5).every((item) => item.xing !== '—' && item.men !== '—'),
    '除中五宫外，每宫都应排出九星与八门'
  );
}

const ziwei = vms.ziwei;
if (ziwei) {
  assert(ziwei.gongs.length === 12, `紫微应有 12 宫，实际 ${ziwei.gongs.length}`);
  assert(ziwei.gongs.filter((item) => item.isMing).length === 1, '命宫应唯一');
  assert(ziwei.siHua.length === 4, `四化应为 4 条，实际 ${ziwei.siHua.length}`);
  assert(ziwei.headMetrics.length >= 4, '命盘指标不足');
}

const liuyaoPage = pages.liuyao;
if (liuyaoPage) {
  liuyaoPage.onReset();
  liuyaoPage.onPickYao({ currentTarget: { dataset: { index: 2, value: 2 } } });
  assert(
    liuyaoPage.data.settings.manualYaoShu[2] === 2,
    '手动起卦第 3 爻未写入老阳'
  );
  assert(
    liuyaoPage.data.settings.manualYaoShu[0] === 0,
    '手动起卦写错了爻位（数组下标串了）'
  );
}

const meihua = vms.meihua;
if (meihua) {
  assert(meihua.guaList.length === 5, `梅花卦象应有 5 个，实际 ${meihua.guaList.length}`);
  assert(meihua.yaoRows.length === 6, `梅花六爻应有 6 行，实际 ${meihua.yaoRows.length}`);
  assert(meihua.yaoRows.filter((item) => item.isMoving).length === 1, '梅花应有且仅有一个动爻');
}

/* ------------------ 结果 ------------------ */

if (failures.length === 0) {
  console.log('\n=== 排盘页冒烟结果 ===');
  for (const item of summary) console.log(`  ${item.name}：${item.detail}`);
  console.log('  AI 降级：未配置云环境时统一提示，不静默失败');
  console.log('\n✅ 全部断言通过');
  process.exit(0);
}

console.log(`\n❌ ${failures.length} 项断言失败：`);
for (const failure of failures) console.log(`   - ${failure}`);
process.exit(1);
