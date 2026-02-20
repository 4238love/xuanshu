/**
 * 通用工具函数单元测试
 * 测试lib/utils中的工具函数
 */

import {
  getGanZhiIndex,
  getGanZhi,
  getWuXing,
  getNaYin,
  parseDate,
  calculateLiuNian
} from '../../lib/utils/common';

describe('通用工具函数测试', () => {
  describe('干支相关', () => {
    test('getGanZhiIndex - 天干索引', () => {
      expect(getGanZhiIndex('甲')).toBe(0);
      expect(getGanZhiIndex('乙')).toBe(1);
      expect(getGanZhiIndex('癸')).toBe(9);
    });

    test('getGanZhiIndex - 地支索引', () => {
      expect(getGanZhiIndex('子')).toBe(0);
      expect(getGanZhiIndex('丑')).toBe(1);
      expect(getGanZhiIndex('亥')).toBe(11);
    });

    test('getGanZhi - 根据索引获取干支', () => {
      expect(getGanZhi(0)).toBe('甲子');
      expect(getGanZhi(1)).toBe('乙丑');
      expect(getGanZhi(59)).toBe('癸亥');
      expect(getGanZhi(60)).toBe('甲子'); // 循环
    });
  });

  describe('五行相关', () => {
    test('getWuXing - 天干五行', () => {
      expect(getWuXing('甲')).toBe('木');
      expect(getWuXing('乙')).toBe('木');
      expect(getWuXing('丙')).toBe('火');
      expect(getWuXing('丁')).toBe('火');
      expect(getWuXing('戊')).toBe('土');
      expect(getWuXing('己')).toBe('土');
      expect(getWuXing('庚')).toBe('金');
      expect(getWuXing('辛')).toBe('金');
      expect(getWuXing('壬')).toBe('水');
      expect(getWuXing('癸')).toBe('水');
    });

    test('getWuXing - 地支五行', () => {
      expect(getWuXing('寅')).toBe('木');
      expect(getWuXing('卯')).toBe('木');
      expect(getWuXing('巳')).toBe('火');
      expect(getWuXing('午')).toBe('火');
      expect(getWuXing('辰')).toBe('土');
      expect(getWuXing('戌')).toBe('土');
      expect(getWuXing('丑')).toBe('土');
      expect(getWuXing('未')).toBe('土');
      expect(getWuXing('申')).toBe('金');
      expect(getWuXing('酉')).toBe('金');
      expect(getWuXing('亥')).toBe('水');
      expect(getWuXing('子')).toBe('水');
    });
  });

  describe('纳音相关', () => {
    test('getNaYin - 六十甲子纳音', () => {
      expect(getNaYin('甲子')).toBe('海中金');
      expect(getNaYin('乙丑')).toBe('海中金');
      expect(getNaYin('丙寅')).toBe('炉中火');
      expect(getNaYin('丁卯')).toBe('炉中火');
      expect(getNaYin('戊辰')).toBe('大林木');
      expect(getNaYin('己巳')).toBe('大林木');
    });

    test('getNaYin - 所有纳音都有定义', () => {
      const ganZhiList = [];
      for (let i = 0; i < 60; i++) {
        ganZhiList.push(getGanZhi(i));
      }

      ganZhiList.forEach(gz => {
        const nayin = getNaYin(gz);
        expect(nayin).toBeDefined();
        expect(nayin.length).toBeGreaterThan(0);
      });
    });
  });

  describe('日期解析', () => {
    test('parseDate - 标准格式', () => {
      const date = parseDate('2024-01-01 08:30:00');
      expect(date).toBeDefined();
      expect(date.year).toBe(2024);
      expect(date.month).toBe(1);
      expect(date.day).toBe(1);
      expect(date.hour).toBe(8);
      expect(date.minute).toBe(30);
      expect(date.second).toBe(0);
    });

    test('parseDate - 不同格式', () => {
      const date1 = parseDate('2024-1-1 8:30:0');
      expect(date1.year).toBe(2024);
      expect(date1.month).toBe(1);

      const date2 = parseDate('2024/01/01 08:30:00');
      expect(date2.year).toBe(2024);
      expect(date2.month).toBe(1);
    });

    test('parseDate - 错误格式', () => {
      expect(() => {
        parseDate('invalid-date');
      }).toThrow();
    });
  });

  describe('流年计算', () => {
    test('2026年流年干支应为丙午（春节后换年）', () => {
      const liuNian = calculateLiuNian(1990, 2026, 3);
      const current = liuNian.find(item => item.year === 2026);
      expect(current).toBeDefined();
      expect(current?.ganZhi).toBe('丙午');
    });
  });
});
