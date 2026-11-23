/**
 * 八字排盘页
 *
 * 排盘引擎直接复用 Web 端的 TS 算法层（已编译到主包 lib/）。
 * 注意：分包页面里的 require 必须用相对路径 —— 以 "/" 开头的路径
 * 在分包中会相对「分包根目录」解析，不是小程序根目录。
 */

const { createBaZiPaiPan } = require('../../../../lib/bazi/index.js');
const { getSupportedCities } = require('../../../../lib/utils/trueSolarTime.js');
const { buildSystemPrompt } = require('../../../../lib/ai/analysisPrompts.js');
const aiClient = require('../../../../utils/ai.js');
const preferences = require('../../../../utils/preferences.js');
const fmt = require('../../../../utils/format.js');

const EMPTY = fmt.EMPTY;
const CITIES = getSupportedCities();

const AI_QUESTION =
  '请基于以上命盘做一次整体批注：先给核心判断，再讲依据，最后给可执行建议。' +
  '事业、财运、婚恋、健康各指出利点与风险点；涉及大运流年时说明当前阶段与未来 3 到 5 年的重点变化。';

const WU_XING_BARS = [
  { key: 'muCount', name: '木', color: '#5f775f' },
  { key: 'huoCount', name: '火', color: '#b26039' },
  { key: 'tuCount', name: '土', color: '#9c6c2e' },
  { key: 'jinCount', name: '金', color: '#67707f' },
  { key: 'shuiCount', name: '水', color: '#496e8d' },
];

const PILLAR_KEYS = ['year', 'month', 'day', 'hour'];
const PILLAR_LABELS = ['年柱', '月柱', '日柱', '时柱'];

/** 表单里的选项组，集中声明便于统一渲染 */
const CHOICE_GROUPS = {
  sex: [
    { label: '男命', value: 1 },
    { label: '女命', value: 0 },
  ],
  dateType: [
    { label: '公历', value: 0 },
    { label: '农历', value: 1 },
  ],
  xuShiSuiType: [
    { label: '实岁', value: 1 },
    { label: '虚岁', value: 0 },
  ],
  qiYunLiuPaiType: [
    { label: '流派一', value: 0 },
    { label: '流派二', value: 1 },
  ],
  jieQiType: [
    { label: '整日切换', value: 0 },
    { label: '精确分钟', value: 1 },
  ],
  renYuanType: [
    { label: '子平真诠', value: 0 },
    { label: '渊海子平', value: 1 },
    { label: '星平会海', value: 2 },
    { label: '三命通会', value: 3 },
    { label: '神峰通考', value: 4 },
    { label: '万育吾之', value: 5 },
  ],
  yearGanZhiType: [
    { label: '春节切换', value: 0 },
    { label: '立春切换', value: 1 },
    { label: '精确立春', value: 2 },
  ],
  monthGanZhiType: [
    { label: '节交当天', value: 0 },
    { label: '精确节交', value: 1 },
  ],
  dayGanZhiType: [
    { label: '子初换日', value: 0 },
    { label: '子正换日', value: 1 },
  ],
};

const DA_YUN_CHOICES = [];
for (let year = 6; year <= 16; year += 1) {
  DA_YUN_CHOICES.push(`${year} 轮`);
}

