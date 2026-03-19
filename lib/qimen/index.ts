// @ts-ignore - lunar-javascript 类型定义不完整
import { Solar, Lunar } from 'lunar-javascript';
import { QiMenResult, QiMenSettings } from '@/types';
import { formatDate, getRealAge } from '../utils/common';
import { parseLunarDateTimeString, parseSolarDateTimeString, solarPartsToDate } from '../utils/dateTime';
import {
  KONG_WANG,
  NA_YIN,
  TIAN_GAN_WU_XING,
  DI_ZHI_WU_XING,
  WU_BU_YU_SHI,
  YUE_JIANG,
} from '../liuyao/liuyaoMaps';
import * as QiMenConstants from './constants';

type JieQiRef = {
  toString(): string;
  getSolar(): {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    toYmdHms(): string;
  };
};

function solarToDate(solar: {
  getYear(): number;
  getMonth(): number;
  getDay(): number;
  getHour(): number;
  getMinute(): number;
  getSecond(): number;
}): Date {
  return new Date(
    solar.getYear(),
    solar.getMonth() - 1,
    solar.getDay(),
    solar.getHour(),
    solar.getMinute(),
    solar.getSecond()
  );
}

function diffParts(start: Date, end: Date) {
  let diff = Math.abs(end.getTime() - start.getTime());
  const day = Math.floor(diff / (24 * 60 * 60 * 1000));
  diff -= day * 24 * 60 * 60 * 1000;
  const hour = Math.floor(diff / (60 * 60 * 1000));
  diff -= hour * 60 * 60 * 1000;
  const minute = Math.floor(diff / (60 * 1000));
  diff -= minute * 60 * 1000;
  const second = Math.floor(diff / 1000);

  return { day, hour, minute, second };
}

function formatBirthMarker(name: string, relation: '后' | '前', start: Date, end: Date) {
  const { day, hour, minute, second } = diffParts(start, end);
  return `${name}${relation}${day}天${hour}小时${minute}分${second}秒`;
}

function calculateAge(date: Date, xuShiSuiType: 0 | 1) {
  if (xuShiSuiType === 1) {
    return getRealAge(date);
  }

  const now = new Date();
  const realAge = getRealAge(date, now);
  const passedBirthday =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());

  return realAge + (passedBirthday ? 1 : 0);
}

