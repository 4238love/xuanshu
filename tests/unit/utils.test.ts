import {
  calculateLiuNian,
  getGanZhi,
  getGanZhiIndex,
  getNaYin,
  getWuXing,
  parseDate,
} from '../../lib/utils/common';
import {
  convertDateValue,
  normalizeDateValue,
  parseLunarDateTimeString,
} from '../../lib/utils/dateTime';

describe('通用工具函数测试', () => {
  describe('干支相关', () => {
    test('getGanZhiIndex 返回正确索引', () => {
      expect(getGanZhiIndex('甲', '子')).toBe(0);
      expect(getGanZhiIndex('乙', '丑')).toBe(1);
      expect(getGanZhiIndex('癸', '亥')).toBe(59);
      expect(getGanZhiIndex('庚', '戌')).toBe(46);
    });

    test('getGanZhi 支持 60 甲子循环', () => {
      expect(getGanZhi(0)).toBe('甲子');
      expect(getGanZhi(1)).toBe('乙丑');
      expect(getGanZhi(59)).toBe('癸亥');
      expect(getGanZhi(60)).toBe('甲子');
    });
  });

  describe('五行和纳音', () => {
    test('getWuXing 返回正确五行', () => {
      expect(getWuXing('甲')).toBe('木');
      expect(getWuXing('丙')).toBe('火');
      expect(getWuXing('戊')).toBe('土');
      expect(getWuXing('庚')).toBe('金');
      expect(getWuXing('壬')).toBe('水');
      expect(getWuXing('寅')).toBe('木');
      expect(getWuXing('午')).toBe('火');
      expect(getWuXing('辰')).toBe('土');
      expect(getWuXing('酉')).toBe('金');
      expect(getWuXing('子')).toBe('水');
    });

    test('getNaYin 返回正确纳音', () => {
      expect(getNaYin('甲子')).toBe('海中金');
      expect(getNaYin('乙丑')).toBe('海中金');
      expect(getNaYin('丙寅')).toBe('炉中火');
      expect(getNaYin('丁卯')).toBe('炉中火');
      expect(getNaYin('戊辰')).toBe('大林木');
      expect(getNaYin('己巳')).toBe('大林木');
    });
  });

  describe('日期解析', () => {
    test('parseDate 严格返回 Date 对象', () => {
      const date = parseDate('2024-01-01 08:30:00');

      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth() + 1).toBe(1);
      expect(date.getDate()).toBe(1);
      expect(date.getHours()).toBe(8);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(0);
    });

    test('parseDate 支持斜杠和非补零格式', () => {
      const date1 = parseDate('2024-1-1 8:30:0');
      const date2 = parseDate('2024/01/01 08:30:00');

      expect(date1.getFullYear()).toBe(2024);
      expect(date1.getMonth() + 1).toBe(1);
      expect(date2.getFullYear()).toBe(2024);
      expect(date2.getMonth() + 1).toBe(1);
    });

    test('parseDate 对非法格式直接抛错', () => {
      expect(() => parseDate('invalid-date')).toThrow('日期格式无效');
      expect(() => parseDate('2024-02-30 08:30:00')).toThrow('日期时间无效');
    });

    test('normalizeDateValue 会输出规范化公历字符串', () => {
      expect(normalizeDateValue('2024-1-2 3:4:5', 0)).toBe('2024-01-02 03:04:05');
    });

    test('农历字符串支持闰月标记与公农历互转', () => {
      const leapLunar = 'L:2020-4-2 08:00:00-R';
      const lunarParts = parseLunarDateTimeString(leapLunar);

      expect(lunarParts).toEqual({
        year: 2020,
        month: 4,
        day: 2,
        hour: 8,
        minute: 0,
        second: 0,
        isLeap: true,
      });
      expect(normalizeDateValue(leapLunar, 1)).toBe('L:2020-4-2 08:00:00-R');

      const solarValue = convertDateValue(leapLunar, 1, 0);
      expect(solarValue).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(convertDateValue(solarValue, 0, 1)).toContain('L:');
    });
  });

  describe('流年计算', () => {
    test('2026 年流年干支按立春后为丙午', () => {
      const liuNian = calculateLiuNian(1990, 2026, 3);
      const current = liuNian.find((item) => item.year === 2026);

      expect(current).toBeDefined();
      expect(current?.ganZhi).toBe('丙午');
    });
  });
});
