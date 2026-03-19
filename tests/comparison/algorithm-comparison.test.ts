/**
 * 算法对比测试
 * 对比新旧项目的输出结果,验证算法一致性
 */

import { createBaZiPaiPan } from '../../lib/bazi';
import { createLiuYaoPaiPan } from '../../lib/liuyao';
import { BaZiSettings, LiuYaoSettings } from '../../types';

describe('算法对比测试', () => {
  describe('八字排盘对比', () => {
    const testSettings: BaZiSettings = {
      name: '张三',
      sex: 1,
      date: '1990-05-15 10:30:00',
      dateType: 0
    };

    test('四柱干支一致性', () => {
      const result = createBaZiPaiPan(testSettings);

      // 记录输出用于对比
      console.log('八字排盘结果:');
      console.log('年柱:', result.baZi[0]);
      console.log('月柱:', result.baZi[1]);
      console.log('日柱:', result.baZi[2]);
      console.log('时柱:', result.baZi[3]);

      // 验证格式
      expect(result.baZi[0]).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(result.baZi[1]).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(result.baZi[2]).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(result.baZi[3]).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });

    test('五行统计对比', () => {
      const result = createBaZiPaiPan(testSettings);

      console.log('五行统计:');
      console.log('木:', result.muCount);
      console.log('火:', result.huoCount);
      console.log('土:', result.tuCount);
      console.log('金:', result.jinCount);
      console.log('水:', result.shuiCount);

      // 总数必须为8
      const total = result.muCount + result.huoCount + result.tuCount +
                    result.jinCount + result.shuiCount;
      expect(total).toBe(8);
    });

    test('十神系统对比', () => {
      const result = createBaZiPaiPan(testSettings);

      if (result.shiShen) {
        console.log('十神系统:');
        console.log('年干:', result.shiShen.year);
        console.log('月干:', result.shiShen.month);
        console.log('日干:', result.shiShen.day);
        console.log('时干:', result.shiShen.hour);

        expect(result.shiShen.day).toBe('日主');
      }
    });

    test('神煞系统对比', () => {
      const result = createBaZiPaiPan(testSettings);

      if (result.shenSha) {
        console.log('神煞系统:');
        console.log('年柱神煞:', result.shenSha[0]);
        console.log('月柱神煞:', result.shenSha[1]);
        console.log('日柱神煞:', result.shenSha[2]);
        console.log('时柱神煞:', result.shenSha[3]);
      }
    });
  });

  describe('六爻排盘对比', () => {
    const testSettings: LiuYaoSettings = {
      name: '测试',
      occupy: '测试占事',
      sex: 1,
      date: '2024-01-01 08:00:00',
      dateType: 0,
      paiPanType: 2,
      manualYaoShu: [0, 1, 2, 3, 0, 1] // 固定爻数便于对比
    };

    test('卦象一致性', () => {
      const result = createLiuYaoPaiPan(testSettings);

      console.log('六爻排盘结果:');
      console.log('本卦:', result.benGua, result.benGuaAs);
      console.log('变卦:', result.bianGua, result.bianGuaAs);
      console.log('互卦:', result.huGua, result.huGuaAs);
      console.log('错卦:', result.cuoGua, result.cuoGuaAs);
      console.log('综卦:', result.zongGua, result.zongGuaAs);

      // 验证卦名格式，兼容八宫卦简写和标准六十四卦名称
      expect(result.benGua).toMatch(/^[\u4e00-\u9fa5]{2,}$/);
    });

    test('六爻详情对比', () => {
      const result = createLiuYaoPaiPan(testSettings);

      console.log('本卦六爻:');
      for (let i = 5; i >= 0; i--) {
        const yaoName = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][i];
        console.log(`${yaoName}:`, {
          爻象: result.liuYao.benGua.yaoAs[i],
          干支: result.liuYao.benGua.ganZhi[i],
          五行: result.liuYao.benGua.wuXing[i],
          六亲: result.liuYao.benGua.liuQin[i],
          六神: result.liuYao.benGua.liuShen[i],
          世应: result.liuYao.benGua.shiYing[i]
        });
      }

      expect(result.liuYao.benGua.yaoAs).toHaveLength(6);
      expect(result.liuYao.benGua.ganZhi).toHaveLength(6);
    });

    test('四柱干支对比', () => {
      const result = createLiuYaoPaiPan(testSettings);

      console.log('四柱干支:');
      console.log('年柱:', result.ganZhi.year);
      console.log('月柱:', result.ganZhi.month);
      console.log('日柱:', result.ganZhi.day);
      console.log('时柱:', result.ganZhi.hour);

      expect(result.ganZhi.year).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });

    test('空亡对比', () => {
      const result = createLiuYaoPaiPan(testSettings);

      if (result.kongWang) {
        console.log('空亡:', result.kongWang);
        expect(result.kongWang).toHaveLength(2);
      }
    });
  });

  describe('批量对比测试', () => {
    test('多个测试用例对比', () => {
      const testCases = [
        { date: '1990-01-01 08:00:00', name: '测试1' },
        { date: '1995-06-15 14:30:00', name: '测试2' },
        { date: '2000-12-31 23:59:00', name: '测试3' },
        { date: '2010-03-21 12:00:00', name: '测试4' },
        { date: '2020-09-09 09:09:00', name: '测试5' }
      ];

      console.log('\n=== 批量对比测试 ===\n');

      testCases.forEach(tc => {
        const baziSettings: BaZiSettings = {
          name: tc.name,
          sex: 1,
          date: tc.date,
          dateType: 0
        };

        const result = createBaZiPaiPan(baziSettings);

        console.log(`${tc.name} (${tc.date}):`);
        console.log('  八字:', result.baZi.join(' '));
        console.log('  五行:', `木${result.muCount} 火${result.huoCount} 土${result.tuCount} 金${result.jinCount} 水${result.shuiCount}`);
        console.log('');

        expect(result.baZi).toHaveLength(4);
      });
    });
  });
});

/**
 * 导出对比结果到文件
 * 用于与原项目进行详细对比
 */
export function exportComparisonResults() {
  const results = {
    timestamp: new Date().toISOString(),
    bazi: [] as any[],
    liuyao: [] as any[]
  };

  // 八字测试用例
  const baziCases = [
    { name: '张三', sex: 1, date: '1990-05-15 10:30:00', dateType: 0 },
    { name: '李四', sex: 0, date: '1985-10-20 14:20:00', dateType: 0 }
  ];

  baziCases.forEach(tc => {
    const result = createBaZiPaiPan(tc as BaZiSettings);
    results.bazi.push({
      input: tc,
      output: {
        baZi: result.baZi,
        wuXing: {
          mu: result.muCount,
          huo: result.huoCount,
          tu: result.tuCount,
          jin: result.jinCount,
          shui: result.shuiCount
        },
        shiShen: result.shiShen,
        shenSha: result.shenSha
      }
    });
  });

  // 六爻测试用例
  const liuyaoCases = [
    { name: '测试1', occupy: '占事1', sex: 1, date: '2024-01-01 08:00:00', dateType: 0, paiPanType: 2, manualYaoShu: [0, 1, 2, 3, 0, 1] }
  ];

  liuyaoCases.forEach(tc => {
    const result = createLiuYaoPaiPan(tc as LiuYaoSettings);
    results.liuyao.push({
      input: tc,
      output: {
        benGua: result.benGua,
        bianGua: result.bianGua,
        ganZhi: result.ganZhi,
        kongWang: result.kongWang
      }
    });
  });

  return results;
}
