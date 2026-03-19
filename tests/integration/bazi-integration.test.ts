import { createBaZiPaiPan } from '../../lib/bazi';
import { BaZiSettings } from '../../types';

describe('八字排盘集成测试', () => {
  test('完整流程测试 - 公历男命', () => {
    const settings: BaZiSettings = {
      name: '张三',
      occupy: '测试',
      sex: 1,
      date: '1990-05-15 10:30:00',
      dateType: 0,
    };

    const result = createBaZiPaiPan(settings);

    expect(result.name).toBe('张三');
    expect(result.sex).toBe('男');
    expect(result.solar).toContain('1990');
    expect(typeof result.lunar).toBe('string');
    expect(result.lunar).toContain('年');

    expect(result.baZi).toHaveLength(4);
    result.baZi.forEach((ganZhi) => {
      expect(ganZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });

    const wuxingTotal = result.muCount + result.huoCount + result.tuCount + result.jinCount + result.shuiCount;
    expect(wuxingTotal).toBe(8);

    if (result.shiShen) {
      expect(result.shiShen.day).toBe('日主');
      expect([
        '比肩',
        '劫财',
        '食神',
        '伤官',
        '偏财',
        '正财',
        '七杀',
        '正官',
        '偏印',
        '正印',
      ]).toContain(result.shiShen.year);
    }

    if (result.daYun && result.daYun.length > 0) {
      expect(result.qiYunSui).toBeGreaterThan(0);
      expect(result.qiYunDate).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result.currentDaYun).toBeDefined();

      for (let index = 0; index < result.daYun.length - 1; index += 1) {
        expect(result.daYun[index].endAge + 1).toBe(result.daYun[index + 1].startAge);
      }
    }

    if (result.shenSha) {
      expect(result.shenSha).toHaveLength(4);
    }

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
      dateType: 1,
    };

    const result = createBaZiPaiPan(settings);

    expect(result.name).toBe('李四');
    expect(result.sex).toBe('女');
    expect(result.baZi).toHaveLength(4);
    expect(result.solar).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    expect(result.lunar).toContain('年');
  });

  test('完整流程测试 - 闰月女命', () => {
    const leapSettings: BaZiSettings = {
      name: '闰月命例',
      sex: 0,
      date: 'L:2020-4-2 08:00:00-R',
      dateType: 1,
    };

    const regularSettings: BaZiSettings = {
      ...leapSettings,
      date: 'L:2020-4-2 08:00:00',
    };

    const leapResult = createBaZiPaiPan(leapSettings);
    const regularResult = createBaZiPaiPan(regularSettings);

    expect(leapResult.solar).not.toBe(regularResult.solar);
    expect(leapResult.lunar).toContain('闰');
  });

  test('边界测试 - 子时前后', () => {
    const lateZiHourSettings: BaZiSettings = {
      name: '测试',
      sex: 1,
      date: '2024-01-01 23:30:00',
      dateType: 0,
    };

    const earlyZiHourSettings: BaZiSettings = {
      name: '测试',
      sex: 1,
      date: '2024-01-01 00:30:00',
      dateType: 0,
    };

    const lateZiHour = createBaZiPaiPan(lateZiHourSettings);
    const earlyZiHour = createBaZiPaiPan(earlyZiHourSettings);

    expect(lateZiHour.hourZhi).toBe('子');
    expect(earlyZiHour.hourZhi).toBe('子');
  });

  test('性能测试 - 批量排盘', () => {
    const startTime = Date.now();
    const count = 100;

    for (let index = 0; index < count; index += 1) {
      const settings: BaZiSettings = {
        name: `测试${index}`,
        sex: (index % 2) as 0 | 1,
        date: `${1990 + (index % 30)}-${(index % 12) + 1}-${(index % 28) + 1} ${index % 24}:00:00`,
        dateType: 0,
      };

      expect(createBaZiPaiPan(settings)).toBeDefined();
    }

    const avgTime = (Date.now() - startTime) / count;
    expect(avgTime).toBeLessThan(100);
  });
});
