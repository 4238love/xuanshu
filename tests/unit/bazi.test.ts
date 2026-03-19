import { Solar } from 'lunar-javascript';
import { createBaZiPaiPan } from '../../lib/bazi';
import { REN_YUAN_TABLES } from '../../lib/bazi/baziMaps';
import { TIAN_GAN_WU_XING, YUE_JIANG } from '../../lib/liuyao/liuyaoMaps';
import { BaZiSettings } from '../../types';
import { TEST_CONFIG } from '../test.config';

function buildSettings(patch: Partial<BaZiSettings>): BaZiSettings {
  return {
    name: '测试',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
    ...patch,
  };
}

function solarFromDateTime(value: string) {
  const [datePart, timePart] = value.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return Solar.fromDate(new Date(year, month - 1, day, hour, minute, second));
}

describe('八字排盘单元测试', () => {
  const testCases = TEST_CONFIG.testCases.bazi;

  testCases.forEach((testCase) => {
    test(`${testCase.name} - 基础排盘`, () => {
      const result = createBaZiPaiPan(testCase.settings);

      expect(result).toBeDefined();
      expect(result.baZi).toHaveLength(4);
      expect(result.baZiWuXing).toHaveLength(4);
      expect(result.baZiNaYin).toHaveLength(4);

      expect(result.yearGan).toBeDefined();
      expect(result.yearZhi).toBeDefined();
      expect(result.monthGan).toBeDefined();
      expect(result.monthZhi).toBeDefined();
      expect(result.dayGan).toBeDefined();
      expect(result.dayZhi).toBeDefined();
      expect(result.hourGan).toBeDefined();
      expect(result.hourZhi).toBeDefined();

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

    test(`${testCase.name} - 大运流年`, () => {
      const result = createBaZiPaiPan(testCase.settings);

      if (result.daYun) {
        expect(result.qiYunSui).toBeGreaterThan(0);
        expect(result.qiYunDate).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
        expect(result.daYun.length).toBeGreaterThan(0);

        result.daYun.forEach((daYun) => {
          expect(daYun.ganZhi).toBeDefined();
          expect(daYun.startAge).toBeGreaterThan(0);
          expect(daYun.endAge).toBeGreaterThanOrEqual(daYun.startAge);
        });
      }
    });
  });

  test('错误处理 - 无效公历日期会抛错', () => {
    const invalidSettings: BaZiSettings = {
      name: '测试',
      sex: 1,
      date: 'invalid-date',
      dateType: 0,
    };

    expect(() => createBaZiPaiPan(invalidSettings)).toThrow('日期');
  });

  test('支持闰月农历出生，不会和同月平月算成同一张命盘', () => {
    const leapMonthSettings: BaZiSettings = {
      name: '闰月测试',
      sex: 0,
      date: 'L:2020-4-2 08:00:00-R',
      dateType: 1,
    };

    const regularMonthSettings: BaZiSettings = {
      ...leapMonthSettings,
      date: 'L:2020-4-2 08:00:00',
    };

    const leapResult = createBaZiPaiPan(leapMonthSettings);
    const regularResult = createBaZiPaiPan(regularMonthSettings);

    expect(leapResult.solar).not.toBe(regularResult.solar);
    expect(leapResult.baZi.join('')).not.toBe(regularResult.baZi.join(''));
  });

  test('yearGanZhiType 会影响主排盘年柱', () => {
    const date = '2024-02-04 10:00:00';
    const lunar = solarFromDateTime(date).getLunar() as any;

    const byLiChunDay = createBaZiPaiPan(buildSettings({
      date,
      yearGanZhiType: 1,
    }));
    const byLiChunExact = createBaZiPaiPan(buildSettings({
      date,
      yearGanZhiType: 2,
    }));

    expect(byLiChunDay.baZi[0]).toBe(lunar.getYearInGanZhiByLiChun());
    expect(byLiChunExact.baZi[0]).toBe(lunar.getYearInGanZhiExact());
    expect(byLiChunDay.baZi[0]).not.toBe(byLiChunExact.baZi[0]);
  });

  test('monthGanZhiType 会影响主排盘月柱', () => {
    const date = '2024-02-04 10:00:00';
    const lunar = solarFromDateTime(date).getLunar() as any;

    const byDay = createBaZiPaiPan(buildSettings({
      date,
      monthGanZhiType: 0,
    }));
    const byExact = createBaZiPaiPan(buildSettings({
      date,
      monthGanZhiType: 1,
    }));

    expect(byDay.baZi[1]).toBe(lunar.getMonthInGanZhi());
    expect(byExact.baZi[1]).toBe(lunar.getMonthInGanZhiExact());
    expect(byDay.baZi[1]).not.toBe(byExact.baZi[1]);
  });

  test('jieQiType 会影响节气信息和月将', () => {
    const date = '2024-02-19 10:00:00';
    const lunar = solarFromDateTime(date).getLunar() as any;

    const byDay = createBaZiPaiPan(buildSettings({
      date,
      jieQiType: 0,
    }));
    const byMinute = createBaZiPaiPan(buildSettings({
      date,
      jieQiType: 1,
    }));

    const byDayKey = `${lunar.getPrevQi(true).toString()}${lunar.getNextQi(true).toString()}`;
    const byMinuteKey = `${lunar.getPrevQi(false).toString()}${lunar.getNextQi(false).toString()}`;

    expect(byDay.jieQiInfo?.prev).toBe(lunar.getPrevJie(true).toString());
    expect(byMinute.jieQiInfo?.prev).toBe(lunar.getPrevJie(false).toString());
    expect(byDay.yueJiang).toEqual({
      yueJiang: YUE_JIANG[byDayKey][0],
      yueJiangShen: YUE_JIANG[byDayKey][1],
    });
    expect(byMinute.yueJiang).toEqual({
      yueJiang: YUE_JIANG[byMinuteKey][0],
      yueJiangShen: YUE_JIANG[byMinuteKey][1],
    });
    expect(byDay.yueJiang).not.toEqual(byMinute.yueJiang);
  });

  test('renYuanType 会影响人元司令分野', () => {
    const date = '2024-02-08 12:00:00';
    const solar = solarFromDateTime(date);
    const lunar = solar.getLunar() as any;
    const birthDate = new Date(2024, 1, 8, 12, 0, 0);
    const prevJieDateText = lunar.getPrevJie(false).getSolar().toYmdHms();
    const [prevDatePart, prevTimePart] = prevJieDateText.split(' ');
    const [prevYear, prevMonth, prevDay] = prevDatePart.split('-').map(Number);
    const [prevHour, prevMinute, prevSecond] = prevTimePart.split(':').map(Number);
    const prevJieDate = new Date(prevYear, prevMonth - 1, prevDay, prevHour, prevMinute, prevSecond);
    const rawDayIndex = Math.floor((birthDate.getTime() - prevJieDate.getTime()) / (24 * 60 * 60 * 1000));
    const dayIndex = rawDayIndex < 0 || rawDayIndex > 29 ? 1 : rawDayIndex;

    const ziPing = createBaZiPaiPan(buildSettings({
      date,
      renYuanType: 0,
    }));
    const wanYu = createBaZiPaiPan(buildSettings({
      date,
      renYuanType: 5,
    }));

    const ziPingGan = REN_YUAN_TABLES[0][ziPing.monthZhi][dayIndex];
    const wanYuGan = REN_YUAN_TABLES[5][wanYu.monthZhi][dayIndex];

    expect(ziPing.renYuanSiLingFenYe).toBe(`${ziPingGan}${TIAN_GAN_WU_XING[ziPingGan]}值令`);
    expect(wanYu.renYuanSiLingFenYe).toBe(`${wanYuGan}${TIAN_GAN_WU_XING[wanYuGan]}值令`);
    expect(ziPing.renYuanSiLingFenYe).not.toBe(wanYu.renYuanSiLingFenYe);
  });
});
