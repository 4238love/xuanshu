/**
 * 六爻排盘单元测试
 * 测试六爻排盘的核心功能
 */

import { createLiuYaoPaiPan } from '../../lib/liuyao';
import { LiuYaoSettings } from '../../types';
import { TEST_CONFIG } from '../test.config';

describe('六爻排盘单元测试', () => {
  const testCases = TEST_CONFIG.testCases.liuyao;

  testCases.forEach((testCase) => {
    test(`${testCase.name} - 基础排盘`, () => {
      const result = createLiuYaoPaiPan(testCase.settings);

      // 验证基础字段
      expect(result).toBeDefined();
      expect(result.benGua).toBeDefined();
      expect(result.bianGua).toBeDefined();
      expect(result.shangGua).toBeDefined();
      expect(result.xiaGua).toBeDefined();

      // 验证卦象符号
      expect(result.benGuaAs).toBeDefined();
      expect(result.bianGuaAs).toBeDefined();
      expect(result.huGuaAs).toBeDefined();
      expect(result.cuoGuaAs).toBeDefined();
      expect(result.zongGuaAs).toBeDefined();
    });

    test(`${testCase.name} - 六爻详情`, () => {
      const result = createLiuYaoPaiPan(testCase.settings);

      expect(result.liuYao).toBeDefined();
      expect(result.liuYao.benGua).toBeDefined();
      expect(result.liuYao.bianGua).toBeDefined();

      // 验证本卦六爻
      const benGua = result.liuYao.benGua;
      expect(benGua.yaoMing).toHaveLength(6);
      expect(benGua.yaoAs).toHaveLength(6);
      expect(benGua.ganZhi).toHaveLength(6);
      expect(benGua.wuXing).toHaveLength(6);
      expect(benGua.naYin).toHaveLength(6);
      expect(benGua.liuQin).toHaveLength(6);
      expect(benGua.liuShen).toHaveLength(6);

      // 验证世应
      const shiYingCount = benGua.shiYing.filter(sy => sy === '世' || sy === '应').length;
      expect(shiYingCount).toBe(2);
    });

    test(`${testCase.name} - 四柱干支`, () => {
      const result = createLiuYaoPaiPan(testCase.settings);

      expect(result.ganZhi).toBeDefined();
      expect(result.ganZhi.year).toBeDefined();
      expect(result.ganZhi.month).toBeDefined();
      expect(result.ganZhi.day).toBeDefined();
      expect(result.ganZhi.hour).toBeDefined();
    });

    test(`${testCase.name} - 神煞系统`, () => {
      const result = createLiuYaoPaiPan(testCase.settings);

      if (result.shenSha) {
        expect(result.shenSha.year).toBeDefined();
        expect(result.shenSha.month).toBeDefined();
        expect(result.shenSha.day).toBeDefined();
        expect(result.shenSha.hour).toBeDefined();
      }
    });

    test(`${testCase.name} - 空亡`, () => {
      const result = createLiuYaoPaiPan(testCase.settings);

      if (result.kongWang) {
        expect(Array.isArray(result.kongWang)).toBe(true);
        expect(result.kongWang).toHaveLength(2);
      }
    });
  });

  test('手动起卦 - 验证爻数', () => {
    const manualSettings: LiuYaoSettings = {
      name: '测试',
      occupy: '测试',
      sex: 1,
      date: '2024-01-01 08:00:00',
      dateType: 0,
      paiPanType: 2,
      manualYaoShu: [0, 1, 2, 3, 0, 1]
    };

    const result = createLiuYaoPaiPan(manualSettings);
    expect(result).toBeDefined();

    // 验证动爻
    const dongYao = result.liuYao.benGua.yaoAsMark.filter(mark => mark === '○' || mark === '×');
    expect(dongYao.length).toBeGreaterThan(0);
  });

  test('错误处理 - 缺少占事', () => {
    const invalidSettings: LiuYaoSettings = {
      name: '测试',
      occupy: '',
      sex: 1,
      date: '2024-01-01 08:00:00',
      dateType: 0,
      paiPanType: 1
    };

    // 占事为空应该仍然可以排盘,只是可能有警告
    expect(() => {
      createLiuYaoPaiPan(invalidSettings);
    }).not.toThrow();
  });
});