function formatKongWang(value?: [string, string]): string | undefined {
  return value ? value.join('、') : undefined;
}

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((current.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

function getGateByJieQi(jieQi: string) {
  const gates = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'] as const;
  const match = Object.entries(QiMenConstants.IS_BA_MEN).find(([, values]) => values.includes(jieQi));
  return match ? gates[Number(match[0])] : '死门';
}

export class QiMenPaiPan {
  private settings: Required<
    Pick<
      QiMenSettings,
      | 'name'
      | 'occupy'
      | 'sex'
      | 'panType'
      | 'date'
      | 'dateType'
      | 'leapMonthType'
      | 'xuShiSuiType'
      | 'jieQiType'
      | 'paiPanType'
      | 'zhiShiType'
      | 'yueJiaQiJuType'
      | 'yearGanZhiType'
      | 'monthGanZhiType'
      | 'dayGanZhiType'
    >
  >;

  private solar!: Solar;
  private lunar!: Lunar;
  private solarDate!: Date;
  private eightChar: any;

  private yearGanZhi = '';
  private monthGanZhi = '';
  private dayGanZhi = '';
  private hourGanZhi = '';
  private yearGan = '';
  private monthGan = '';
  private dayGan = '';
  private hourGan = '';
  private yearZhi = '';
  private monthZhi = '';
  private dayZhi = '';
  private hourZhi = '';

  private prevJie!: JieQiRef;
  private nextJie!: JieQiRef;
  private prevQi!: JieQiRef;
  private nextQi!: JieQiRef;

  private fuTou = '';
  private jieQi = '';
  private sanYuan = '';
  private yinYangDun = '';
  private juShu = 1;
  private xunShou = '';
  private xunShouYiZhang = '';
  private xunShouGongWei = 1;

  private diQiYi: string[] = [];
  private diLiuJia: string[] = [];
  private zhiFu = '';
  private zhiShi = '';
  private oldZhiFuGongWei = 1;
  private newZhiFuGongWei = 1;
  private oldZhiShiGongWei = 1;
  private newZhiShiGongWei = 1;

  private diPan: string[] = [];
  private tianPan: string[] = [];
  private renPan: string[] = [];
  private shenPan: string[] = [];
  private tianPanQiYiTianQinYes: string[] = new Array(9).fill('');
  private tianPanQiYiTianQinNo: string[] = new Array(9).fill('');

  constructor(settings: QiMenSettings) {
    this.settings = {
      name: settings.name ?? '',
      occupy: settings.occupy ?? '',
      sex: settings.sex ?? 1,
      panType: settings.panType ?? 'zhuan',
      date: settings.date ?? '2024-01-01 00:00:00',
      dateType: settings.dateType ?? 0,
      leapMonthType: settings.leapMonthType ?? 0,
      xuShiSuiType: settings.xuShiSuiType ?? 0,
      jieQiType: settings.jieQiType ?? 1,
      paiPanType: settings.paiPanType ?? 3,
      zhiShiType: settings.zhiShiType ?? 0,
      yueJiaQiJuType: settings.yueJiaQiJuType ?? 1,
      yearGanZhiType: settings.yearGanZhiType ?? 2,
      monthGanZhiType: settings.monthGanZhiType ?? 1,
      dayGanZhiType: settings.dayGanZhiType ?? 0,
    };

    if (this.settings.panType === 'fei') {
      throw new Error('当前仅完成转盘奇门重构，暂不支持飞盘奇门');
    }

    this.initializeDate();
    this.initializeGanZhi();
    this.initializeJieQi();
    this.initializeFuTouAndJieQi();
    this.initializeSanYuanAndJuShu();
    this.initializeYinYangDun();
    this.initializeXunShou();
    this.initializeDiQiYiLiuJiaFuShi();
    this.initializeDiPan();
    this.initializeTianPan();
    this.initializeRenPan();
    this.initializeShenPan();
  }

  public getPaiPan(): QiMenResult {
    const prevJieDate = this.prevJie.getSolar().toYmdHms();
    const nextJieDate = this.nextJie.getSolar().toYmdHms();
    const prevQiDate = this.prevQi.getSolar().toYmdHms();
    const nextQiDate = this.nextQi.getSolar().toYmdHms();
    const yueJiangData = this.getYueJiangData();
    const liuJiaXunKong = this.getLiuJiaXunKong();
    const liuJiaXunKongGongWei = this.getLiuJiaXunKongGongWei();
    const yiMa = this.getYiMa();

    return {
      solar: formatDate(this.solarDate),
      lunar: this.lunar.toString(),
      name: this.settings.name || undefined,
      occupy: this.settings.occupy || undefined,
      sex: this.settings.sex === 1 ? '男' : '女',
      age: calculateAge(this.solarDate, this.settings.xuShiSuiType),
      zao: this.settings.sex === 1 ? '乾造' : '坤造',
      xingQi: `周${this.lunar.getWeekInChinese()}`,
      jiJie: this.lunar.getSeason(),
      shengXiao: this.getShengXiao(),
      xingZuo: `${this.solar.getXingZuo()}座`,
      yueXiang: this.lunar.getYueXiang(),
      yueJiang: yueJiangData[0],
      yueJiangShen: yueJiangData[1],
      wuBuYuShi: this.hourGanZhi === WU_BU_YU_SHI[this.dayGan],

      yearGan: this.yearGan,
      monthGan: this.monthGan,
      dayGan: this.dayGan,
      hourGan: this.hourGan,
      yearZhi: this.yearZhi,
      monthZhi: this.monthZhi,
      dayZhi: this.dayZhi,
      hourZhi: this.hourZhi,
      yearGanZhi: this.yearGanZhi,
      monthGanZhi: this.monthGanZhi,
      dayGanZhi: this.dayGanZhi,
      hourGanZhi: this.hourGanZhi,
      yearGanWuXing: TIAN_GAN_WU_XING[this.yearGan],
      monthGanWuXing: TIAN_GAN_WU_XING[this.monthGan],
      dayGanWuXing: TIAN_GAN_WU_XING[this.dayGan],
      hourGanWuXing: TIAN_GAN_WU_XING[this.hourGan],
      yearZhiWuXing: DI_ZHI_WU_XING[this.yearZhi],
      monthZhiWuXing: DI_ZHI_WU_XING[this.monthZhi],
      dayZhiWuXing: DI_ZHI_WU_XING[this.dayZhi],
      hourZhiWuXing: DI_ZHI_WU_XING[this.hourZhi],
      yearGanZhiWuXing: `${TIAN_GAN_WU_XING[this.yearGan]}${DI_ZHI_WU_XING[this.yearZhi]}`,
      monthGanZhiWuXing: `${TIAN_GAN_WU_XING[this.monthGan]}${DI_ZHI_WU_XING[this.monthZhi]}`,
      dayGanZhiWuXing: `${TIAN_GAN_WU_XING[this.dayGan]}${DI_ZHI_WU_XING[this.dayZhi]}`,
      hourGanZhiWuXing: `${TIAN_GAN_WU_XING[this.hourGan]}${DI_ZHI_WU_XING[this.hourZhi]}`,
      yearGanZhiNaYin: NA_YIN[this.yearGanZhi],
      monthGanZhiNaYin: NA_YIN[this.monthGanZhi],
      dayGanZhiNaYin: NA_YIN[this.dayGanZhi],
      hourGanZhiNaYin: NA_YIN[this.hourGanZhi],
      yearGanZhiKongWang: formatKongWang(KONG_WANG[this.yearGanZhi]),
      monthGanZhiKongWang: formatKongWang(KONG_WANG[this.monthGanZhi]),
      dayGanZhiKongWang: formatKongWang(KONG_WANG[this.dayGanZhi]),
      hourGanZhiKongWang: formatKongWang(KONG_WANG[this.hourGanZhi]),

      prevJie: this.prevJie.toString(),
      prevJieDate,
      prevJieDay: diffParts(solarToDate(this.prevJie.getSolar()), this.solarDate).day,
      nextJie: this.nextJie.toString(),
      nextJieDate,
      nextJieDay: diffParts(this.solarDate, solarToDate(this.nextJie.getSolar())).day,
      chuShengJie: `${formatBirthMarker(this.prevJie.toString(), '后', solarToDate(this.prevJie.getSolar()), this.solarDate)}、${formatBirthMarker(this.nextJie.toString(), '前', this.solarDate, solarToDate(this.nextJie.getSolar()))}`,
      prevQi: this.prevQi.toString(),
      prevQiDate,
      prevQiDay: diffParts(solarToDate(this.prevQi.getSolar()), this.solarDate).day,
      nextQi: this.nextQi.toString(),
      nextQiDate,
      nextQiDay: diffParts(this.solarDate, solarToDate(this.nextQi.getSolar())).day,
      chuShengQi: `${formatBirthMarker(this.prevQi.toString(), '后', solarToDate(this.prevQi.getSolar()), this.solarDate)}、${formatBirthMarker(this.nextQi.toString(), '前', this.solarDate, solarToDate(this.nextQi.getSolar()))}`,

      fuTou: this.fuTou,
      jieQi: this.jieQi,
      sanYuan: this.sanYuan,
      yinYangDun: this.yinYangDun,
      juShu: `${this.yinYangDun}${this.juShu}局`,
      xunShou: this.xunShou,
      xunShouYiZhang: this.xunShouYiZhang,
      zhiFu: this.zhiFu,
      zhiShi: this.zhiShi,
      tianYi: QiMenConstants.JIU_XING_INITIAL[this.newZhiFuGongWei - 1],
      diYi: QiMenConstants.BA_MEN_INITIAL[this.newZhiShiGongWei - 1],
      taiYi: this.zhiShi,
      liuJiaXunKong,
      liuJiaXunKongGongWei,
      yiMa,
      yiMaGongWei: yiMa ? QiMenConstants.YI_MA_GONG[yiMa] : undefined,

      oldZhiFuGongWei: this.oldZhiFuGongWei,
      newZhiFuGongWei: this.newZhiFuGongWei,
      oldZhiShiGongWei: this.oldZhiShiGongWei,
      newZhiShiGongWei: this.newZhiShiGongWei,

      diPan: [...this.diPan],
      tianPan: [...this.tianPan],
      renPan: [...this.renPan],
      shenPan: [...this.shenPan],
      diLiuJia: [...this.diLiuJia],
      tianPanQiYiTianQinYes: [...this.tianPanQiYiTianQinYes],
      tianPanQiYiTianQinNo: [...this.tianPanQiYiTianQinNo],
      liuYiJiXing: this.getSpecialMarks(QiMenConstants.LIU_YI_JI_XING),
      qiYiRuMu: this.getSpecialMarks(QiMenConstants.QI_YI_RU_MU),
    };
  }

  private initializeDate() {
    if (this.settings.dateType === 1) {
      const lunarParts = parseLunarDateTimeString(this.settings.date.trim());
      if (!lunarParts) {
        throw new Error('农历日期格式无效，请使用 L:yyyy-M-d HH:mm:ss 或 yyyy-M-d HH:mm:ss');
      }

      const month = this.settings.leapMonthType === 1 || lunarParts.isLeap
        ? -Math.abs(lunarParts.month)
        : Math.abs(lunarParts.month);

      this.lunar = (Lunar as any).fromYmdHms(
        lunarParts.year,
        month,
        lunarParts.day,
        lunarParts.hour,
        lunarParts.minute,
        lunarParts.second
      );
      this.solar = this.lunar.getSolar();
      this.solarDate = solarToDate(this.solar);
      return;
    }

    const solarParts = parseSolarDateTimeString(this.settings.date.trim());
    if (!solarParts) {
      throw new Error('日期格式无效，请使用 yyyy-MM-dd HH:mm:ss');
    }

    this.solarDate = solarPartsToDate(solarParts);
    this.solar = Solar.fromDate(this.solarDate);
    this.lunar = this.solar.getLunar();
  }

  private initializeGanZhi() {
    this.yearGanZhi = this.getYearGanZhi();
    this.monthGanZhi = this.getMonthGanZhi();
    this.dayGanZhi = this.getDayGanZhiByRef(this.lunar as any);

    this.eightChar = this.lunar.getEightChar();
    this.eightChar.setSect?.(this.settings.dayGanZhiType + 1);
    this.hourGanZhi = this.eightChar.getTime();

    this.yearGan = this.yearGanZhi.substring(0, 1);
    this.monthGan = this.monthGanZhi.substring(0, 1);
    this.dayGan = this.dayGanZhi.substring(0, 1);
    this.hourGan = this.hourGanZhi.substring(0, 1);
    this.yearZhi = this.yearGanZhi.substring(1, 2);
    this.monthZhi = this.monthGanZhi.substring(1, 2);
    this.dayZhi = this.dayGanZhi.substring(1, 2);
    this.hourZhi = this.hourGanZhi.substring(1, 2);
  }

  private initializeJieQi() {
    const byDay = this.settings.jieQiType === 0;
    const lunarRef = this.lunar as any;
    this.prevJie = lunarRef.getPrevJie(byDay);
    this.nextJie = lunarRef.getNextJie(byDay);
    this.prevQi = lunarRef.getPrevQi(byDay);
    this.nextQi = lunarRef.getNextQi(byDay);
  }

  private initializeFuTouAndJieQi() {
    if (this.settings.paiPanType === 0 || this.settings.paiPanType === 1) {
      this.fuTou = QiMenConstants.RI_ZHU_FU_TOU[this.dayGanZhi] ?? '甲子';
      this.jieQi = this.getPrevJieQiName();
      return;
    }

    const currentJieQi = this.getCurrentJieQi(this.lunar as any);
    if (QiMenConstants.SAN_YUAN_FU_TOU.includes(this.dayGanZhi) && currentJieQi) {
      this.fuTou = this.dayGanZhi;
      this.jieQi = currentJieQi;
      return;
    }

    const backwardResult = this.searchFuTouAndJieQi();
    this.fuTou = backwardResult.fuTou;
    this.jieQi = backwardResult.jieQi;
  }

  private initializeSanYuanAndJuShu() {
    if (this.settings.paiPanType === 0) {
      const year = this.solar.getYear();
      if (year <= 3) {
        this.sanYuan = '中元';
        this.juShu = 4;
        return;
      }

      const cycle = (year - 4) % 180;
      if (cycle < 60) {
        this.sanYuan = '下元';
        this.juShu = 7;
      } else if (cycle < 120) {
        this.sanYuan = '上元';
        this.juShu = 1;
      } else {
        this.sanYuan = '中元';
        this.juShu = 4;
      }
      return;
    }

    if (this.settings.paiPanType === 1) {
      const diZhi = this.settings.yueJiaQiJuType === 0
        ? this.yearZhi
        : QiMenConstants.SIX_JIA_ZI_XUN_SHOU_AND_YI_ZHANG[this.yearGanZhi]?.[0]?.substring(1, 2) ?? this.yearZhi;

      if (['寅', '申', '巳', '亥'].includes(diZhi)) {
        this.sanYuan = '上元';
        this.juShu = 1;
      } else if (['子', '午', '卯', '酉'].includes(diZhi)) {
        this.sanYuan = '中元';
        this.juShu = 7;
      } else {
        this.sanYuan = '下元';
        this.juShu = 4;
      }
      return;
    }

    if (this.settings.paiPanType === 2) {
      this.sanYuan = QiMenConstants.RI_ZHU_SAN_YUAN[this.dayGanZhi] ?? '上元';
      const dayOfYear = getDayOfYear(this.solarDate);
      if (dayOfYear <= 60) this.juShu = 1;
      else if (dayOfYear <= 120) this.juShu = 7;
      else if (dayOfYear <= 180) this.juShu = 4;
      else if (dayOfYear <= 240) this.juShu = 9;
      else if (dayOfYear <= 300) this.juShu = 3;
      else this.juShu = 6;
      return;
    }

    this.sanYuan = QiMenConstants.RI_ZHU_SAN_YUAN[this.dayGanZhi] ?? '上元';
    const juShu = QiMenConstants.JU_SHU[this.jieQi] ?? [1, 7, 4];
    if (this.sanYuan === '上元') this.juShu = juShu[0];
    else if (this.sanYuan === '中元') this.juShu = juShu[1];
    else this.juShu = juShu[2];
  }

  private initializeYinYangDun() {
    if (this.settings.paiPanType === 0 || this.settings.paiPanType === 1) {
      this.yinYangDun = '阴遁';
      return;
    }

    if (this.settings.paiPanType === 2) {
      this.yinYangDun = QiMenConstants.YIN_YANG_DUN_JIE_QI['阳遁'].includes(this.jieQi) ? '阳遁' : '阴遁';
      return;
    }

    this.yinYangDun = QiMenConstants.JIE_QI_YIN_YANG_DUN[this.jieQi] ?? '阳遁';
  }

  private initializeXunShou() {
    const xunShouData = QiMenConstants.SIX_JIA_ZI_XUN_SHOU_AND_YI_ZHANG[this.hourGanZhi];
    this.xunShou = xunShouData?.[0] ?? '甲子';
    this.xunShouYiZhang = xunShouData?.[1] ?? '戊';
  }

  private initializeDiQiYiLiuJiaFuShi() {
    if (this.yinYangDun === '阳遁') {
      this.diQiYi = [...(QiMenConstants.DI_YANG_QI_YI[this.juShu] ?? QiMenConstants.DI_YANG_QI_YI[1])];
      this.diLiuJia = [...(QiMenConstants.DI_YANG_LIU_JIA[this.juShu] ?? QiMenConstants.DI_YANG_LIU_JIA[1])];
    } else {
      this.diQiYi = [...(QiMenConstants.DI_YIN_QI_YI[this.juShu] ?? QiMenConstants.DI_YIN_QI_YI[1])];
      this.diLiuJia = [...(QiMenConstants.DI_YIN_LIU_JIA[this.juShu] ?? QiMenConstants.DI_YIN_LIU_JIA[1])];
    }

    const xunShouIndex = this.diLiuJia.findIndex((value) => value === this.xunShou);
    if (xunShouIndex >= 0) {
      this.xunShouGongWei = xunShouIndex + 1;
      this.oldZhiFuGongWei = xunShouIndex + 1;
      this.oldZhiShiGongWei = xunShouIndex + 1;
    }

    this.zhiFu = QiMenConstants.JIU_XING_INITIAL[this.xunShouGongWei - 1] ?? '天蓬';

    if (this.zhiFu === '天禽' || this.xunShouGongWei === 5) {
      if (this.settings.zhiShiType === 1) {
        this.zhiShi = this.yinYangDun === '阳遁' ? '生门' : '死门';
      } else if (this.settings.zhiShiType === 2) {
        this.zhiShi = getGateByJieQi(this.jieQi);
      } else {
        this.zhiShi = '死门';
      }
    } else {
      this.zhiShi = QiMenConstants.BA_MEN_INITIAL[this.xunShouGongWei - 1] ?? '休门';
    }
  }

  private initializeDiPan() {
    this.diPan = [...this.diQiYi];
  }

  private initializeTianPan() {
    const hourGan = this.hourGan === '甲' ? this.xunShouYiZhang : this.hourGan;
    const hourGanIndex = this.diQiYi.findIndex((value) => value === hourGan);
    if (hourGanIndex >= 0) {
      this.newZhiFuGongWei = hourGanIndex + 1 === 5 ? 2 : hourGanIndex + 1;
    }

    const zhiFuRef = this.zhiFu === '天禽' ? '天芮' : this.zhiFu;
    const tianPan = Object.values(QiMenConstants.JIU_XING_SHUN).find(
      (stars) => stars[this.newZhiFuGongWei - 1] === zhiFuRef
    );

    this.tianPan = [...(tianPan ?? QiMenConstants.JIU_XING_SHUN[0])];
    const tianRuiIndex = this.tianPan.findIndex((star) => star === '天芮');
    if (tianRuiIndex >= 0) {
      this.tianPan[tianRuiIndex] = '芮禽';
    }

    this.tianPanQiYiTianQinYes = new Array(9).fill('');
    const tianQinIndex = this.tianPan.findIndex((star) => star === '芮禽' || star === '天禽');
    if (tianQinIndex >= 0) {
      this.tianPanQiYiTianQinYes[tianQinIndex] = this.diQiYi[4];
    }

    this.tianPanQiYiTianQinNo = this.tianPan.map((star, index) => {
      if (index === 4) {
        return this.diQiYi[4];
      }
      if (star === '芮禽') {
        return this.diQiYi[1];
      }
      if (!star) {
        return '';
      }
      const originalIndex = QiMenConstants.JIU_XING_INITIAL_MAP[star];
      return originalIndex ? this.diQiYi[originalIndex - 1] : '';
    });
  }

  private initializeRenPan() {
    const xunShouZhi = this.xunShou.substring(1, 2);
    let xunShouZhiIndex = QiMenConstants.DI_ZHI_QIMEN.indexOf(xunShouZhi);
    let hourZhiCount = 0;

    for (let i = 0; i < QiMenConstants.DI_ZHI_QIMEN.length; i += 1) {
      if (xunShouZhiIndex >= QiMenConstants.DI_ZHI_QIMEN.length) {
        xunShouZhiIndex = 0;
      }
      if (QiMenConstants.DI_ZHI_QIMEN[xunShouZhiIndex] === this.hourZhi) {
        break;
      }
      hourZhiCount += 1;
      xunShouZhiIndex += 1;
    }

    let xunShouGong = this.xunShouGongWei;
    if (xunShouZhi !== this.hourZhi) {
      for (let i = 0; i < hourZhiCount; i += 1) {
        if (this.yinYangDun === '阳遁') {
          xunShouGong = xunShouGong >= 9 ? 1 : xunShouGong + 1;
        } else {
          xunShouGong = xunShouGong <= 1 ? 9 : xunShouGong - 1;
        }
      }
    }

    this.newZhiShiGongWei = xunShouGong === 5 ? 2 : xunShouGong;
    this.renPan = [
      ...(Object.values(QiMenConstants.BA_MEN_SHUN_ZHUAN).find(
        (gates) => gates[this.newZhiShiGongWei - 1] === this.zhiShi
      ) ?? QiMenConstants.BA_MEN_SHUN_ZHUAN[0]),
    ];
  }

  private initializeShenPan() {
    const newZhiFuGong = this.newZhiFuGongWei === 5 ? 2 : this.newZhiFuGongWei;
    this.shenPan = this.yinYangDun === '阳遁'
      ? [...(QiMenConstants.BA_SHEN_SHUN_ZHUAN[newZhiFuGong] ?? QiMenConstants.BA_SHEN_SHUN_ZHUAN[1])]
      : [...(QiMenConstants.BA_SHEN_NI_ZHUAN[newZhiFuGong] ?? QiMenConstants.BA_SHEN_NI_ZHUAN[1])];
  }

  private getYearGanZhi() {
    const lunarRef = this.lunar as any;
    if (this.settings.yearGanZhiType === 0) {
      return lunarRef.getYearInGanZhi();
    }
    if (this.settings.yearGanZhiType === 1) {
      return lunarRef.getYearInGanZhiByLiChun();
    }
    return lunarRef.getYearInGanZhiExact();
  }

  private getMonthGanZhi() {
    const lunarRef = this.lunar as any;
    return this.settings.monthGanZhiType === 0
      ? lunarRef.getMonthInGanZhi()
      : lunarRef.getMonthInGanZhiExact();
  }

  private getDayGanZhiByRef(lunarRef: any) {
    return this.settings.dayGanZhiType === 0
      ? lunarRef.getDayInGanZhiExact()
      : lunarRef.getDayInGanZhiExact2();
  }

  private getShengXiao() {
    const lunarRef = this.lunar as any;
    if (this.settings.yearGanZhiType === 0) {
      return lunarRef.getYearShengXiao();
    }
    if (this.settings.yearGanZhiType === 1) {
      return lunarRef.getYearShengXiaoByLiChun();
    }
    return lunarRef.getYearShengXiaoExact();
  }

  private getPrevJieQiName() {
    const lunarRef = this.lunar as any;
    const jieQi = lunarRef.getPrevJieQi?.(this.settings.jieQiType === 0);
    return jieQi?.getName?.() ?? jieQi?.toString?.() ?? '冬至';
  }

  private getCurrentJieQi(lunarRef: any) {
    return lunarRef.getJieQi?.() ?? '';
  }

  private searchFuTouAndJieQi() {
    let matchedJieQi = '';

    for (let offset = 0; offset < QiMenConstants.SAN_YUAN_FU_TOU.length; offset += 1) {
      const lunarRef = (this.lunar as any).next(-offset);
      const dayGanZhi = this.getDayGanZhiByRef(lunarRef);
      const currentJieQi = this.getCurrentJieQi(lunarRef);

      if (!matchedJieQi && currentJieQi) {
        matchedJieQi = currentJieQi;
      }

      if (QiMenConstants.SAN_YUAN_FU_TOU.includes(dayGanZhi)) {
        return {
          fuTou: dayGanZhi,
          jieQi: matchedJieQi || this.getPrevJieQiName(),
        };
      }
    }

    return {
      fuTou: QiMenConstants.RI_ZHU_FU_TOU[this.dayGanZhi] ?? '甲子',
      jieQi: this.getPrevJieQiName(),
    };
  }

  private getYueJiangData(): [string, string] {
    const key = `${this.prevQi.toString()}${this.nextQi.toString()}`;
    const data = YUE_JIANG[key];
    if (!data) {
      throw new Error(`月将映射缺失: ${key}`);
    }
    return data;
  }

  private getLiuJiaXunKong() {
    return [...(QiMenConstants.LIU_JIA_XUN_KONG[this.xunShou] ?? [])];
  }

  private getLiuJiaXunKongGongWei() {
    return [...(QiMenConstants.LIU_JIA_XUN_KONG_GONG[this.getLiuJiaXunKong().join(',')] ?? [])];
  }

  private getYiMa() {
    return QiMenConstants.YI_MA[this.hourZhi];
  }

  private getSpecialMarks(map: Record<string, string>) {
    const values = new Set<string>();
    const collections = [this.tianPanQiYiTianQinYes, this.tianPanQiYiTianQinNo];

    collections.forEach((list) => {
      list.forEach((gan, index) => {
        if (!gan) {
          return;
        }
        const mark = map[`${gan}${index + 1}`];
        if (mark) {
          values.add(mark);
        }
      });
    });

    return [...values];
  }
}

export function createQiMenPaiPan(settings: QiMenSettings): QiMenResult {
  return new QiMenPaiPan(settings).getPaiPan();
}
