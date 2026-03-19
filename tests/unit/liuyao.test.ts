import { createLiuYaoPaiPan } from '../../lib/liuyao';
import { LiuYaoSettings } from '../../types';

describe('六爻排盘单元测试', () => {
  test('日期起卦默认样例输出关键字段正确', () => {
    const settings: LiuYaoSettings = {
      name: '测试',
      occupy: '测试占事',
      sex: 1,
      date: '2024-01-01 08:00:00',
      dateType: 0,
      paiPanType: 0,
    };

    const result = createLiuYaoPaiPan(settings);

    expect(result.solar).toBe('2024-01-01 08:00:00');
    expect(result.lunar).toBe('二〇二三年冬月二十');
    expect(result.benGua).toBe('火地晋');
    expect(result.benGuaAs).toBe('䷢');
    expect(result.bianGua).toBe('山地剥');
    expect(result.bianGuaAs).toBe('䷖');
    expect(result.ganZhi).toEqual({
      year: '癸卯',
      month: '甲子',
      day: '甲子',
      hour: '戊辰',
    });
    expect(result.yueJiang).toBe('丑');
    expect(result.yueJiangShen).toBe('大吉');
    expect(result.kongWang).toEqual(['戌', '亥']);
    expect(result.liuYao.benGua.yaoAsMarkName).toEqual(['少阴', '少阴', '少阴', '老阳', '少阴', '少阳']);
    expect(result.liuYao.benGua.fuShen).toEqual(['子孙', '', '', '', '', '']);
    expect(result.shenSha).toEqual({
      year: ['将星', '皇恩', '阳刃', '天人'],
      month: ['太极贵人', '唐符国印', '将星'],
      day: ['太极贵人', '唐符国印', '将星'],
      hour: ['华盖'],
    });
    expect(result.jieQi).toMatchObject({
      prevJie: '大雪',
      nextJie: '小寒',
      prevQi: '冬至',
      nextQi: '大寒',
      prevJieDay: 24,
      nextJieDay: 4,
      prevQiDay: 9,
      nextQiDay: 19,
    });
    expect(result.jieQi?.chuShengJie).toBe('大雪后24天14小时27分钟5秒。小寒前4天20小时49分钟22秒');
    expect(result.jieQi?.chuShengQi).toBe('冬至后9天20小时32分钟40秒。大寒前19天14小时7分钟22秒');
  });

  test('农历输入与等价公历输出一致', () => {
    const solarResult = createLiuYaoPaiPan({
      name: '测试',
      occupy: '测试占事',
      sex: 1,
      date: '2024-01-01 08:00:00',
      dateType: 0,
      paiPanType: 0,
    });

    const lunarResult = createLiuYaoPaiPan({
      name: '测试',
      occupy: '测试占事',
      sex: 1,
      date: '2023-11-20 08:00:00',
      dateType: 1,
      paiPanType: 0,
    });

    expect(lunarResult.solar).toBe(solarResult.solar);
    expect(lunarResult.lunar).toBe(solarResult.lunar);
    expect(lunarResult.benGua).toBe(solarResult.benGua);
    expect(lunarResult.bianGua).toBe(solarResult.bianGua);
    expect(lunarResult.ganZhi).toEqual(solarResult.ganZhi);
    expect(lunarResult.kongWang).toEqual(solarResult.kongWang);
    expect(lunarResult.shenSha).toEqual(solarResult.shenSha);
  });

  test('晚子时切换会影响日柱口径', () => {
    const exactDayResult = createLiuYaoPaiPan({
      name: '测试',
      occupy: '测试占事',
      sex: 1,
      date: '2024-01-01 23:30:00',
      dateType: 0,
      dayGanZhiType: 0,
      paiPanType: 0,
    });

    const lateZiResult = createLiuYaoPaiPan({
      name: '测试',
      occupy: '测试占事',
      sex: 1,
      date: '2024-01-01 23:30:00',
      dateType: 0,
      dayGanZhiType: 1,
      paiPanType: 0,
    });

    expect(exactDayResult.ganZhi.day).toBe('乙丑');
    expect(exactDayResult.ganZhi.hour).toBe('丙子');
    expect(lateZiResult.ganZhi.day).toBe('甲子');
    expect(lateZiResult.ganZhi.hour).toBe('丙子');
    expect(exactDayResult.benGua).toBe(lateZiResult.benGua);
    expect(exactDayResult.bianGua).toBe(lateZiResult.bianGua);
    expect(exactDayResult.shenSha?.year).toContain('福星贵人');
    expect(lateZiResult.shenSha?.year).toContain('阳刃');
  });

  test('闰月输入会在 leapMonthType 生效时切换结果', () => {
    const normalMonth = createLiuYaoPaiPan({
      name: '测试',
      occupy: '测试占事',
      sex: 1,
      date: '2023-2-1 08:00:00',
      dateType: 1,
      leapMonthType: 0,
      paiPanType: 0,
    });

    const leapMonth = createLiuYaoPaiPan({
      name: '测试',
      occupy: '测试占事',
      sex: 1,
      date: '2023-2-1 08:00:00',
      dateType: 1,
      leapMonthType: 1,
      paiPanType: 0,
    });

    expect(normalMonth.solar).toBe('2023-02-20 08:00:00');
    expect(normalMonth.lunar).toBe('二〇二三年二月初一');
    expect(normalMonth.ganZhi).toEqual({
      year: '癸卯',
      month: '甲寅',
      day: '己酉',
      hour: '戊辰',
    });
    expect(normalMonth.benGua).toBe('山雷颐');
    expect(normalMonth.bianGua).toBe('地雷复');

    expect(leapMonth.solar).toBe('2023-03-22 08:00:00');
    expect(leapMonth.lunar).toBe('二〇二三年闰二月初一');
    expect(leapMonth.ganZhi).toEqual({
      year: '癸卯',
      month: '乙卯',
      day: '己卯',
      hour: '戊辰',
    });
    expect(leapMonth.benGua).toBe('火地晋');
    expect(leapMonth.bianGua).toBe('火水未济');
  });

  test('自动起卦和手动起卦在等价爻数下结果一致', () => {
    const autoResult = createLiuYaoPaiPan({
      name: '测试',
      occupy: '测试占事',
      sex: 1,
      date: '2024-01-01 08:00:00',
      dateType: 0,
      paiPanType: 1,
      yaoShu: [7, 8, 9, 6, 7, 8],
    });

    const manualResult = createLiuYaoPaiPan({
      name: '测试',
      occupy: '测试占事',
      sex: 1,
      date: '2024-01-01 08:00:00',
      dateType: 0,
      paiPanType: 2,
      manualYaoShu: [0, 1, 2, 3, 0, 1],
    });

    expect(autoResult.benGua).toBe('水火既济');
    expect(autoResult.bianGua).toBe('泽雷随');
    expect(autoResult.liuYao.benGua.yaoAsMarkName).toEqual(['少阳', '少阴', '老阳', '老阴', '少阳', '少阴']);
    expect(autoResult.liuYao.benGua.yaoAsMark).toEqual(manualResult.liuYao.benGua.yaoAsMark);
    expect(autoResult.liuYao.benGua.yaoAsMarkName).toEqual(manualResult.liuYao.benGua.yaoAsMarkName);
    expect(autoResult.benGuaAs).toBe(manualResult.benGuaAs);
    expect(autoResult.bianGuaAs).toBe(manualResult.bianGuaAs);
    expect(autoResult.liuYao.benGua.fuShen).toEqual(['', '', '妻财', '', '', '']);
  });

  test('缺少占事不抛错并保持页面兼容结构', () => {
    const settings: LiuYaoSettings = {
      name: '测试',
      occupy: '',
      sex: 1,
      date: '2024-01-01 08:00:00',
      dateType: 0,
      paiPanType: 1,
      yaoShu: [7, 8, 7, 8, 7, 8],
    };

    expect(() => createLiuYaoPaiPan(settings)).not.toThrow();

    const result = createLiuYaoPaiPan(settings);
    expect(result.ganZhi).toBeDefined();
    expect(result.jieQi?.prevJie).toBeDefined();
    expect(result.jieQi?.nextQi).toBeDefined();
    expect(result.shenSha?.year).toBeDefined();
    expect(result.shenSha?.month).toBeDefined();
    expect(result.shenSha?.day).toBeDefined();
    expect(result.shenSha?.hour).toBeDefined();
    expect(result.kongWang).toHaveLength(2);
  });
});
