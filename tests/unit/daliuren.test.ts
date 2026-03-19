import { createDaLiuRenPaiPan } from '../../lib/daliuren';
import { SAN_CHUAN } from '../../lib/daliuren/generatedMaps';
import { DaLiuRenSettings } from '../../types';

describe('大六壬重构单元测试', () => {
  const baseSettings: DaLiuRenSettings = {
    name: '测试',
    occupy: '测试事项',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
  };

  test('返回完整的大六壬结果结构', () => {
    const result = createDaLiuRenPaiPan(baseSettings);

    expect(result).toBeDefined();
    expect(result.diPan).toHaveLength(12);
    expect(result.tianPan).toHaveLength(12);
    expect(result.shenPan).toHaveLength(12);
    expect(result.tianGan).toHaveLength(12);
    expect(result.siKe).toHaveLength(4);
    expect(result.siKeDunGan).toHaveLength(4);
    expect(result.siKeShenJiang).toHaveLength(4);
    expect(result.sanChuan).toHaveLength(3);
    expect(result.sanChuanDunGan).toHaveLength(3);
    expect(result.sanChuanShenJiang).toHaveLength(3);
    expect(result.sanChuanLiuQin).toHaveLength(3);

    expect(result.yearGanZhi).toBeDefined();
    expect(result.monthGanZhi).toBeDefined();
    expect(result.dayGanZhi).toBeDefined();
    expect(result.hourGanZhi).toBeDefined();
    expect(result.prevJie).toBeDefined();
    expect(result.nextJie).toBeDefined();
    expect(result.prevQi).toBeDefined();
    expect(result.nextQi).toBeDefined();
    expect(result.dayGanZhiKongWang).toBeDefined();
    expect(result.wuXingWangShuai).toHaveLength(5);
  });

  test('三传来自完整映射表而不是简化算法', () => {
    const result = createDaLiuRenPaiPan(baseSettings);
    const sanChuanKey = `${result.dayGanZhi}${result.siKe[0][0]}`;

    expect(SAN_CHUAN[sanChuanKey]).toBeDefined();
    expect(result.sanChuan).toEqual(SAN_CHUAN[sanChuanKey]);
  });

  test('贵人类型支持自动、昼贵、夜贵切换', () => {
    const autoResult = createDaLiuRenPaiPan(baseSettings);
    const dayResult = createDaLiuRenPaiPan({ ...baseSettings, guiRenType: 1 });
    const nightResult = createDaLiuRenPaiPan({ ...baseSettings, guiRenType: 2 });

    expect(autoResult.shenPan).toEqual(nightResult.shenPan);
    expect(autoResult.shenPan).not.toEqual(dayResult.shenPan);
    expect(dayResult.shenPan).not.toEqual(nightResult.shenPan);
  });

  test('晚子时日干支口径切换会影响日柱和课体', () => {
    const exactResult = createDaLiuRenPaiPan({
      ...baseSettings,
      date: '2024-01-01 23:30:00',
      dayGanZhiType: 0,
    });
    const exact2Result = createDaLiuRenPaiPan({
      ...baseSettings,
      date: '2024-01-01 23:30:00',
      dayGanZhiType: 1,
    });

    expect(exactResult.dayGanZhi).toBe('乙丑');
    expect(exact2Result.dayGanZhi).toBe('甲子');
    expect(exactResult.siKe).not.toEqual(exact2Result.siKe);
    expect(exactResult.sanChuan).not.toEqual(exact2Result.sanChuan);
  });

  test('闰月设置会影响农历日期的排盘结果', () => {
    const regularMonth = createDaLiuRenPaiPan({
      ...baseSettings,
      date: '2020-4-2 08:00:00',
      dateType: 1,
      leapMonthType: 0,
    });
    const leapMonth = createDaLiuRenPaiPan({
      ...baseSettings,
      date: '2020-4-2 08:00:00',
      dateType: 1,
      leapMonthType: 1,
    });

    expect(leapMonth.solar).not.toBe(regularMonth.solar);
    expect(leapMonth.dayGanZhi).not.toBe(regularMonth.dayGanZhi);
  });
});
