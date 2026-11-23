/**
 * 视图层通用格式化工具
 * 小程序的 WXML 表达能力有限，复杂的拼接统一在这里算好再交给视图
 */

const EMPTY = '暂无';

/** 过滤空值后用分隔符连接 */
function join(items, separator) {
  const sep = separator === undefined ? ' · ' : separator;
  const values = (items || []).filter(
    (item) => item !== undefined && item !== null && item !== ''
  );
  return values.length ? values.join(sep) : EMPTY;
}

/** 年龄区间文案 */
function range(start, end) {
  if (start === undefined || end === undefined) return EMPTY;
  return `${start} - ${end} 岁`;
}

/** 二维数组拍平去重 */
function unique(groups) {
  const merged = (groups || []).reduce((acc, group) => acc.concat(group || []), []);
  return Array.from(new Set(merged.filter(Boolean)));
}

/** 把 "yyyy-MM-dd HH:mm:ss" 拆成 picker 需要的日期与时间 */
function splitDateTime(value) {
  const matched = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)$/.exec(
    String(value || '').replace(/^L:/, '')
  );
  if (!matched) {
    return { date: '1990-01-01', time: '08:30' };
  }
  return { date: matched[1], time: matched[2].slice(0, 5) };
}

/** 把 picker 的日期与时间拼回排盘引擎要求的字符串 */
function composeDateTime(date, time, isLunar) {
  const safeDate = date || '1990-01-01';
  const safeTime = `${time || '08:30'}:00`.replace(/^(\d{2}:\d{2}):00$/, '$1:00');
  const base = `${safeDate} ${safeTime}`;
  return isLunar ? `L:${stripLeadingZero(base)}` : base;
}

/** 农历口径需要 y-M-d 形式，去掉月日的前导零 */
function stripLeadingZero(value) {
  return value.replace(
    /^(\d{4})-(\d{2})-(\d{2})(.*)$/,
    (_match, year, month, day, rest) => `${year}-${Number(month)}-${Number(day)}${rest}`
  );
}

/** 从完整日期串里取时间部分 */
function timeOf(value) {
  const matched = /(\d{2}:\d{2})/.exec(String(value || ''));
  return matched ? matched[1] : '08:30';
}

module.exports = {
  EMPTY,
  join,
  range,
  unique,
  splitDateTime,
  composeDateTime,
  timeOf,
};
