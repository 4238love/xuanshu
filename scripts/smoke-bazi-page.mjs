#!/usr/bin/env node
/**
 * 八字页冒烟测试
 *
 * 在 Node 里给 Page / wx / getApp 打桩，跑一遍页面真实的生命周期与提交逻辑，
 * 验证「表单 -> 排盘引擎 -> 视图模型 -> 渲染数据」这条链路没有断。
 *
 * 用法：node scripts/smoke-bazi-page.mjs
 */

import path from 'node:path';
import Module from 'node:module';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MP = path.join(ROOT, 'miniprogram');

/**
 * 小程序里以 "/" 开头的 require 表示「小程序根目录」，
 * Node 会当成文件系统根。这里把前缀请求映射到 miniprogram/ 下。
 */
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

global.Page = (config) => {
  pageConfig = config;
};

global.getApp = () => ({
  globalData: {
    cloudEnabled: true,
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
      showXiaoYun: false,
      showLiuYue: false,
      showLiuRi: false,
      showLiuShi: false,
      showJiuXing: false,
      showGanZhiLiuYi: true,
      showShenSha: true,
      showGeJu: true,
    },
  },
  getSafeArea: () => ({
    top: 44,
    bottom: 810,
    statusBarHeight: 44,
    screenHeight: 844,
  }),
});

const toastCalls = [];
const modalCalls = [];
const storage = {};

global.wx = {
  showLoading() {},
  hideLoading() {},
  pageScrollTo() {},
  vibrateShort() {},
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
    toastCalls.push(options);
  },
  showModal(options) {
    modalCalls.push(options);
  },
  setClipboardData(options) {
    global.__clipboard = options.data;
    if (options.success) options.success();
  },
  navigateBack() {},
  navigateTo() {},
  cloud: {
    callFunction(options) {
      global.__lastCloudCall = options;
      return Promise.resolve({
        result: {
          ok: true,
          content: '【核心判断】日主丙火生于卯月，正印当令，身强。\n【依据】……\n【建议】……',
        },
      });
    },
  },
};

/* ------------------ setData 实现 ------------------ */

function setPath(target, keyPath, value) {
  const keys = keyPath.split('.');
  let cursor = target;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (cursor[key] === undefined || cursor[key] === null) cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[keys[keys.length - 1]] = value;
}

function createPageInstance() {
  const instance = Object.create(pageConfig);
  instance.data = JSON.parse(JSON.stringify(pageConfig.data));
  instance.setData = function setData(patch) {
    for (const [keyPath, value] of Object.entries(patch)) {
      setPath(this.data, keyPath, value);
    }
  };
  return instance;
}

/* ------------------ 执行 ------------------ */

require(path.join(MP, 'packages', 'bazi', 'pages', 'bazi', 'bazi.js'));

assert(pageConfig !== null, '页面未注册 Page 配置');
if (!pageConfig) {
  console.error('❌ 页面未调用 Page()');
  process.exit(1);
}

const page = createPageInstance();
page.onLoad();

assert(page.data.cities.length > 100, `城市列表异常：${page.data.cities.length}`);
assert(page.data.solarDate === '1990-01-01', `日期初始值异常：${page.data.solarDate}`);
assert(page.data.timeValue === '08:30', `时间初始值异常：${page.data.timeValue}`);
assert(page.data.settings.daYunLunShu === 10, `大运轮数初始值异常：${page.data.settings.daYunLunShu}`);

// 走一遍表单交互
page.onTextInput({ currentTarget: { dataset: { field: 'name' } }, detail: { value: '冒烟测试' } });
page.onSelectOption({ currentTarget: { dataset: { field: 'sex', value: 1 } } });
page.onDateChange({ detail: { value: '1988-03-12' } });
page.onTimeChange({ detail: { value: '09:45' } });

assert(page.data.settings.name === '冒烟测试', '姓名写入失败');
assert(page.data.settings.date === '1988-03-12 09:45:00', `日期拼装失败：${page.data.settings.date}`);

