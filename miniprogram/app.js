/**
 * 玄数排盘 · 小程序入口
 *
 * 云开发用于承载 AI 批注（模型 Key 存在云函数环境变量里，不下发到客户端）。
 * 未开通云环境时自动降级，排盘功能不受影响。
 */

const CLOUD_ENV = ''; // 填入云开发环境 ID；留空则不启用云能力

App({
  globalData: {
    cloudEnabled: false,
    cloudEnv: CLOUD_ENV,
    /** 与 Web 端一致的默认排盘参数，供各排盘页复用 */
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
      showDaYunShenSha: false,
      showLiuNianShenSha: false,
    },
    /** 跨页传递排盘结果用（页面栈参数不适合传大对象） */
    handoff: null,
  },

  onLaunch() {
    if (!wx.cloud) {
      console.warn('[玄数排盘] 当前基础库不支持云开发，AI 批注功能不可用');
      return;
    }
    if (!CLOUD_ENV) {
      console.info('[玄数排盘] 未配置云环境 ID，AI 批注功能待配置');
      return;
    }
    try {
      wx.cloud.init({ env: CLOUD_ENV, traceUser: true });
      this.globalData.cloudEnabled = true;
    } catch (error) {
      console.error('[玄数排盘] 云开发初始化失败', error);
    }
  },

  /** 供包内页面读取系统信息，做安全区适配 */
  getSafeArea() {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    return {
      top: info.safeArea ? info.safeArea.top : 0,
      bottom: info.safeArea ? info.safeArea.bottom : info.screenHeight,
      statusBarHeight: info.statusBarHeight || 20,
      screenHeight: info.screenHeight,
      screenWidth: info.windowWidth || info.screenWidth || 375,
    };
  },
});
