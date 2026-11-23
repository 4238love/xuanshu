/**
 * 排盘页公共逻辑
 *
 * 六爻 / 大六壬 / 奇门 / 梅花 / 紫微 五个页面的表单交互、排盘执行、
 * AI 批注与报告复制都走这里，页面只负责自己的视图模型。
 *
 * 用法：
 *   const kit = require('../../../../utils/chart-kit.js');
 *   Page(Object.assign({}, kit.formHandlers, { data: {...}, onLoad() {...}, onSubmit() {...} }));
 */

const fmt = require('./format.js');
const preferences = require('./preferences.js');
const aiClient = require('./ai.js');
const prompts = require('../lib/ai/analysisPrompts.js');

const DEFAULT_DATE = '1990-01-01 08:30:00';
const EMPTY = fmt.EMPTY;

const SEX_CHOICES = [
  { label: '男', value: 1 },
  { label: '女', value: 0 },
];

const DATE_TYPE_CHOICES = [
  { label: '公历', value: 0 },
  { label: '农历', value: 1 },
];

/** 排盘口径跟随「我的」页面里的偏好 */
function baseSettings(extra) {
  const prefs = preferences.read();
  return Object.assign(
    {
      name: '',
      occupy: '',
      sex: 1,
      dateType: 0,
      date: DEFAULT_DATE,
      leapMonthType: 0,
      xuShiSuiType: prefs.xuShiSuiType,
      jieQiType: prefs.jieQiType,
      yearGanZhiType: prefs.yearGanZhiType,
      monthGanZhiType: prefs.monthGanZhiType,
      dayGanZhiType: 0,
    },
    extra
  );
}

function freshAi() {
  return {
    open: false,
    loading: false,
    content: '',
    error: '',
    cloudReady: aiClient.isCloudReady(),
  };
}

/** 空值行直接丢掉，避免 WXML 里堆 wx:if */
function kv(label, value) {
  if (value === undefined || value === null || value === '') return null;
  return { label, value: String(value) };
}

/** 过滤空行 */
function rows(pairs) {
  return (pairs || []).filter((item) => item && item.value !== '' && item.value !== undefined && item.value !== null);
}

/** 四柱通用行 */
function pillars(result) {
  return [
    { label: '年', gz: result.yearGanZhi || EMPTY, wuXing: result.yearGanZhiWuXing || '', naYin: result.yearGanZhiNaYin || '', kongWang: result.yearGanZhiKongWang || '' },
    { label: '月', gz: result.monthGanZhi || EMPTY, wuXing: result.monthGanZhiWuXing || '', naYin: result.monthGanZhiNaYin || '', kongWang: result.monthGanZhiKongWang || '' },
    { label: '日', gz: result.dayGanZhi || EMPTY, wuXing: result.dayGanZhiWuXing || '', naYin: result.dayGanZhiNaYin || '', kongWang: result.dayGanZhiKongWang || '' },
    { label: '时', gz: result.hourGanZhi || EMPTY, wuXing: result.hourGanZhiWuXing || '', naYin: result.hourGanZhiNaYin || '', kongWang: result.hourGanZhiKongWang || '' },
  ];
}

/** 报告正文：标题 + 「小节：条目」结构 */
function report(title, blocks) {
  const lines = [title, ''];
  for (const block of blocks || []) {
    if (!block || !block.items || block.items.length === 0) continue;
    lines.push(`【${block.title}】`);
    for (const item of block.items) {
      if (item === undefined || item === null || item === '') continue;
      lines.push(`  ${item}`);
    }
    lines.push('');
  }
  lines.push('—— 由「玄数排盘」生成，仅供研究参考');
  return lines.join('\n');
}

/* ---------------- 页面生命周期与表单 ---------------- */

function initPage(page, extraDefaults) {
  const safeArea = getApp().getSafeArea();
  const prefs = preferences.read();
  page.hapticEnabled = prefs.haptic;

  const settings = baseSettings(extraDefaults);
  const parts = fmt.splitDateTime(settings.date);

  page.setData({
    statusBarHeight: safeArea.statusBarHeight,
    settings,
    solarDate: parts.date,
    timeValue: parts.time,
    ai: freshAi(),
  });
}

