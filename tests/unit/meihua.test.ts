import { createMeiHuaPaiPan } from '../../lib/meihua';
import { MeiHuaSettings } from '../../types';

describe('梅花易数重构单元测试', () => {
  const baseSettings: MeiHuaSettings = {
    name: '测试',
    occupy: '测试事项',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
    leapMonthType: 0,
    xuShiSuiType: 0,
    jieQiType: 1,
    yearGanZhiType: 2,
    monthGanZhiType: 1,
    dayGanZhiType: 0,
    paiPanType: 0,
  };

  test('返回完整的梅花易数结果结构', () => {
    const result = createMeiHuaPaiPan(baseSettings);

    expect(result).toBeDefined();
    expect(result.yearGanZhi).toBeDefined();
    expect(result.monthGanZhi).toBeDefined();
    expect(result.dayGanZhi).toBeDefined();
    expect(result.hourGanZhi).toBeDefined();
    expect(result.prevJie).toBeDefined();
    expect(result.nextJie).toBeDefined();
    expect(result.prevQi).toBeDefined();
    expect(result.nextQi).toBeDefined();
    expect(result.yueJiang).toBeDefined();
    expect(result.yueJiangShen).toBeDefined();
    expect(result.yearKongWang).toBeDefined();
    expect(result.dayKongWang).toBeDefined();
    expect(result.benGuaLiuYao?.yaoMing).toHaveLength(6);
    expect(result.bianGuaLiuYao?.yaoCi).toHaveLength(6);
  });

  test('对齐默认样例的关键时间口径与卦象结果', () => {
    const result = createMeiHuaPaiPan(baseSettings);

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
    expect(result.guaMa).toBe(346);
    expect(result.shangGua).toBe('离(☲)');
    expect(result.xiaGua).toBe('震(☳)');
    expect(result.benGua).toBe('火雷噬嗑');
  });

  test('农历输入路径能够换算到同一张盘', () => {
    const solarResult = createMeiHuaPaiPan(baseSettings);
    const lunarResult = createMeiHuaPaiPan({
      ...baseSettings,
      dateType: 1,
      date: '2023-11-20 00:00:00',
    });

    expect(lunarResult.solar).toBe(solarResult.solar);
    expect(lunarResult.yearGanZhi).toBe(solarResult.yearGanZhi);
    expect(lunarResult.monthGanZhi).toBe(solarResult.monthGanZhi);
    expect(lunarResult.dayGanZhi).toBe(solarResult.dayGanZhi);
    expect(lunarResult.hourGanZhi).toBe(solarResult.hourGanZhi);
    expect(lunarResult.guaMa).toBe(solarResult.guaMa);
    expect(lunarResult.benGua).toBe(solarResult.benGua);
  });

  test('晚子时口径切换会影响日柱结果', () => {
    const exactResult = createMeiHuaPaiPan({
      ...baseSettings,
      date: '2024-01-01 23:30:00',
      dayGanZhiType: 0,
    });
    const exact2Result = createMeiHuaPaiPan({
      ...baseSettings,
      date: '2024-01-01 23:30:00',
      dayGanZhiType: 1,
    });

    expect(exactResult.dayGanZhi).not.toBe(exact2Result.dayGanZhi);
    expect(exactResult.guaMa).toBe(exact2Result.guaMa);
  });

  test('闰月设置会影响农历日期对应的排盘结果', () => {
    const regularMonth = createMeiHuaPaiPan({
      ...baseSettings,
      dateType: 1,
      date: '2020-4-2 08:00:00',
      leapMonthType: 0,
    });
    const leapMonth = createMeiHuaPaiPan({
      ...baseSettings,
      dateType: 1,
      date: '2020-4-2 08:00:00',
      leapMonthType: 1,
    });

    expect(leapMonth.solar).not.toBe(regularMonth.solar);
    expect(leapMonth.dayGanZhi).not.toBe(regularMonth.dayGanZhi);
    expect(leapMonth.guaMa).not.toBe(regularMonth.guaMa);
  });

  test('不同起卦类型已经接入核心起卦逻辑', () => {
    const numberMode = createMeiHuaPaiPan({
      ...baseSettings,
      paiPanType: 2,
      shu: 456,
    });
    const singleMode = createMeiHuaPaiPan({
      ...baseSettings,
      paiPanType: 3,
      danShu: 12345,
    });
    const doubleMode = createMeiHuaPaiPan({
      ...baseSettings,
      paiPanType: 4,
      shuangShuOne: 12,
      shuangShuTwo: 34,
      shangXiaGuaType: 0,
      dongYaoType: 1,
    });

    expect(numberMode.guaMa).toBe(456);
    expect(singleMode.guaMa).toBe(343);
    expect(doubleMode.guaMa).toBe(375);
  });
});
