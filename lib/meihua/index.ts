// @ts-ignore - lunar-javascript types are incomplete
import { Solar, Lunar } from 'lunar-javascript';
import { MeiHuaResult, MeiHuaSettings } from '@/types';
import { formatDate, getRealAge } from '../utils/common';
import { parseLunarDateTimeString, parseSolarDateTimeString, solarPartsToDate } from '../utils/dateTime';
import { BA_GUA_SYMBOL } from '../constants';
import {
  BIAN_GUA,
  BA_GUA_FANG_WEI,
  BA_GUA_WU_XING,
  YONG_TI_GUAN_XI,
} from './constants';
import {
  DI_ZHI_SHU,
  DI_ZHI_WU_XING,
  GUA_NAME_AND_AS,
  HU_CUO_ZONG_FU,
  KONG_WANG,
  LIU_SHI_SI_GUA,
  LIU_SHI_SI_GUA_AS,
  LIU_SHI_SI_GUA_LIU_YAO_AS,
  LIU_SHI_SI_GUA_LIU_YAO_YAO_CI,
  LIU_SHI_SI_GUA_LIU_YAO_YAO_MING,
  LIU_SHI_SI_GUA_SHEN_CI,
  NA_YIN,
  TIAN_GAN_WU_XING,
  WU_BU_YU_SHI,
  XIAN_TIAN_BA_GUA,
  YUE_JIANG,
} from '../liuyao/liuyaoMaps';

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

type GuaNumbers = {
  shangGuaNumber: number;
  xiaGuaNumber: number;
  dongYaoNumber: number;
};