const formHandlers = {
  onTextInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`settings.${field}`]: event.detail.value });
  },

  onSelectOption(event) {
    const dataset = event.currentTarget.dataset;
    const field = dataset.field;
    const numeric = Number(dataset.value);
    const next = Number.isNaN(numeric) ? dataset.value : numeric;

    if (field === 'dateType') {
      this.onDateTypeChange(next);
      return;
    }

    this.setData({ [`settings.${field}`]: next });
    if (typeof this.onOptionChanged === 'function') {
      this.onOptionChanged(field, next);
    }
  },

  onDateTypeChange(dateType) {
    this.setData({
      'settings.dateType': dateType,
      'settings.date': fmt.composeDateTime(this.data.solarDate, this.data.timeValue, dateType === 1),
    });
  },

  onDateChange(event) {
    const solarDate = event.detail.value;
    this.setData({
      solarDate,
      'settings.date': fmt.composeDateTime(
        solarDate,
        this.data.timeValue,
        this.data.settings.dateType === 1
      ),
    });
  },

  onTimeChange(event) {
    const timeValue = event.detail.value;
    this.setData({
      timeValue,
      'settings.date': fmt.composeDateTime(
        this.data.solarDate,
        timeValue,
        this.data.settings.dateType === 1
      ),
    });
  },

  onBack() {
    if (this.data.mode === 'result') {
      this.setData({ mode: 'form' });
      wx.pageScrollTo({ scrollTop: 0, duration: 0 });
      return;
    }
    wx.navigateBack({ delta: 1 });
  },

  onReset() {
    this.setData({ mode: 'form' });
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },

  onCopyReport() {
    const vm = this.data.vm;
    if (!vm || !vm.reportText) return;
    wx.setClipboardData({
      data: vm.reportText,
      success: () => wx.showToast({ title: '报告已复制', icon: 'success' }),
    });
  },

  onAskAI() {
    askAI(this);
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

  onToggleSection(event) {
    const key = event.currentTarget.dataset.key;
    if (!key) return;
    this.setData({ [`openSections.${key}`]: !this.data.openSections[key] });
  },
};

/* ---------------- 排盘 ---------------- */

/**
 * 执行排盘并切到结果态。
 *
 * @param {object} page       页面实例
 * @param {object} options
 * @param {Function} options.create   lib 里的 createXxxPaiPan
 * @param {Function} options.buildVm  (result, settings) => 视图模型
 */
function submit(page, options) {
  const settings = page.data.settings;

  page.setData({ loading: true });
  wx.showLoading({ title: '正在排盘', mask: true });

  // 让 loading 先渲染一帧，再执行同步计算
  setTimeout(() => {
    try {
      const payload = Object.assign({}, settings, {
        date: fmt.composeDateTime(
          page.data.solarDate,
          page.data.timeValue,
          settings.dateType === 1
        ),
      });
      const result = options.create(payload);

      // 原始结果挂实例上，不进 data，避免每次 setData 都序列化整份盘
      page.rawResult = result;

      page.setData({
        mode: 'result',
        loading: false,
        vm: options.buildVm(result, settings),
        ai: freshAi(),
      });
      wx.pageScrollTo({ scrollTop: 0, duration: 0 });

      if (page.hapticEnabled) {
        wx.vibrateShort({ type: 'light', fail: () => {} });
      }
    } catch (error) {
      console.error('[排盘] 计算失败', error);
      wx.showModal({
        title: '排盘失败',
        content: '请检查输入项（尤其是日期与起卦参数）后重试。',
        showCancel: false,
      });
      page.setData({ loading: false });
    } finally {
      wx.hideLoading();
    }
  }, 30);
}

/* ---------------- AI 批注 ---------------- */

function askAI(page) {
  if (page.data.ai.loading) return;
  if (!page.rawResult) return;

  if (!aiClient.isCloudReady()) {
    page.setData({
      'ai.open': true,
      'ai.loading': false,
      'ai.content': '',
      'ai.error':
        'AI 批注未启用：请先在 app.js 填入云开发环境 ID，并在云开发控制台部署 ai-proxy 云函数。',
    });
    return;
  }

  const type = page.aiType || page.data.aiType;
  let system = '';
  try {
    system = prompts.buildSystemPrompt(type, page.rawResult);
  } catch (error) {
    console.error('[AI] 提示词构造失败', error);
    page.setData({ 'ai.open': true, 'ai.error': '盘面数据整理失败，无法发起批注。' });
    return;
  }

  const question = page.data.settings.occupy
    ? `请针对「${page.data.settings.occupy}」这件事解读当前盘面。`
    : '请解读当前盘面的核心信息。';

  page.setData({ 'ai.open': true, 'ai.loading': true, 'ai.content': '', 'ai.error': '' });

  aiClient
    .callAI({
      system,
      messages: [{ role: 'user', content: question }],
      maxTokens: 2000,
      temperature: 0.7,
    })
    .then((response) => {
      if (response.ok) {
        page.setData({ 'ai.loading': false, 'ai.content': response.content });
        return;
      }
      page.setData({ 'ai.loading': false, 'ai.error': response.error || '批注失败' });
    });
}

module.exports = {
  DEFAULT_DATE,
  SEX_CHOICES,
  DATE_TYPE_CHOICES,
  baseSettings,
  freshAi,
  kv,
  rows,
  pillars,
  report,
  initPage,
  formHandlers,
  submit,
  askAI,
};
