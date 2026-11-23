/**
 * 用户偏好（本地存储）
 *
 * 「我的」页面改的就是这里，八字等排盘页在 onLoad 时读取，
 * 保证新开的排盘默认就用用户上次设定的口径。
 */

const STORAGE_KEY = 'xuanshu.preferences.v1';

const DEFAULTS = {
  xuShiSuiType: 1, // 0 虚岁 / 1 实岁
  jieQiType: 1, // 0 整日切换 / 1 精确分钟
  yearGanZhiType: 2, // 0 春节 / 1 立春 / 2 精确立春
  monthGanZhiType: 1, // 0 节交当天 / 1 精确节交
  daYunLunShu: 10, // 6 - 16
  defaultCity: '', // 真太阳时默认城市
  haptic: true, // 排盘完成后是否震动反馈
};

function clampNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const intValue = Math.round(parsed);
  if (intValue < min) return min;
  if (intValue > max) return max;
  return intValue;
}

function sanitize(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const result = Object.assign({}, DEFAULTS);

  result.xuShiSuiType = Number(source.xuShiSuiType) === 0 ? 0 : 1;
  result.jieQiType = Number(source.jieQiType) === 0 ? 0 : 1;
  const yearType = Number(source.yearGanZhiType);
  result.yearGanZhiType = yearType === 0 || yearType === 1 ? yearType : 2;
  result.monthGanZhiType = Number(source.monthGanZhiType) === 0 ? 0 : 1;
  result.daYunLunShu = clampNumber(source.daYunLunShu, DEFAULTS.daYunLunShu, 6, 16);
  result.defaultCity = typeof source.defaultCity === 'string' ? source.defaultCity : '';
  result.haptic = source.haptic !== false;

  return result;
}

function read() {
  try {
    const stored = wx.getStorageSync(STORAGE_KEY);
    return sanitize(stored);
  } catch (error) {
    console.warn('[偏好] 读取失败，回退默认值', error);
    return sanitize(null);
  }
}

function write(next) {
  const sanitized = sanitize(next);
  try {
    wx.setStorageSync(STORAGE_KEY, sanitized);
  } catch (error) {
    console.error('[偏好] 写入失败', error);
  }
  return sanitized;
}

/** 局部更新 */
function patch(partial) {
  const merged = Object.assign({}, read(), partial);
  return write(merged);
}

function reset() {
  try {
    wx.removeStorageSync(STORAGE_KEY);
  } catch (error) {
    console.error('[偏好] 重置失败', error);
  }
  return sanitize(null);
}

/** 映射成 BaZiSettings 可用的默认值 */
function toBaziDefaults(prefs) {
  const source = prefs || read();
  return {
    xuShiSuiType: source.xuShiSuiType,
    jieQiType: source.jieQiType,
    yearGanZhiType: source.yearGanZhiType,
    monthGanZhiType: source.monthGanZhiType,
    daYunLunShu: source.daYunLunShu,
    city: source.defaultCity,
  };
}

module.exports = {
  STORAGE_KEY,
  DEFAULTS,
  read,
  write,
  patch,
  reset,
  toBaziDefaults,
};
