/**
 * 集成测试 - 八字排盘完整流程
 * 测试从输入到输出的完整流程
 */

import { createBaZiPaiPan } from '../../lib/bazi';
import { BaZiSettings } from '../../types';

describe('八字排盘集成测试', () => {
  test('完整流程测试 - 公历男命', () => {
    const settings: BaZiSettings = {
      name: '张三',
      occupy: '测试',
      sex: 1,
      date: '1990-05-15 10:30:00',
      dateType: 0
    };

    const result = createBaZiPaiPan(settings);

    // 1. 基础信息完整性
    expect(result.name).toBe('张三');
    expect(result.sex).toBe('男');
    expect(result.solar).toContain('1990');
    expect(result.lunar).toBeDefined();

    // 2. 四柱八字完整性
    expect(result.baZi).toHaveLength(4);
    result.baZi.forEach(gz => {
      expect(gz).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });

    // 3. 五行统计正确性
    const wuxingTotal = result.muCount + result.huoCount + result.tuCount +
                        result.jinCount + result.shuiCount;
    expect(wuxingTotal).toBe(8);

    // 4. 十神系统完整性
    if (result.shiShen) {
      expect(result.shiShen.day).toBe('日主');
      expect(['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'])
        .toContain(result.shiShen.year);
    }

    // 5. 大运系统完整性
    if (result.daYun && result.daYun.length > 0) {
      expect(result.qiYunSui).toBeDefined();
      expect(result.currentDaYun).toBeDefined();

      // 验证大运连续性
      for (let i = 0; i < result.daYun.length - 1; i++) {
        expect(result.daYun[i].endAge).toBe(result.daYun[i + 1].startAge);
      }
    }

    // 6. 神煞系统
    if (result.shenSha) {
      expect(result.shenSha).toHaveLength(4);
    }

    // 7. 格局系统
    if (result.geJu) {
      expect(result.geJu.geJuName).toBeDefined();
      expect(result.geJu.yongShen).toBeDefined();
      expect(result.geJu.xiShen).toBeDefined();
    }
  });

  test('完整流程测试 - 农历女命', () => {
    const settings: BaZiSettings = {
      name: '李四',
      sex: 0,
      date: '1985-10-15 14:20:00',
      dateType: 1
    };

    const result = createBaZiPaiPan(settings);

    expect(result.name).toBe('李四');
    expect(result.sex).toBe('女');
    expect(result.baZi).toHaveLength(4);
    expect(result.lunar).toContain('1985');
  });

  test('边界测试 - 子时前后', () => {
    // 23:00-23:59 应该算作次日子时
    const settings1: BaZiSettings = {
      name: '测试',
      sex: 1,
      date: '2024-01-01 23:30:00',
      dateType: 0
    };

    const result1 = createBaZiPaiPan(settings1);
    expect(result1.hourZhi).toBe('子');

    // 00:00-00:59 也是子时
    const settings2: BaZiSettings = {
      name: '测试',
      sex: 1,
      date: '2024-01-01 00:30:00',
      dateType: 0
    };

    const result2 = createBaZiPaiPan(settings2);
    expect(result2.hourZhi).toBe('子');
  });

  test('性能测试 - 批量排盘', () => {
    const startTime = Date.now();
    const count = 100;

    for (let i = 0; i < count; i++) {
      const settings: BaZiSettings = {
        name: `测试${i}`,
        sex: i % 2,
        date: `${1990 + (i % 30)}-${(i % 12) + 1}-${(i % 28) + 1} ${(i % 24)}:00:00`,
        dateType: 0
      };

      const result = createBaZiPaiPan(settings);
      expect(result).toBeDefined();
    }

    const endTime = Date.now();
    const avgTime = (endTime - startTime) / count;

    console.log(`批量排盘${count}次，平均耗时: ${avgTime.toFixed(2)}ms`);
    expect(avgTime).toBeLessThan(100); // 平均每次应该小于100ms
  });
});