/** 把排盘结果加工成视图模型，WXML 只负责渲染 */
function buildViewModel(result, settings) {
  const ageLabel = result.ageLabel || '实岁';
  const otherAgeLabel = ageLabel === '实岁' ? '虚岁' : '实岁';
  const otherAge = ageLabel === '实岁' ? result.xuSui : result.shiSui;

  const pillars = PILLAR_LABELS.map((label, index) => {
    const key = PILLAR_KEYS[index];
    const cangGan = result.diZhiCangGan && result.diZhiCangGan[key];
    const cangGanList = ((cangGan && cangGan.gan) || []).map((gan, ganIndex) => ({
      gan,
      shiShen: cangGan && cangGan.shiShen ? cangGan.shiShen[ganIndex] : '',
    }));

    return {
      label,
      gz: result.baZi[index],
      wuXing: result.baZiWuXing[index],
      naYin: result.baZiNaYin[index],
      kongWang: result.baZiKongWang[index],
      shiShen: (result.shiShen && result.shiShen[key]) || EMPTY,
      zhiShiShenText: fmt.join(result.shiShenZhi && result.shiShenZhi[key], '、'),
      cangGanList,
      shenSha: (result.shenSha && result.shenSha[index]) || [],
    };
  });

  const maxCount = Math.max(
    ...WU_XING_BARS.map((item) => result[item.key] || 0),
    1
  );
  const wuXingBars = WU_XING_BARS.map((item) => {
    const count = result[item.key] || 0;
    return {
      name: item.name,
      color: item.color,
      count,
      percent: Math.round((count / maxCount) * 100),
    };
  });

  const daYun = result.daYun || [];
  const currentGanZhi = result.currentDaYun && result.currentDaYun.ganZhi;
  let windowStart = 0;
  if (currentGanZhi) {
    const index = daYun.findIndex((item) => item.ganZhi === currentGanZhi);
    if (index > 1) windowStart = index - 1;
  }
  const daYunWindow = daYun.slice(windowStart, windowStart + 4).map((item) => ({
    ganZhi: item.ganZhi,
    shiShen: item.shiShen,
    ageRange: fmt.range(item.startAge, item.endAge),
    active: currentGanZhi === item.ganZhi,
    shenShaText: (item.shenSha || []).slice(0, 2).join('、'),
  }));

  const daYunAll = daYun.map((item) => ({
    ganZhi: item.ganZhi,
    shiShen: item.shiShen,
    ageRange: fmt.range(item.startAge, item.endAge),
    active: currentGanZhi === item.ganZhi,
    shenSha: (item.shenSha || []).slice(0, 4),
  }));

  const liuNian = (result.liuNian || []).map((item) => ({
    year: item.year,
    ganZhi: item.ganZhi,
    age: item.age,
    shiShen: item.shiShen,
    current: Boolean(result.currentLiuNian) && result.currentLiuNian.year === item.year,
    shenSha: (item.shenSha || []).slice(0, 3),
  }));

  const headlineParts = [
    result.shenQiangShenRuo && result.shenQiangShenRuo.result,
    result.geJu && result.geJu.geJuName,
    result.xiYongShen ? `喜用 ${result.xiYongShen}` : undefined,
  ].filter(Boolean);

  const conclusionDetail = [
    result.geJu && result.geJu.geJuMeaning,
    result.shenQiangShenRuo && result.shenQiangShenRuo.analysis,
    result.shiShenAnalysis,
  ].filter(Boolean).join(' ');

  const metaLine = fmt.join([
    result.sex,
    result.shengXiao,
    `${ageLabel} ${result.age}`,
    otherAge !== undefined ? `${otherAgeLabel} ${otherAge}` : undefined,
    result.solar,
  ]);

  const metrics = [
    { label: '日主', value: result.dayGan, note: '' },
    { label: '喜用神', value: result.xiYongShen || EMPTY, note: '' },
    {
      label: '当前大运',
      value: result.currentDaYun ? result.currentDaYun.ganZhi : EMPTY,
      note: result.currentDaYun
        ? fmt.range(result.currentDaYun.startAge, result.currentDaYun.endAge)
        : '',
    },
    {
      label: '当前流年',
      value: result.currentLiuNian ? result.currentLiuNian.ganZhi : EMPTY,
      note: result.currentLiuNian ? String(result.currentLiuNian.year) : '',
    },
  ];

  const geJu = result.geJu
    ? {
        name: result.geJu.geJuName,
        meaning: result.geJu.geJuMeaning,
        yongShen: result.geJu.yongShen,
        xiShen: result.geJu.xiShen,
        jiShen: result.geJu.jiShen,
        chouShen: result.geJu.chouShen,
      }
    : null;

  const shenQiang = result.shenQiangShenRuo
    ? {
        result: result.shenQiangShenRuo.result,
        score: result.shenQiangShenRuo.score,
        analysis: result.shenQiangShenRuo.analysis,
      }
    : null;

  const reportText = [
    `【八字排盘报告】${result.name ? ` ${result.name}` : ''}`,
    `公历：${result.solar}`,
    `农历：${result.lunar}`,
    `四柱：${result.baZi.join(' ')}`,
    `年龄：${ageLabel} ${result.age}${otherAge !== undefined ? ` / ${otherAgeLabel} ${otherAge}` : ''}`,
    `日主：${result.dayGan}`,
    `喜用神：${result.xiYongShen || EMPTY}`,
    result.geJu ? `格局：${result.geJu.geJuName}` : '',
    result.shenQiangShenRuo ? `身强弱：${result.shenQiangShenRuo.result}` : '',
  ].filter(Boolean).join('\n');

  return {
    title: result.name || '未命名命盘',
    metaLine,
    pillars,
    wuXingBars,
    wuXingSummary: {
      wangShuai: result.wuXingWangShuai || EMPTY,
      queShi: fmt.join(result.wuXingQueShi, '、'),
      xiYongShen: result.xiYongShen || EMPTY,
    },
    headline: fmt.join(headlineParts, '，'),
    conclusionDetail,
    metrics,
    geJu,
    shenQiang,
    daYunWindow,
    daYunAll,
    liuNian,
    shenShaAll: fmt.unique(result.shenSha),
    solar: result.solar,
    lunar: result.lunar,
    qiYunText: result.qiYunDate ? `起运 ${result.qiYunDate}` : '',
    reportText,
    extra: {
      taiYuan: result.taiYuan || EMPTY,
      mingGong: result.mingGong || EMPTY,
      shenGong: result.shenGong || EMPTY,
      renYuan: result.renYuanSiLingFenYe || EMPTY,
      riZhuLunMing: result.riZhuLunMing || EMPTY,
      jiJie: result.jiJie || EMPTY,
    },
    showShenSha: Boolean(settings.showShenSha),
  };
}

