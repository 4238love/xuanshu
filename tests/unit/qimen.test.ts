import { createQiMenPaiPan } from '../../lib/qimen';
import { QiMenSettings } from '../../types';

describe('奇门遁甲重构单元测试', () => {
  const baseSettings: QiMenSettings = {
    name: '测试',
    occupy: '测试事项',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
    leapMonthType: 0,
    xuShiSuiType: 0,
    jieQiType: 1,
    paiPanType: 3,
    zhiShiType: 0,
    yueJiaQiJuType: 1,
    yearGanZhiType: 2,
    monthGanZhiType: 1,
    dayGanZhiType: 0,
  };

  test('返回完整的奇门遁甲结果结构', () => {
    const result = createQiMenPaiPan(baseSettings);

    expect(result).toBeDefined();
    expect(result.diPan).toHaveLength(9);
    expect(result.tianPan).toHaveLength(9);
    expect(result.renPan).toHaveLength(9);
    expect(result.shenPan).toHaveLength(9);
    expect(result.diLiuJia).toHaveLength(9);
    expect(result.tianPanQiYiTianQinYes).toHaveLength(9);
    expect(result.tianPanQiYiTianQinNo).toHaveLength(9);

    expect(result.prevJie).toBeDefined();
    expect(result.nextJie).toBeDefined();
    expect(result.prevQi).toBeDefined();
    expect(result.nextQi).toBeDefined();
    expect(result.yueJiang).toBeDefined();
    expect(result.yueJiangShen).toBeDefined();
    expect(result.dayGanZhiKongWang).toBeDefined();
    expect(result.liuJiaXunKong).toHaveLength(2);
  });

  test('对齐源项目默认样例的关键盘面结果', () => {
    const result = createQiMenPaiPan(baseSettings);

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

    expect(result.fuTou).toBe('甲子');
    expect(result.jieQi).toBe('冬至');
    expect(result.sanYuan).toBe('上元');
    expect(result.yinYangDun).toBe('阳遁');
    expect(result.juShu).toBe('阳遁1局');
    expect(result.xunShou).toBe('甲子');
    expect(result.zhiFu).toBe('天蓬');
    expect(result.zhiShi).toBe('休门');

    expect(result.tianPan).toEqual(['天蓬', '芮禽', '天冲', '天辅', '', '天心', '天柱', '天任', '天英']);
    expect(result.renPan).toEqual(['休门', '死门', '伤门', '杜门', '', '开门', '惊门', '生门', '景门']);
    expect(result.shenPan).toEqual(['值符', '玄武', '太阴', '六合', '', '九天', '九地', '螣蛇', '白虎']);
    expect(result.tianPanQiYiTianQinYes).toEqual(['', '壬', '', '', '', '', '', '', '']);
    expect(result.tianPanQiYiTianQinNo).toEqual(['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙']);
  });

  test('农历输入路径能够换算到同一张盘', () => {
    const solarResult = createQiMenPaiPan(baseSettings);
    const lunarResult = createQiMenPaiPan({
      ...baseSettings,
      dateType: 1,
      date: '2023-11-20 00:00:00',
    });

    expect(lunarResult.solar).toBe(solarResult.solar);
    expect(lunarResult.yearGanZhi).toBe(solarResult.yearGanZhi);
    expect(lunarResult.monthGanZhi).toBe(solarResult.monthGanZhi);
    expect(lunarResult.dayGanZhi).toBe(solarResult.dayGanZhi);
    expect(lunarResult.hourGanZhi).toBe(solarResult.hourGanZhi);
    expect(lunarResult.juShu).toBe(solarResult.juShu);
    expect(lunarResult.tianPan).toEqual(solarResult.tianPan);
  });

  test('晚子时口径切换会影响日柱结果', () => {
    const exactResult = createQiMenPaiPan({
      ...baseSettings,
      date: '2024-01-01 23:30:00',
      dayGanZhiType: 0,
    });
    const exact2Result = createQiMenPaiPan({
      ...baseSettings,
      date: '2024-01-01 23:30:00',
      dayGanZhiType: 1,
    });

    expect(exactResult.dayGanZhi).not.toBe(exact2Result.dayGanZhi);
  });

  test('闰月设置会影响农历日期的排盘结果', () => {
    const regularMonth = createQiMenPaiPan({
      ...baseSettings,
      dateType: 1,
      date: '2020-4-2 08:00:00',
      leapMonthType: 0,
    });
    const leapMonth = createQiMenPaiPan({
      ...baseSettings,
      dateType: 1,
      date: '2020-4-2 08:00:00',
      leapMonthType: 1,
    });

    expect(leapMonth.solar).not.toBe(regularMonth.solar);
    expect(leapMonth.dayGanZhi).not.toBe(regularMonth.dayGanZhi);
    expect(leapMonth.juShu).not.toBe(regularMonth.juShu);
  });

  test('年干支起算口径已接入核心逻辑', () => {
    const byLiChunDay = createQiMenPaiPan({
      ...baseSettings,
      date: '2024-02-04 00:30:00',
      yearGanZhiType: 1,
    });
    const byLiChunMoment = createQiMenPaiPan({
      ...baseSettings,
      date: '2024-02-04 00:30:00',
      yearGanZhiType: 2,
    });

    expect(byLiChunDay.yearGanZhi).not.toBe(byLiChunMoment.yearGanZhi);
    expect(byLiChunDay.shengXiao).not.toBe(byLiChunMoment.shengXiao);
  });

  test('飞盘参数不再静默降级为转盘', () => {
    expect(() =>
      createQiMenPaiPan({
        ...baseSettings,
        panType: 'fei',
      })
    ).toThrow('当前仅完成转盘奇门重构，暂不支持飞盘奇门');
  });
});
