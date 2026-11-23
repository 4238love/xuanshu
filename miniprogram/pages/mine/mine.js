const preferences = require('../../utils/preferences.js');
const { getSupportedCities } = require('../../lib/utils/trueSolarTime.js');
const aiClient = require('../../utils/ai.js');

const CITIES = getSupportedCities();
const DA_YUN_CHOICES = [];
for (let year = 6; year <= 16; year += 1) {
  DA_YUN_CHOICES.push(`${year} 轮`);
}

const SEGMENTS = {
  xuShiSuiType: [
    { label: '实岁', value: 1 },
    { label: '虚岁', value: 0 },
  ],
  jieQiType: [
    { label: '整日切换', value: 0 },
    { label: '精确分钟', value: 1 },
  ],
  yearGanZhiType: [
    { label: '春节', value: 0 },
    { label: '立春', value: 1 },
    { label: '精确立春', value: 2 },
  ],
  monthGanZhiType: [
    { label: '节交当天', value: 0 },
    { label: '精确节交', value: 1 },
  ],
};

Page({
  data: {
    prefs: preferences.DEFAULTS,
    segments: SEGMENTS,
    daYunChoices: DA_YUN_CHOICES,

    cities: CITIES,
    cityIndex: -1,
    cityDisplay: '未设置（按经度或不启用）',

    cloudReady: false,
    version: '1.0.0',
    statusBarHeight: 20,
  },

  onLoad() {
    const prefs = preferences.read();
    const cityIndex = prefs.defaultCity ? CITIES.indexOf(prefs.defaultCity) : -1;
    const safeArea = getApp().getSafeArea();

    this.setData({
      statusBarHeight: safeArea.statusBarHeight,
      prefs,
      cityIndex,
      cityDisplay: cityIndex >= 0 ? CITIES[cityIndex] : '未设置（按经度或不启用）',
      cloudReady: aiClient.isCloudReady(),
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar();
      if (tabBar) {
        tabBar.setData({ selected: 1 });
      }
    }
  },

  /* ---------------- 偏好项 ---------------- */

  onSelectSegment(event) {
    const { field, value } = event.currentTarget.dataset;
    const numeric = Number(value);
    const next = preferences.patch({ [field]: numeric });
    this.setData({ prefs: next });
  },

  onDaYunChange(event) {
    const index = Number(event.detail.value);
    const next = preferences.patch({ daYunLunShu: index + 6 });
    this.setData({ prefs: next });
  },

  onPickCity(event) {
    const index = Number(event.detail.value);
    const city = CITIES[index];
    const next = preferences.patch({ defaultCity: city });
    this.setData({
      prefs: next,
      cityIndex: index,
      cityDisplay: city,
    });
  },

  onClearCity() {
    const next = preferences.patch({ defaultCity: '' });
    this.setData({
      prefs: next,
      cityIndex: -1,
      cityDisplay: '未设置（按经度或不启用）',
    });
  },

  onToggleHaptic(event) {
    const next = preferences.patch({ haptic: event.detail.value });
    this.setData({ prefs: next });
  },

  /* ---------------- 维护操作 ---------------- */

  onResetPrefs() {
    wx.showModal({
      title: '恢复默认设置',
      content: '会重置全部排盘默认口径与真太阳时城市，不影响已有记录。',
      confirmText: '恢复',
      confirmColor: '#7c4c19',
      success: (res) => {
        if (!res.confirm) return;
        const next = preferences.reset();
        this.setData({
          prefs: next,
          cityIndex: -1,
          cityDisplay: '未设置（按经度或不启用）',
        });
        wx.showToast({ title: '已恢复默认', icon: 'success' });
      },
    });
  },

  onClearCache() {
    wx.showModal({
      title: '清除本地缓存',
      content: '会清空本机保存的全部设置，下次打开恢复初始状态。',
      confirmText: '清除',
      confirmColor: '#8e4334',
      success: (res) => {
        if (!res.confirm) return;
        try {
          wx.clearStorageSync();
        } catch (error) {
          console.error('[我的] 清除缓存失败', error);
        }
        const next = preferences.read();
        this.setData({
          prefs: next,
          cityIndex: -1,
          cityDisplay: '未设置（按经度或不启用）',
        });
        wx.showToast({ title: '缓存已清除', icon: 'success' });
      },
    });
  },

  onCopyDiagnostics() {
    const prefs = this.data.prefs;
    const text = [
      '【玄数排盘 诊断信息】',
      `版本：${this.data.version}`,
      `AI 云环境：${this.data.cloudReady ? '已就绪' : '未配置'}`,
      `年龄口径：${prefs.xuShiSuiType === 1 ? '实岁' : '虚岁'}`,
      `节气口径：${prefs.jieQiType === 1 ? '精确分钟' : '整日切换'}`,
      `年干支：${['春节', '立春', '精确立春'][prefs.yearGanZhiType]}`,
      `月干支：${prefs.monthGanZhiType === 1 ? '精确节交' : '节交当天'}`,
      `大运轮数：${prefs.daYunLunShu}`,
      `默认城市：${prefs.defaultCity || '未设置'}`,
    ].join('\n');

    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '诊断信息已复制', icon: 'success' }),
    });
  },

  onShareAppMessage() {
    return {
      title: '玄数排盘 · 六大体系排盘工作台',
      path: '/pages/index/index',
    };
  },
});