// 切换到农历口径，验证 L: 前缀与去零
page.onSelectOption({ currentTarget: { dataset: { field: 'dateType', value: 1 } } });
assert(
  page.data.settings.date === 'L:1988-3-12 09:45:00',
  `农历日期格式错误：${page.data.settings.date}`
);

// 切回公历
page.onSelectOption({ currentTarget: { dataset: { field: 'dateType', value: 0 } } });
assert(
  page.data.settings.date === '1988-03-12 09:45:00',
  `切回公历后格式错误：${page.data.settings.date}`
);

// 真太阳时
page.onToggleTrueSolar({ detail: { value: true } });
page.onPickCity({ detail: { value: page.data.cities.indexOf('北京') } });
assert(page.data.settings.city === '北京', '城市选择失败');
assert(page.data.cityIndex >= 0, '城市索引未更新');

// 提交
page.onSubmit();

await new Promise((resolve) => setTimeout(resolve, 120));

assert(page.data.mode === 'result', `提交后未进入结果态：${page.data.mode}`);
assert(page.data.loading === false, 'loading 未复位');
assert(modalCalls.length === 0, `触发异常弹窗：${JSON.stringify(modalCalls)}`);

const vm = page.data.vm;
assert(vm !== null, '视图模型为空');
if (vm) {
  assert(Array.isArray(vm.pillars) && vm.pillars.length === 4, '四柱数量异常');
  assert(vm.pillars.every((item) => /^[\u4e00-\u9fa5]{2}$/.test(item.gz)), '四柱干支格式异常');
  assert(vm.wuXingBars.length === 5, '五行条数量异常');
  assert(vm.wuXingBars.every((item) => item.percent >= 0 && item.percent <= 100), '五行百分比越界');
  assert(vm.daYunAll.length > 0, '大运列表为空');
  assert(vm.liuNian.length > 0, '流年列表为空');
  assert(vm.metrics.length === 4, '指标卡数量异常');
  assert(typeof vm.reportText === 'string' && vm.reportText.includes('四柱'), '报告文本缺失四柱');
  assert(vm.title === '冒烟测试', `标题未取姓名：${vm.title}`);

  // 复制报告
  page.onCopyReport();
  assert(typeof global.__clipboard === 'string' && global.__clipboard.length > 0, '复制报告为空');

  // AI 批注（云函数打桩）
  page.onAskAI();
  await new Promise((resolve) => setTimeout(resolve, 60));

  assert(page.data.ai.open === true, 'AI 面板未展开');
  assert(page.data.ai.loading === false, 'AI loading 未复位');
  assert(!page.data.ai.error, `AI 返回错误：${page.data.ai.error}`);
  assert(
    typeof page.data.ai.content === 'string' && page.data.ai.content.length > 0,
    'AI 批注内容为空'
  );

  const cloudCall = global.__lastCloudCall;
  assert(cloudCall && cloudCall.name === 'ai-proxy', '云函数名不是 ai-proxy');
  assert(
    cloudCall && typeof cloudCall.data.system === 'string' && cloudCall.data.system.includes('八字'),
    'AI 系统提示词未包含排盘口径'
  );
  assert(
    cloudCall && Array.isArray(cloudCall.data.messages) && cloudCall.data.messages.length === 1,
    'AI 消息体异常'
  );

  console.log('\n=== 冒烟结果 ===');
  console.log(`  命盘：${vm.title}`);
  console.log(`  四柱：${vm.pillars.map((item) => item.gz).join(' ')}`);
  console.log(`  五行：${vm.wuXingBars.map((item) => `${item.name}${item.count}`).join(' ')}`);
  console.log(`  结论：${vm.headline}`);
  console.log(`  大运：${vm.daYunAll.length} 步 / 流年 ${vm.liuNian.length} 条`);
  console.log('  报告首行：' + vm.reportText.split('\n')[0]);
}

if (failures.length === 0) {
  console.log('\n✅ 全部断言通过');
  process.exit(0);
}

console.log(`\n❌ ${failures.length} 项断言失败：`);
for (const failure of failures) console.log(`   - ${failure}`);
process.exit(1);