Page({
  data: {
    mode: 'form',

    // 表单值
    settings: {
      name: '',
      occupy: '',
      sex: 1,
      dateType: 0,
      date: '1990-01-01 08:30:00',
      xuShiSuiType: 1,
      qiYunLiuPaiType: 1,
      jieQiType: 1,
      renYuanType: 0,
      yearGanZhiType: 2,
      monthGanZhiType: 1,
      dayGanZhiType: 0,
      daYunLunShu: 10,
      useTrueSolarTime: false,
      city: '',
      longitude: undefined,
      showShenSha: true,
      showGeJu: true,
    },
    choices: CHOICE_GROUPS,
    daYunChoices: DA_YUN_CHOICES,

    // picker 绑定值
    solarDate: '1990-01-01',
    timeValue: '08:30',

    // 城市选择
    cities: CITIES,
    cityIndex: -1,
    cityDisplay: '请选择城市',

    // 交互态
    advancedOpen: false,
    loading: false,
    errors: {},

    // 结果
    vm: null,

    // AI 批注面板
    ai: {
      open: false,
      loading: false,
      content: '',
      error: '',
      cloudReady: false,
    },

    // 分区折叠开关
    openSections: { overview: true, fortune: true, extra: false },
  },

  onLoad() {
    const app = getApp();
    const safeArea = app.getSafeArea();
    const prefs = preferences.read();
    this.hapticEnabled = prefs.haptic;
    this.hapticPrefs = prefs;

    // 优先级：偏好设置 > 应用默认 > 页面初始值（初始值只兜底 wxml 首帧）
    const merged = Object.assign(
      {},
      app.globalData.defaultBaziSettings,
      {
        name: '',
        occupy: '',
        sex: 1,
        dateType: 0,
        date: '1990-01-01 08:30:00',
        useTrueSolarTime: false,
        showShenSha: true,
        showGeJu: true,
      },
      preferences.toBaziDefaults(prefs)
    );

    const parts = fmt.splitDateTime(merged.date);
    const cityIndex = merged.city ? CITIES.indexOf(merged.city) : -1;

    this.setData({
      statusBarHeight: safeArea.statusBarHeight,
      settings: merged,
      solarDate: parts.date,
      timeValue: parts.time,
      cityIndex,
      cityDisplay: cityIndex >= 0 ? CITIES[cityIndex] : '请选择城市',
      'ai.cloudReady': aiClient.isCloudReady(),
    });
  },

  onShow() {
    // 用户可能在「我的」里改了口径，回到本页时同步一次
    const prefs = preferences.read();
    this.hapticEnabled = prefs.haptic;
  },

  /* ---------------- 导航 ---------------- */

  onBack() {
    if (this.data.mode === 'result') {
      this.setData({ mode: 'form' });
      wx.pageScrollTo({ scrollTop: 0, duration: 0 });
      return;
    }
    wx.navigateBack({ delta: 1 });
  },

  /* ---------------- 表单交互 ---------------- */

  onTextInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`settings.${field}`]: event.detail.value });
  },

  onSelectOption(event) {
    const { field, value } = event.currentTarget.dataset;
    const numeric = Number(value);
    const next = Number.isNaN(numeric) ? value : numeric;

    if (field === 'dateType') {
      this.onDateTypeChange(next);
      return;
    }

    this.setData({
      [`settings.${field}`]: next,
      [`errors.${field}`]: '',
    });
  },

  onDateTypeChange(dateType) {
    const date = fmt.composeDateTime(
      this.data.solarDate,
      this.data.timeValue,
      dateType === 1
    );
    this.setData({
      'settings.dateType': dateType,
      'settings.date': date,
    });
  },

  onDateChange(event) {
    const solarDate = event.detail.value;
    const settings = this.data.settings;
    this.setData({
      solarDate,
      'settings.date': fmt.composeDateTime(
        solarDate,
        this.data.timeValue,
        settings.dateType === 1
      ),
      'errors.date': '',
    });
  },

  onTimeChange(event) {
    const timeValue = event.detail.value;
    const settings = this.data.settings;
    this.setData({
      timeValue,
      'settings.date': fmt.composeDateTime(
        this.data.solarDate,
        timeValue,
        settings.dateType === 1
      ),
    });
  },

  onDaYunChange(event) {
    const index = Number(event.detail.value);
    this.setData({ 'settings.daYunLunShu': index + 6 });
  },

  onToggleTrueSolar(event) {
    this.setData({ 'settings.useTrueSolarTime': event.detail.value });
  },

  onPickCity(event) {
    const index = Number(event.detail.value);
    const city = this.data.cities[index];
    this.setData({
      cityIndex: index,
      cityDisplay: city,
      'settings.city': city,
      'settings.longitude': undefined,
      'errors.city': '',
    });
  },

  onLongitudeInput(event) {
    const raw = event.detail.value;
    this.setData({
      'settings.longitude': raw === '' ? undefined : Number(raw),
      'settings.city': '',
      cityIndex: -1,
      cityDisplay: '请选择城市',
    });
  },

  onToggleAdvanced() {
    this.setData({ advancedOpen: !this.data.advancedOpen });
  },

  onToggleSection(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [`openSections.${key}`]: !this.data.openSections[key] });
  },

  onToggleShenSha() {
    this.setData({ 'settings.showShenSha': !this.data.settings.showShenSha });
  },

  /* ---------------- 排盘 ---------------- */

  onSubmit() {
    const settings = this.data.settings;
    const errors = {};

    if (!this.data.solarDate) {
      errors.date = '请选择出生日期';
    }
    if (
      settings.useTrueSolarTime &&
      !settings.city &&
      (settings.longitude === undefined || settings.longitude === null)
    ) {
      errors.city = '启用真太阳时需选择城市或填写经度';
    }

    if (Object.keys(errors).length > 0) {
      this.setData({ errors, advancedOpen: true });
      wx.showToast({ title: '请检查输入项', icon: 'none' });
      return;
    }

    this.setData({ loading: true, errors: {} });
    wx.showLoading({ title: '正在排盘', mask: true });

    // 让 loading 先渲染一帧，再执行同步计算
    setTimeout(() => {
      try {
        const payload = Object.assign({}, settings, {
          date: fmt.composeDateTime(
            this.data.solarDate,
            this.data.timeValue,
            settings.dateType === 1
          ),
        });
        const result = createBaZiPaiPan(payload);
        // 原始结果挂实例上，不进 data，避免每次 setData 都序列化整份命盘
        this.rawResult = result;
        this.setData({
          mode: 'result',
          loading: false,
          vm: buildViewModel(result, settings),
          ai: { open: false, loading: false, content: '', error: '', cloudReady: aiClient.isCloudReady() },
        });
        wx.pageScrollTo({ scrollTop: 0, duration: 0 });

        if (this.hapticEnabled) {
          wx.vibrateShort({ type: 'light', fail: () => {} });
        }
      } catch (error) {
        console.error('[八字排盘] 计算失败', error);
        wx.showModal({
          title: '排盘失败',
          content: '请检查出生日期是否合法后重试。',
          showCancel: false,
        });
        this.setData({ loading: false });
      } finally {
        wx.hideLoading();
      }
    }, 30);
  },

  onReset() {
    this.setData({ mode: 'form' });
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },

  /* ---------------- 结果操作 ---------------- */

  onCopyReport() {
    const vm = this.data.vm;
    if (!vm) return;
    wx.setClipboardData({
      data: vm.reportText,
      success: () => wx.showToast({ title: '报告已复制', icon: 'success' }),
    });
  },

  /* ---------------- AI 批注 ---------------- */

  onAskAI() {
    if (this.data.ai.loading) return;
    if (!this.rawResult) return;

    if (!aiClient.isCloudReady()) {
      this.setData({
        'ai.open': true,
        'ai.loading': false,
        'ai.content': '',
        'ai.error':
          'AI 批注未启用：请先在 app.js 填入云开发环境 ID，并在云开发控制台部署 ai-proxy 云函数。',
      });
      return;
    }

    let system = '';
    try {
      system = buildSystemPrompt('bazi', this.rawResult);
    } catch (error) {
      console.error('[AI] 提示词构造失败', error);
      this.setData({ 'ai.open': true, 'ai.error': '命盘数据整理失败，无法发起批注。' });
      return;
    }

    this.setData({
      'ai.open': true,
      'ai.loading': true,
      'ai.content': '',
      'ai.error': '',
    });

    aiClient
      .callAI({
        system,
        messages: [{ role: 'user', content: AI_QUESTION }],
        maxTokens: 2000,
        temperature: 0.7,
      })
      .then((response) => {
        if (response.ok) {
          this.setData({ 'ai.loading': false, 'ai.content': response.content });
          return;
        }
        this.setData({ 'ai.loading': false, 'ai.error': response.error || '批注失败' });
      });
  },

  onCloseAI() {
    this.setData({ 'ai.open': false });
  },

  onCopyAI() {
    const content = this.data.ai.content;
    if (!content) return;
    wx.setClipboardData({
      data: content,
      success: () => wx.showToast({ title: '批注已复制', icon: 'success' }),
    });
  },

  onShareAppMessage() {
    const vm = this.data.vm;
    return {
      title: vm ? `八字排盘 · ${vm.title}` : '玄数排盘 · 八字',
      path: '/packages/bazi/pages/bazi/bazi',
    };
  },
});