type GuaInfo = {
  shangGuaName: string;
  shangGuaAs: string;
  xiaGuaName: string;
  xiaGuaAs: string;
  guaName: string;
  guaAs: string;
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

function normalizeGuaNumber(value: number) {
  const mod = value % 8;
  return mod === 0 ? 8 : mod;
}

function normalizeDongYaoNumber(value: number) {
  const mod = value % 6;
  return mod === 0 ? 6 : mod;
}

function sumDigits(value: number) {
  return String(Math.abs(Math.trunc(value)))
    .split('')
    .reduce((total, digit) => total + Number(digit), 0);
}

function parseGuaMaValue(guaMa?: number): GuaNumbers | null {
  if (!guaMa) {
    return null;
  }

  const digits = String(Math.abs(Math.trunc(guaMa)));
  if (digits.length < 3) {
    return null;
  }

  const [shang, xia, dong] = digits
    .slice(0, 3)
    .split('')
    .map((digit) => Number(digit));

  if ([shang, xia, dong].some((digit) => Number.isNaN(digit))) {
    return null;
  }

  return {
    shangGuaNumber: normalizeGuaNumber(shang),
    xiaGuaNumber: normalizeGuaNumber(xia),
    dongYaoNumber: normalizeDongYaoNumber(dong),
  };
}

export class MeiHuaPaiPan {
  private settings: Required<
    Pick<
      MeiHuaSettings,
      | 'name'
      | 'occupy'
      | 'sex'
      | 'date'
      | 'dateType'
      | 'leapMonthType'
      | 'xuShiSuiType'
      | 'jieQiType'
      | 'yearGanZhiType'
      | 'monthGanZhiType'
      | 'dayGanZhiType'
      | 'guaMa'
      | 'paiPanType'
      | 'shu'
      | 'danShu'
      | 'shuangShuOne'
      | 'shuangShuTwo'
      | 'shangXiaGuaType'
      | 'dongYaoType'
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

  private shangGuaNumber = 1;
  private xiaGuaNumber = 1;
  private dongYaoNumber = 1;
  private guaMa = 111;

  constructor(settings: MeiHuaSettings) {
    this.settings = {
      name: settings.name ?? '',
      occupy: settings.occupy ?? '',
      sex: settings.sex ?? 1,
      date: settings.date ?? '2024-01-01 00:00:00',
      dateType: settings.dateType ?? 0,
      leapMonthType: settings.leapMonthType ?? 0,
      xuShiSuiType: settings.xuShiSuiType ?? 0,
      jieQiType: settings.jieQiType ?? 1,
      yearGanZhiType: settings.yearGanZhiType ?? 2,
      monthGanZhiType: settings.monthGanZhiType ?? 1,
      dayGanZhiType: settings.dayGanZhiType ?? 0,
      guaMa: settings.guaMa ?? 0,
      paiPanType: settings.paiPanType ?? 0,
      shu: settings.shu ?? 123,
      danShu: settings.danShu ?? 12345,
      shuangShuOne: settings.shuangShuOne ?? 12,
      shuangShuTwo: settings.shuangShuTwo ?? 34,
      shangXiaGuaType: settings.shangXiaGuaType ?? 0,
      dongYaoType: settings.dongYaoType ?? 0,
    };

    this.initializeDate();
    this.initializeGanZhi();
    this.initializeJieQi();
    this.initializeNumbers();
  }

  public getPaiPan(): MeiHuaResult {
    const shangGuaName = XIAN_TIAN_BA_GUA[this.shangGuaNumber] ?? '';
    const xiaGuaName = XIAN_TIAN_BA_GUA[this.xiaGuaNumber] ?? '';
    const benGuaAs = this.getGuaAsByNumbers(this.shangGuaNumber, this.xiaGuaNumber);
    const { shangGuaNumber: bianShang, xiaGuaNumber: bianXia } = this.getBianGuaNumbers();
    const bianGuaAs = this.getGuaAsByNumbers(bianShang, bianXia);
    const [huGuaAs = '', cuoGuaAs = '', zongGuaAs = ''] = HU_CUO_ZONG_FU[benGuaAs] ?? ['', '', ''];

    const benGuaInfo = this.getGuaInfoByAs(benGuaAs);
    const bianGuaInfo = this.getGuaInfoByAs(bianGuaAs);
    const huGuaInfo = this.getGuaInfoByAs(huGuaAs);
    const cuoGuaInfo = this.getGuaInfoByAs(cuoGuaAs);
    const zongGuaInfo = this.getGuaInfoByAs(zongGuaAs);

    const shangGuaYong = this.dongYaoNumber > 3;
    const tiGua = shangGuaYong ? xiaGuaName : shangGuaName;
    const yongGua = shangGuaYong ? shangGuaName : xiaGuaName;
    const prevJieDate = this.prevJie.getSolar().toYmdHms();
    const nextJieDate = this.nextJie.getSolar().toYmdHms();
    const prevQiDate = this.prevQi.getSolar().toYmdHms();
    const nextQiDate = this.nextQi.getSolar().toYmdHms();
    const yueJiangData = this.getYueJiangData();

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

      guaMa: this.guaMa,
      shangGua: this.formatTrigram(shangGuaName),
      xiaGua: this.formatTrigram(xiaGuaName),
      dongYao: this.dongYaoNumber,
      benGua: benGuaInfo.guaName,
      bianGua: bianGuaInfo.guaName,
      huGua: huGuaInfo.guaName,
      cuoGua: cuoGuaInfo.guaName,
      zongGua: zongGuaInfo.guaName,

      tiGua,
      yongGua,
      tiGuaWuXing: BA_GUA_WU_XING[tiGua] ?? '',
      yongGuaWuXing: BA_GUA_WU_XING[yongGua] ?? '',
      tiYongGuanXi: YONG_TI_GUAN_XI[`${yongGua}${tiGua}`] ?? '',

      benGuaWuXing: `上卦${BA_GUA_WU_XING[shangGuaName] ?? ''}，下卦${BA_GUA_WU_XING[xiaGuaName] ?? ''}`,
      benGuaFangWei: `上卦${BA_GUA_FANG_WEI[shangGuaName] ?? ''}，下卦${BA_GUA_FANG_WEI[xiaGuaName] ?? ''}`,

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
      yearNaYin: NA_YIN[this.yearGanZhi],
      monthNaYin: NA_YIN[this.monthGanZhi],
      dayNaYin: NA_YIN[this.dayGanZhi],
      hourNaYin: NA_YIN[this.hourGanZhi],
      yearKongWang: formatKongWang(KONG_WANG[this.yearGanZhi]),
      monthKongWang: formatKongWang(KONG_WANG[this.monthGanZhi]),
      dayKongWang: formatKongWang(KONG_WANG[this.dayGanZhi]),
      hourKongWang: formatKongWang(KONG_WANG[this.hourGanZhi]),

      prevJie: this.prevJie.toString(),
      prevJieDate,
      prevJieDay: diffParts(solarToDate(this.prevJie.getSolar()), this.solarDate).day,
      nextJie: this.nextJie.toString(),
      nextJieDate,
      nextJieDay: diffParts(this.solarDate, solarToDate(this.nextJie.getSolar())).day,
      prevQi: this.prevQi.toString(),
      prevQiDate,
      prevQiDay: diffParts(solarToDate(this.prevQi.getSolar()), this.solarDate).day,
      nextQi: this.nextQi.toString(),
      nextQiDate,
      nextQiDay: diffParts(this.solarDate, solarToDate(this.nextQi.getSolar())).day,
      chuShengJie: `${formatBirthMarker(this.prevJie.toString(), '后', solarToDate(this.prevJie.getSolar()), this.solarDate)}、${formatBirthMarker(this.nextJie.toString(), '前', this.solarDate, solarToDate(this.nextJie.getSolar()))}`,
      chuShengQi: `${formatBirthMarker(this.prevQi.toString(), '后', solarToDate(this.prevQi.getSolar()), this.solarDate)}、${formatBirthMarker(this.nextQi.toString(), '前', this.solarDate, solarToDate(this.nextQi.getSolar()))}`,

      benGuaGuaCi: this.getGuaCi(benGuaInfo.guaName),
      bianGuaGuaCi: this.getGuaCi(bianGuaInfo.guaName),
      huGuaGuaCi: this.getGuaCi(huGuaInfo.guaName),
      cuoGuaGuaCi: this.getGuaCi(cuoGuaInfo.guaName),
      zongGuaGuaCi: this.getGuaCi(zongGuaInfo.guaName),

      benGuaLiuYao: this.getLiuYaoInfo(benGuaAs),
      bianGuaLiuYao: this.getLiuYaoInfo(bianGuaAs),
      huGuaLiuYao: this.getLiuYaoInfo(huGuaAs),
      cuoGuaLiuYao: this.getLiuYaoInfo(cuoGuaAs),
      zongGuaLiuYao: this.getLiuYaoInfo(zongGuaAs),

      benGuaShangGuaName: benGuaInfo.shangGuaName,
      benGuaXiaGuaName: benGuaInfo.xiaGuaName,
      benGuaShangGuaAs: benGuaInfo.shangGuaAs,
      benGuaXiaGuaAs: benGuaInfo.xiaGuaAs,
      bianGuaShangGuaName: bianGuaInfo.shangGuaName,
      bianGuaXiaGuaName: bianGuaInfo.xiaGuaName,
      bianGuaShangGuaAs: bianGuaInfo.shangGuaAs,
      bianGuaXiaGuaAs: bianGuaInfo.xiaGuaAs,
      huGuaShangGuaName: huGuaInfo.shangGuaName,
      huGuaXiaGuaName: huGuaInfo.xiaGuaName,
      huGuaShangGuaAs: huGuaInfo.shangGuaAs,
      huGuaXiaGuaAs: huGuaInfo.xiaGuaAs,
      cuoGuaShangGuaName: cuoGuaInfo.shangGuaName,
      cuoGuaXiaGuaName: cuoGuaInfo.xiaGuaName,
      cuoGuaShangGuaAs: cuoGuaInfo.shangGuaAs,
      cuoGuaXiaGuaAs: cuoGuaInfo.xiaGuaAs,
      zongGuaShangGuaName: zongGuaInfo.shangGuaName,
      zongGuaXiaGuaName: zongGuaInfo.xiaGuaName,
      zongGuaShangGuaAs: zongGuaInfo.shangGuaAs,
      zongGuaXiaGuaAs: zongGuaInfo.xiaGuaAs,

      shengXiao: this.getShengXiao(),
      xingZuo: `${this.solar.getXingZuo()}座`,
      yueXiang: this.lunar.getYueXiang(),
      yueJiang: yueJiangData[0],
      yueJiangShen: yueJiangData[1],
      wuBuYuShi: this.hourGanZhi === WU_BU_YU_SHI[this.dayGan],
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

  private initializeNumbers() {
    const explicitGuaMa = parseGuaMaValue(this.settings.guaMa);
    const numbers = explicitGuaMa ?? this.generateNumbers();

    this.shangGuaNumber = numbers.shangGuaNumber;
    this.xiaGuaNumber = numbers.xiaGuaNumber;
    this.dongYaoNumber = numbers.dongYaoNumber;
    this.guaMa = this.shangGuaNumber * 100 + this.xiaGuaNumber * 10 + this.dongYaoNumber;
  }

  private generateNumbers(): GuaNumbers {
    if (this.settings.paiPanType === 1) {
      return {
        shangGuaNumber: Math.floor(Math.random() * 8) + 1,
        xiaGuaNumber: Math.floor(Math.random() * 8) + 1,
        dongYaoNumber: Math.floor(Math.random() * 6) + 1,
      };
    }

    if (this.settings.paiPanType === 2) {
      const number = String(this.settings.shu);
      const shang = Number(number[0] ?? '1');
      const xia = Number(number[1] ?? '2');
      const dong = Number(number[2] ?? '3');

      return {
        shangGuaNumber: normalizeGuaNumber(shang),
        xiaGuaNumber: normalizeGuaNumber(xia),
        dongYaoNumber: normalizeDongYaoNumber(dong),
      };
    }

    if (this.settings.paiPanType === 3) {
      const danShu = String(this.settings.danShu);
      const half = Math.floor(danShu.length / 2);
      const number1 = danShu.substring(0, half);
      const number2 = danShu.substring(half);
      const number1Count = number1 ? sumDigits(Number(number1)) : 0;
      const number2Count = number2 ? sumDigits(Number(number2)) : 0;

      return {
        shangGuaNumber: normalizeGuaNumber(number1Count),
        xiaGuaNumber: normalizeGuaNumber(number2Count),
        dongYaoNumber: normalizeDongYaoNumber(number1Count + number2Count),
      };
    }

    if (this.settings.paiPanType === 4) {
      let shuangShuOne = this.settings.shuangShuOne;
      let shuangShuTwo = this.settings.shuangShuTwo;

      if (this.settings.shangXiaGuaType === 0) {
        shuangShuOne = sumDigits(shuangShuOne);
        shuangShuTwo = sumDigits(shuangShuTwo);
      }

      let dongYaoBase = shuangShuOne + shuangShuTwo;
      if (this.settings.dongYaoType === 1) {
        dongYaoBase += DI_ZHI_SHU[this.hourZhi] ?? 1;
      }

      return {
        shangGuaNumber: normalizeGuaNumber(shuangShuOne),
        xiaGuaNumber: normalizeGuaNumber(shuangShuTwo),
        dongYaoNumber: normalizeDongYaoNumber(dongYaoBase),
      };
    }

    const yearNumber = DI_ZHI_SHU[this.yearZhi] ?? 1;
    const monthNumber = this.lunar.getMonth();
    const dayNumber = this.lunar.getDay();
    const hourNumber = DI_ZHI_SHU[this.hourZhi] ?? 1;

    return {
      shangGuaNumber: normalizeGuaNumber(yearNumber + monthNumber + dayNumber),
      xiaGuaNumber: normalizeGuaNumber(yearNumber + monthNumber + dayNumber + hourNumber),
      dongYaoNumber: normalizeDongYaoNumber(yearNumber + monthNumber + dayNumber + hourNumber),
    };
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

  private getYueJiangData(): [string, string] {
    const key = `${this.prevQi.toString()}${this.nextQi.toString()}`;
    const data = YUE_JIANG[key];
    if (!data) {
      throw new Error(`月将映射缺失: ${key}`);
    }
    return data;
  }

  private getGuaAsByNumbers(shangGuaNumber: number, xiaGuaNumber: number) {
    return LIU_SHI_SI_GUA_AS[`${shangGuaNumber},${xiaGuaNumber}`] ?? '';
  }

  private getBianGuaNumbers() {
    if (this.dongYaoNumber <= 3) {
      return {
        shangGuaNumber: this.shangGuaNumber,
        xiaGuaNumber: BIAN_GUA[this.xiaGuaNumber]?.[this.dongYaoNumber - 1] ?? this.xiaGuaNumber,
      };
    }

    return {
      shangGuaNumber: BIAN_GUA[this.shangGuaNumber]?.[this.dongYaoNumber - 4] ?? this.shangGuaNumber,
      xiaGuaNumber: this.xiaGuaNumber,
    };
  }

  private getGuaInfoByAs(guaAs: string): GuaInfo {
    const liuYaoAs = LIU_SHI_SI_GUA_LIU_YAO_AS[guaAs];
    const info = liuYaoAs ? GUA_NAME_AND_AS[liuYaoAs.join(',') as keyof typeof GUA_NAME_AND_AS] : undefined;

    return {
      shangGuaName: info?.[0] ?? '',
      shangGuaAs: info?.[1] ?? '',
      xiaGuaName: info?.[2] ?? '',
      xiaGuaAs: info?.[3] ?? '',
      guaName: info?.[4] ?? LIU_SHI_SI_GUA[guaAs] ?? '',
      guaAs: info?.[5] ?? guaAs,
    };
  }

  private getGuaCi(guaName: string) {
    return LIU_SHI_SI_GUA_SHEN_CI[guaName]?.[2] ?? '';
  }

  private getLiuYaoInfo(guaAs: string) {
    return {
      yaoMing: [...(LIU_SHI_SI_GUA_LIU_YAO_YAO_MING[guaAs] ?? ['', '', '', '', '', ''])],
      yaoXiang: [...(LIU_SHI_SI_GUA_LIU_YAO_AS[guaAs] ?? ['', '', '', '', '', ''])],
      yaoCi: [...(LIU_SHI_SI_GUA_LIU_YAO_YAO_CI[guaAs] ?? ['', '', '', '', '', ''])],
    };
  }

  private formatTrigram(guaName: string) {
    return `${guaName}(${BA_GUA_SYMBOL[guaName] ?? ''})`;
  }
}

export function createMeiHuaPaiPan(settings: MeiHuaSettings): MeiHuaResult {
  return new MeiHuaPaiPan(settings).getPaiPan();
}
