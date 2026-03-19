import { createZiWeiPaiPan } from '../../lib/ziwei';
import { ZiWeiSettings } from '../../types';

describe('紫微斗数重构单元测试', () => {
  const baseSettings: ZiWeiSettings = {
    name: '测试',
    occupy: '测试事项',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
    leapMonthType: 0,
    xuShiSuiType: 0,
    jieQiType: 1,
    wuXingJuType: 0,
    yearGanZhiType: 2,
    monthGanZhiType: 1,
    dayGanZhiType: 0,
  };

  test('返回完整的紫微斗数结果结构', () => {
    const result = createZiWeiPaiPan(baseSettings);

    expect(result).toBeDefined();
    expect(result.gongWei).toBeDefined();
    expect(Object.keys(result.gongWei)).toHaveLength(12);
    expect(result.shiErGongDiZhi).toHaveLength(12);
    expect(result.shiErGongTianGan).toHaveLength(12);
    expect(result.shiErMingGong).toHaveLength(12);
    expect(result.shiErShenGong).toHaveLength(12);
    expect(result.shiErGongZhuXing).toHaveLength(12);
    expect(result.shiErGongZhuXingMark).toHaveLength(12);
    expect(result.shiErGongZhuXingGuanXi).toHaveLength(12);
    expect(result.shiErGongSiHuaXing).toHaveLength(12);
    expect(result.shiErGongSiHuaXingGuanXi).toHaveLength(12);
    expect(result.daXian).toHaveLength(12);
    expect(result.xiaoXian).toHaveLength(12);
    expect(result.shiErGongBoShi).toHaveLength(12);
    expect(result.liuNianSuiQianZhuXing).toHaveLength(12);
    expect(result.liuNianJiangQianZhuXing).toHaveLength(12);

    expect(result.gongWei[result.mingGong].name).toBe('命宫');
    expect(result.mingZhu).toBeTruthy();
    expect(result.shenZhu).toBeTruthy();
    expect(result.ziDou).toBeTruthy();
    expect(result.liuDou).toBeTruthy();
  });

  test('对齐源项目样例的关键干支与节气结果', () => {
    const result = createZiWeiPaiPan(baseSettings);

    expect(result.solar).toBe('2024-01-01 00:00:00');
    expect(result.lunar).toBe('二〇二三年冬月二十');
    expect(result.yearGanZhi).toBe('癸卯');
    expect(result.monthGanZhi).toBe('甲子');
    expect(result.dayGanZhi).toBe('甲子');
    expect(result.hourGanZhi).toBe('甲子');
    expect(result.prevJie).toBe('大雪');
    expect(result.nextJie).toBe('小寒');
    expect(result.prevQi).toBe('冬至');
    expect(result.nextQi).toBe('大寒');
    expect(result.yueJiang).toBe('丑');
    expect(result.yueJiangShen).toBe('大吉');
  });

  test('农历输入路径能够正确换算到同一命盘', () => {
    const solarResult = createZiWeiPaiPan(baseSettings);
    const lunarResult = createZiWeiPaiPan({
      ...baseSettings,
      dateType: 1,
      date: '2023-11-20 00:00:00',
    });

    expect(lunarResult.solar).toBe(solarResult.solar);
    expect(lunarResult.yearGanZhi).toBe(solarResult.yearGanZhi);
    expect(lunarResult.monthGanZhi).toBe(solarResult.monthGanZhi);
    expect(lunarResult.dayGanZhi).toBe(solarResult.dayGanZhi);
    expect(lunarResult.hourGanZhi).toBe(solarResult.hourGanZhi);
    expect(lunarResult.mingGong).toBe(solarResult.mingGong);
    expect(lunarResult.shenGong).toBe(solarResult.shenGong);
  });

  test('晚子时日柱口径切换会影响日干支', () => {
    const exactResult = createZiWeiPaiPan({
      ...baseSettings,
      date: '2024-01-01 23:30:00',
      dayGanZhiType: 0,
    });
    const exact2Result = createZiWeiPaiPan({
      ...baseSettings,
      date: '2024-01-01 23:30:00',
      dayGanZhiType: 1,
    });

    expect(exactResult.dayGanZhi).not.toBe(exact2Result.dayGanZhi);
  });

  test('闰月设置会影响农历闰月日期的排盘结果', () => {
    const regularMonth = createZiWeiPaiPan({
      ...baseSettings,
      dateType: 1,
      date: '2020-4-2 08:00:00',
      leapMonthType: 0,
    });
    const leapMonth = createZiWeiPaiPan({
      ...baseSettings,
      dateType: 1,
      date: '2020-4-2 08:00:00',
      leapMonthType: 1,
    });

    expect(leapMonth.solar).not.toBe(regularMonth.solar);
    expect(leapMonth.dayGanZhi).not.toBe(regularMonth.dayGanZhi);
    expect(leapMonth.mingGong).not.toBe(regularMonth.mingGong);
  });

  test('birthHour 兼容旧版单独时辰输入', () => {
    const byBirthHour = createZiWeiPaiPan({
      ...baseSettings,
      date: '2024-01-01 00:00:00',
      birthHour: 8,
    });
    const byDateHour = createZiWeiPaiPan({
      ...baseSettings,
      date: '2024-01-01 08:00:00',
    });

    expect(byBirthHour.solar).toBe(byDateHour.solar);
    expect(byBirthHour.hourGanZhi).toBe(byDateHour.hourGanZhi);
    expect(byBirthHour.mingGong).toBe(byDateHour.mingGong);
    expect(byBirthHour.shenGong).toBe(byDateHour.shenGong);
  });
});
