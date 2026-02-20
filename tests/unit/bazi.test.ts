/**
 * 八字排盘单元测试
 * 测试八字排盘的核心功能
 */

import { createBaZiPaiPan } from '../../lib/bazi';
import { BaZiSettings } from '../../types';
import { TEST_CONFIG } from '../test.config';

describe('八字排盘单元测试', () => {
  const testCases = TEST_CONFIG.testCases.bazi;

  testCases.forEach((testCase) => {
    test(`${testCase.name} - 基础排盘`, () => {
      const result = createBaZiPaiPan(testCase.settings);

      // 验证基础字段
      expect(result).toBeDefined();
      expect(result.baZi).toHaveLength(4);
      expect(result.baZiWuXing).toHaveLength(4);
      expect(result.baZiNaYin).toHaveLength(4);

      // 验证干支
      expect(result.yearGan).toBeDefined();
      expect(result.yearZhi).toBeDefined();
      expect(result.monthGan).toBeDefined();
      expect(result.monthZhi).toBeDefined();
      expect(result.dayGan).toBeDefined();
      expect(result.dayZhi).toBeDefined();
      expect(result.hourGan).toBeDefined();
      expect(result.hourZhi).toBeDefined();

      // 验证五行统计
      expect(typeof result.muCount).toBe('number');
      expect(typeof result.huoCount).toBe('number');
      expect(typeof result.tuCount).toBe('number');
      expect(typeof result.jinCount).toBe('number');
      expect(typeof result.shuiCount).toBe('number');

      // 验证总数为8
      const total = result.muCount + result.huoCount + result.tuCount + result.jinCount + result.shuiCount;
      expect(total).toBe(8);
    });

    test(`${testCase.name} - 十神系统`, () => {
      const result = createBaZiPaiPan(testCase.settings);

      if (result.shiShen) {
        expect(result.shiShen.year).toBeDefined();
        expect(result.shiShen.month).toBeDefined();
        expect(result.shiShen.day).toBe('日主');
        expect(result.shiShen.hour).toBeDefined();
      }
    });

    test(`${testCase.name} - 神煞系统`, () => {
      const result = createBaZiPaiPan(testCase.settings);

      if (result.shenSha) {
        expect(Array.isArray(result.shenSha)).toBe(true);
        expect(result.shenSha).toHaveLength(4);
      }
    });

    test(`${testCase.name} - 大运流年`, () => {
      const result = createBaZiPaiPan(testCase.settings);

      if (result.daYun) {
        expect(Array.isArray(result.daYun)).toBe(true);
        expect(result.daYun.length).toBeGreaterThan(0);

        // 验证大运结构
        result.daYun.forEach(dy => {
          expect(dy.ganZhi).toBeDefined();
          expect(dy.startAge).toBeDefined();
          expect(dy.endAge).toBeDefined();
          expect(dy.startAge).toBeLessThan(dy.endAge);
        });
      }
    });
  });

  test('错误处理 - 无效日期', () => {
    const invalidSettings: BaZiSettings = {
      name: '测试',
      sex: 1,
      date: 'invalid-date',
      dateType: 0
    };

    expect(() => {
      createBaZiPaiPan(invalidSettings);
    }).toThrow();
  });
});
