// @ts-ignore - lunar-javascript 类型定义不完整
import { Solar, Lunar } from 'lunar-javascript';
import { ZiWeiGongWei, ZiWeiResult, ZiWeiSettings } from '@/types';
import { formatDate, getRealAge } from '../utils/common';
import { parseLunarDateTimeString, parseSolarDateTimeString, solarPartsToDate } from '../utils/dateTime';
import * as ZW from './constants';

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

const PALACE_ZHI_ORDER = [...ZW.SHI_ER_GONG_DI_ZHI];

function createEmptyPalaceList() {
  return new Array(12).fill('');
}

function wrapGongWei(value: number) {
  let current = value;
  while (current > 12) current -= 12;
  while (current < 1) current += 12;
  return current;
}

function appendStar(value: string, star: string) {
  return value ? `${value}_${star}` : star;
}

function splitStars(value?: string) {
  if (!value) {
    return [];
  }
  return value.split('_').filter(Boolean);
}

function uniqueStrings(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function solarToDate(solar: {
  getYear(): number;
  getMonth(): number;
  getDay(): number;
  getHour(): number;
  getMinute(): number;
  getSecond(): number;
}) {
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

function findStarGongWei(zhuXing: string[], xingMing: string) {
  for (let i = 0; i < zhuXing.length; i++) {
    const stars = splitStars(zhuXing[i]);
    if (stars.includes(xingMing)) {
      return i + 1;
    }
  }
  return 0;
}

function addZhuXing(source: string[], target: string[], index: number, mark = '') {
  const stars = splitStars(source[index]);
  for (const star of stars) {
    target.push(`${mark}${star}`);
  }
}

function getMarkPrefix(value: string) {
  const [prefix] = value.split('_', 1);
  const parsed = Number(prefix);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export class ZiWeiPaiPan {
  private settings:
    Required<
      Pick<
        ZiWeiSettings,
        | 'name'
        | 'occupy'
        | 'sex'
        | 'date'
        | 'dateType'
        | 'leapMonthType'
        | 'xuShiSuiType'
        | 'jieQiType'
        | 'wuXingJuType'
        | 'yearGanZhiType'
        | 'monthGanZhiType'
        | 'dayGanZhiType'
      >
    >
    & Pick<ZiWeiSettings, 'birthHour'>;

  private solar!: Solar;
  private lunar!: Lunar;
  private solarDate!: Date;
  private eightChar: any;

  private prevJie!: JieQiRef;
  private nextJie!: JieQiRef;
  private prevQi!: JieQiRef;
  private nextQi!: JieQiRef;

  private yearGan = '';
  private monthGan = '';
  private dayGan = '';
  private hourGan = '';
  private yearZhi = '';
  private monthZhi = '';
  private dayZhi = '';
  private hourZhi = '';
  private yearGanZhi = '';
  private monthGanZhi = '';
  private dayGanZhi = '';
  private hourGanZhi = '';

  private mingGongGongWei = 0;
  private shenGongGongWei = 0;
  private wuXingJu = '';

  private shiErGongZhuXing: string[][] = [];
  private shiErGongZhuXingMark: string[][] = [];

  constructor(settings: ZiWeiSettings) {
    this.settings = {
      name: settings.name ?? '',
      occupy: settings.occupy ?? '',
      sex: settings.sex ?? 1,
      date: settings.date ?? '2024-01-01 00:00:00',
      dateType: settings.dateType ?? 0,
      birthHour: settings.birthHour,
      leapMonthType: settings.leapMonthType ?? 0,
      xuShiSuiType: settings.xuShiSuiType ?? 0,
      jieQiType: settings.jieQiType ?? 1,
      wuXingJuType: settings.wuXingJuType ?? 0,
      yearGanZhiType: settings.yearGanZhiType ?? 2,
      monthGanZhiType: settings.monthGanZhiType ?? 1,
      dayGanZhiType: settings.dayGanZhiType ?? 0,
    };

    this.initializeDate();
    this.initializeGanZhi();
    this.initializeJieQi();
  }

  private getEffectiveHour(hour: number) {
    if (this.settings.birthHour === undefined) {
      return hour;
    }

    if (
      Number.isNaN(this.settings.birthHour)
      || !Number.isInteger(this.settings.birthHour)
      || this.settings.birthHour < 0
      || this.settings.birthHour > 23
    ) {
      throw new Error('birthHour 必须是 0 到 23 之间的整数');
    }

    return this.settings.birthHour;
  }

  public getPaiPan(): ZiWeiResult {
    const yueJiangData = this.getYueJiangData();
    const shiErGongDiZhi = this.getShiErGongDiZhi();
    const shiErGongTianGan = this.getShiErGongTianGan();
    const shiErMingGong = this.getShiErMingGong();
    const shiErShenGong = this.getShiErShenGong();
    const ziWeiXingGongWei = this.getZiWeiXingGongWei();
    const tianFuXingGongWei = this.getTianFuXingGongWei();
    const ziWeiXingGongDiZhi = this.getZiWeiXingGongDiZhi();
    const tianFuXingGongDiZhi = this.getTianFuXingGongDiZhi();
    const ziWeiXingXiZhuXing = this.getZiWeiXingXiZhuXing();
    const tianFuXingXiZhuXing = this.getTianFuXingXiZhuXing();
    const shiZhiZhuXing = this.getShiZhiZhuXing();
    const yueZhiZhuXing = this.getYueZhiZhuXing();
    const nianGanZhuXing = this.getNianGanZhuXing();
    const nianZhiZhuXing = this.getNianZhiZhuXing();
    const dayZhuXing = this.getDayZhuXing();
    const shiErZhangSheng = this.getShiErZhangSheng();
    const jieLuKongWang = this.getJieLuKongWang();
    const xunZhongKongWang = this.getXunZhongKongWang();
    const tianShangTianShiXing = this.getTianShangTianShiXing();
    const daXian = this.getDaXian();
    const xiaoXian = this.getXiaoXian();
    const shiErGongBoShi = this.getShiErGongBoShi();
    const liuNianSuiQianZhuXing = this.getLiuNianSuiQianZhuXing();
    const liuNianJiangQianZhuXing = this.getLiuNianJiangQianZhuXing();
    const shiErGongZhuXing = this.getShiErGongZhuXing(false);
    const shiErGongZhuXingMark = this.getShiErGongZhuXing(true);
    const shiErGongZhuXingGuanXi = this.getShiErGongZhuXingGuanXi();
    const shiErGongSiHuaXing = this.getShiErGongSiHuaXing();
    const shiErGongSiHuaXingGuanXi = this.getShiErGongSiHuaXingGuanXi();
    const gongWei = this.buildGongWei({
      shiErGongDiZhi,
      shiErGongTianGan,
      shiErMingGong,
      shiErShenGong,
      shiErGongZhuXing,
      shiErGongZhuXingMark,
      shiErGongZhuXingGuanXi,
      shiErGongSiHuaXing,
      shiErGongSiHuaXingGuanXi,
      shiErZhangSheng,
      shiErGongBoShi,
      liuNianSuiQianZhuXing,
      liuNianJiangQianZhuXing,
    });

    const huaLu = ZW.SI_HUA_GONG_WEI[this.yearGan]?.[0] ?? '';
    const huaQuan = ZW.SI_HUA_GONG_WEI[this.yearGan]?.[1] ?? '';
    const huaKe = ZW.SI_HUA_GONG_WEI[this.yearGan]?.[2] ?? '';
    const huaJi = ZW.SI_HUA_GONG_WEI[this.yearGan]?.[3] ?? '';

    const prevJieDate = this.prevJie.getSolar().toYmdHms();
    const nextJieDate = this.nextJie.getSolar().toYmdHms();
    const prevQiDate = this.prevQi.getSolar().toYmdHms();
    const nextQiDate = this.nextQi.getSolar().toYmdHms();

    return {
      solar: formatDate(this.solarDate),
      lunar: this.lunar.toString(),
      name: this.settings.name || undefined,
      occupy: this.settings.occupy || undefined,
      sex: this.getSex(),
      age: calculateAge(this.solarDate, this.settings.xuShiSuiType),
      zao: this.settings.sex === 1 ? '乾造' : '坤造',
      xingQi: `星期${this.lunar.getWeekInChinese()}`,
      jiJie: this.lunar.getSeason(),
      shengXiao: this.getShengXiao(),
      xingZuo: `${this.solar.getXingZuo()}座`,
      yueXiang: this.lunar.getYueXiang(),
      yueJiang: yueJiangData[0],
      yueJiangShen: yueJiangData[1],
      wuBuYuShi: this.hourGanZhi === ZW.WU_BU_YU_SHI[this.dayGan],

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

      yearGanWuXing: ZW.TIAN_GAN_WU_XING[this.yearGan],
      monthGanWuXing: ZW.TIAN_GAN_WU_XING[this.monthGan],
      dayGanWuXing: ZW.TIAN_GAN_WU_XING[this.dayGan],
      hourGanWuXing: ZW.TIAN_GAN_WU_XING[this.hourGan],
      yearZhiWuXing: ZW.DI_ZHI_WU_XING[this.yearZhi],
      monthZhiWuXing: ZW.DI_ZHI_WU_XING[this.monthZhi],
      dayZhiWuXing: ZW.DI_ZHI_WU_XING[this.dayZhi],
      hourZhiWuXing: ZW.DI_ZHI_WU_XING[this.hourZhi],
      yearGanZhiWuXing: `${ZW.TIAN_GAN_WU_XING[this.yearGan]}${ZW.DI_ZHI_WU_XING[this.yearZhi]}`,
      monthGanZhiWuXing: `${ZW.TIAN_GAN_WU_XING[this.monthGan]}${ZW.DI_ZHI_WU_XING[this.monthZhi]}`,
      dayGanZhiWuXing: `${ZW.TIAN_GAN_WU_XING[this.dayGan]}${ZW.DI_ZHI_WU_XING[this.dayZhi]}`,
      hourGanZhiWuXing: `${ZW.TIAN_GAN_WU_XING[this.hourGan]}${ZW.DI_ZHI_WU_XING[this.hourZhi]}`,
      yearGanZhiNaYin: ZW.NA_YIN[this.yearGanZhi],
      monthGanZhiNaYin: ZW.NA_YIN[this.monthGanZhi],
      dayGanZhiNaYin: ZW.NA_YIN[this.dayGanZhi],
      hourGanZhiNaYin: ZW.NA_YIN[this.hourGanZhi],
      yearGanZhiKongWang: ZW.KONG_WANG[this.yearGanZhi],
      monthGanZhiKongWang: ZW.KONG_WANG[this.monthGanZhi],
      dayGanZhiKongWang: ZW.KONG_WANG[this.dayGanZhi],
      hourGanZhiKongWang: ZW.KONG_WANG[this.hourGanZhi],

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

      wuXingJu: this.getWuXingJu(),
      mingGong: this.getMingGongDiZhi(),
      shenGong: this.getShenGongDiZhi(),
      mingGongGongWei: this.getMingGongGongWei(),
      shenGongGongWei: this.getShenGongGongWei(),
      ziWeiXingGongWei,
      tianFuXingGongWei,
      ziWeiXingGongDiZhi,
      tianFuXingGongDiZhi,
      shiErGongDiZhi,
      shiErGongTianGan,
      shiErMingGong,
      shiErShenGong,

      ziWeiXingXiZhuXing,
      tianFuXingXiZhuXing,
      shiZhiZhuXing,
      yueZhiZhuXing,
      nianGanZhuXing,
      nianZhiZhuXing,
      dayZhuXing,
      shiErZhangSheng,
      jieLuKongWang,
      xunZhongKongWang,
      tianShangTianShiXing,
      shiErGongBoShi,
      liuNianSuiQianZhuXing,
      liuNianJiangQianZhuXing,
      shiErGongZhuXing,
      shiErGongZhuXingMark,
      shiErGongZhuXingGuanXi,

      gongWei,

      huaLu,
      huaQuan,
      huaKe,
      huaJi,
      shiErGongSiHuaXing,
      shiErGongSiHuaXingGuanXi,
      huaLuJieDu: this.getHuaLuXingGongWeiJieDu(),
      huaQuanJieDu: this.getHuaQuanXingGongWeiJieDu(),
      huaKeJieDu: this.getHuaKeXingGongWeiJieDu(),
      huaJiJieDu: this.getHuaJiXingGongWeiJieDu(),

      daXian,
      xiaoXian,
      mingZhu: this.getMingZhu(),
      shenZhu: this.getShenZhu(),
      ziDou: this.getZiDou(),
      liuDou: this.getLiuDou(),
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
        this.getEffectiveHour(lunarParts.hour),
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

    this.solarDate = solarPartsToDate({
      ...solarParts,
      hour: this.getEffectiveHour(solarParts.hour),
    });
    this.solar = Solar.fromDate(this.solarDate);
    this.lunar = this.solar.getLunar();
  }

  private initializeGanZhi() {
    this.yearGanZhi = this.getYearGanZhi();
    this.monthGanZhi = this.getMonthGanZhi();
    this.dayGanZhi = this.getDayGanZhi();

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
  private getSex() {
    return this.settings.sex === 1 ? '男' : '女';
  }

  private getNanNvYinYang() {
    return `${ZW.TIAN_GAN_YIN_YANG[this.yearGan]}${this.getSex()}`;
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

  private getDayGanZhi() {
    const lunarRef = this.lunar as any;
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
    const data = ZW.YUE_JIANG[key];
    if (!data) {
      throw new Error(`月将映射缺失: ${key}`);
    }
    return data as [string, string];
  }

  private getShiErGongDiZhi() {
    return [...PALACE_ZHI_ORDER];
  }

  private getShiErGongTianGan() {
    return this.getShiErGongDiZhi().map((zhi) => ZW.SHI_ER_GONG_TIAN_GAN[`${this.yearGan}${zhi}`] ?? '');
  }

  private getMingGongGongWei() {
    if (this.mingGongGongWei) {
      return this.mingGongGongWei;
    }

    let gongWei = this.lunar.getMonth() > 0 ? this.lunar.getMonth() : -this.lunar.getMonth() + 1;
    for (let i = 0; i < ZW.DI_ZHI.length; i++) {
      if (ZW.DI_ZHI[i] !== this.hourZhi) {
        gongWei -= 1;
        if (gongWei === 0) {
          gongWei = 12;
        }
      } else {
        break;
      }
    }

    this.mingGongGongWei = gongWei;
    return gongWei;
  }

  private getShenGongGongWei() {
    if (this.shenGongGongWei) {
      return this.shenGongGongWei;
    }

    let gongWei = this.lunar.getMonth() > 0 ? this.lunar.getMonth() : -this.lunar.getMonth() + 1;
    for (let i = 0; i < ZW.DI_ZHI.length; i++) {
      if (ZW.DI_ZHI[i] !== this.hourZhi) {
        gongWei += 1;
        if (gongWei === 13) {
          gongWei = 1;
        }
      } else {
        break;
      }
    }

    this.shenGongGongWei = gongWei;
    return gongWei;
  }

  private getMingGongDiZhi() {
    return ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.getMingGongGongWei()];
  }

  private getShenGongDiZhi() {
    return ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.getShenGongGongWei()];
  }

  private getShiErMingGong() {
    const mingGongGongWei = this.getMingGongGongWei();
    const shiErMingGong = createEmptyPalaceList();
    shiErMingGong[mingGongGongWei - 1] = '命宫';
    let index = 0;
    for (let i = mingGongGongWei - 2; index < ZW.SHI_ER_GONG.length; i--) {
      if (i < 0) {
        i = 11;
      }
      shiErMingGong[i] = ZW.SHI_ER_GONG[index];
      index += 1;
    }
    return shiErMingGong;
  }

  private getShiErShenGong() {
    const shiErShenGong = createEmptyPalaceList();
    shiErShenGong[this.getShenGongGongWei() - 1] = '身宫';
    return shiErShenGong;
  }

  private getWuXingJu() {
    if (this.wuXingJu) {
      return this.wuXingJu;
    }

    const mingGongIndex = this.getMingGongGongWei() - 1;
    const shiErGongDiZhi = this.getShiErGongDiZhi();
    if (this.settings.wuXingJuType === 0) {
      this.wuXingJu = ZW.WU_XING_JU_1[`${this.yearGan}${shiErGongDiZhi[mingGongIndex]}`] ?? '';
    } else {
      const shiErGongTianGan = this.getShiErGongTianGan();
      this.wuXingJu = ZW.WU_XING_JU_2[`${shiErGongTianGan[mingGongIndex]}${shiErGongDiZhi[mingGongIndex]}`] ?? '';
    }
    return this.wuXingJu;
  }

  private getZiWeiXingGongWei() {
    const lunarDay = Math.abs(this.lunar.getDay());
    return ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[ZW.ZI_WEI_XING_GONG_WEI[`${lunarDay}${this.getWuXingJu()}`]];
  }

  private getTianFuXingGongWei() {
    return ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[ZW.TIAN_FU_ZI_WEI[this.getZiWeiXingGongDiZhi()]];
  }

  private getZiWeiXingGongDiZhi() {
    return ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.getZiWeiXingGongWei()];
  }

  private getTianFuXingGongDiZhi() {
    return ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.getTianFuXingGongWei()];
  }

  private getZiWeiXingXiZhuXing() {
    return [...(ZW.ZI_WEI_XING_XING_XI_ZHU_XING[this.getZiWeiXingGongDiZhi()] ?? createEmptyPalaceList())];
  }

  private getTianFuXingXiZhuXing() {
    return [...(ZW.TIAN_FU_XING_XING_XI_ZHU_XING[this.getTianFuXingGongDiZhi()] ?? createEmptyPalaceList())];
  }

  private getShiZhiZhuXing() {
    return [...(ZW.SHI_ZHI_ZHU_XING[`${this.hourZhi}${this.yearZhi}`] ?? createEmptyPalaceList())];
  }

  private getYueZhiZhuXing() {
    return [...(ZW.YUE_ZHI_ZHU_XING[this.monthZhi] ?? createEmptyPalaceList())];
  }

  private getNianGanZhuXing() {
    return [...(ZW.NIAN_GAN_ZHU_XING[this.yearGan] ?? createEmptyPalaceList())];
  }

  private getNianZhiZhuXing() {
    const nianZhiZhuXing = [...(ZW.NIAN_ZHI_ZHU_XING[this.yearZhi] ?? createEmptyPalaceList())];
    const tianCaiXingGongName = ZW.NIAN_ZHI_TIAN_CAI_XING_GONG_WEI[this.yearZhi];
    const shiErMingGong = this.getShiErMingGong();

    for (let i = 0; i < shiErMingGong.length; i++) {
      if (shiErMingGong[i] === tianCaiXingGongName) {
        nianZhiZhuXing[i] = appendStar(nianZhiZhuXing[i], '天才');
        break;
      }
    }

    for (let i = 0; i < ZW.DI_ZHI.length; i++) {
      if (this.yearZhi === ZW.DI_ZHI[i]) {
        const gongWei = wrapGongWei(this.getShenGongGongWei() + i);
        nianZhiZhuXing[gongWei - 1] = appendStar(nianZhiZhuXing[gongWei - 1], '天寿');
        break;
      }
    }

    return nianZhiZhuXing;
  }

  private getDayZhuXing() {
    const days = this.lunar.getDay() - 1;
    const dayZhuXing = createEmptyPalaceList();

    const zuoFuXingGongWei = findStarGongWei(this.getYueZhiZhuXing(), '左辅');
    const sanTaiXingGongWei = wrapGongWei(zuoFuXingGongWei + days);
    dayZhuXing[sanTaiXingGongWei - 1] = '三台';

    const youBiXingGongWei = findStarGongWei(this.getYueZhiZhuXing(), '右弼');
    let baZuoXingGongWei = youBiXingGongWei - days;
    while (baZuoXingGongWei < 0) {
      baZuoXingGongWei += 12;
    }
    baZuoXingGongWei = baZuoXingGongWei === 0 ? 1 : baZuoXingGongWei;
    dayZhuXing[baZuoXingGongWei - 1] = '八座';

    const wenChangXingGongWei = findStarGongWei(this.getShiZhiZhuXing(), '文昌');
    let enGuangXingGongWei = wrapGongWei(wenChangXingGongWei + days);
    enGuangXingGongWei = enGuangXingGongWei - 1 === 0 ? 12 : enGuangXingGongWei - 1;
    dayZhuXing[enGuangXingGongWei - 1] = '恩光';

    const wenQuXingGongWei = findStarGongWei(this.getShiZhiZhuXing(), '文曲');
    let tianGuiXingGongWei = wrapGongWei(wenQuXingGongWei + days);
    tianGuiXingGongWei = tianGuiXingGongWei - 1 === 0 ? 12 : tianGuiXingGongWei - 1;
    dayZhuXing[tianGuiXingGongWei - 1] = '天贵';

    return dayZhuXing;
  }

  private getShiErZhangSheng() {
    let yinYang = this.getNanNvYinYang();
    if (yinYang === '阳女') {
      yinYang = '阴男';
    } else if (yinYang === '阴女') {
      yinYang = '阳男';
    }
    return [...(ZW.SHI_ER_ZHANG_SHENG[`${yinYang}${this.getWuXingJu()}`] ?? createEmptyPalaceList())];
  }

  private getJieLuKongWang() {
    const jieLuKongWang = createEmptyPalaceList();
    const luoGong = ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[ZW.JIE_LU_KONG_WANG[this.yearGan]];
    jieLuKongWang[luoGong - 1] = '截路';
    return jieLuKongWang;
  }

  private getXunZhongKongWang() {
    const xunZhongKongWang = createEmptyPalaceList();
    const kongWang = ZW.XUN_ZHONG_KONG_WANG[`${this.yearGan}${this.yearZhi}`] ?? [];
    if (kongWang[0]) {
      xunZhongKongWang[ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[kongWang[0]] - 1] = '旬空';
    }
    if (kongWang[1]) {
      xunZhongKongWang[ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[kongWang[1]] - 1] = '副旬';
    }
    return xunZhongKongWang;
  }
  private getTianShangTianShiXing() {
    const stars = createEmptyPalaceList();
    const gongWei = ZW.TIAN_SHANG_TIAN_SHI_XING_GONG_WEI[this.getMingGongDiZhi()] ?? [];
    if (gongWei[0]) {
      stars[ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[gongWei[0]] - 1] = '天伤';
    }
    if (gongWei[1]) {
      stars[ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[gongWei[1]] - 1] = '天使';
    }
    return stars;
  }

  private getDaXian() {
    let yinYang = this.getNanNvYinYang();
    if (yinYang === '阳女') {
      yinYang = '阴男';
    } else if (yinYang === '阴女') {
      yinYang = '阳男';
    }

    const daXian = createEmptyPalaceList();
    const base = ZW.DA_XIAN[`${yinYang}${this.getWuXingJu()}`] ?? createEmptyPalaceList();
    let index = this.getMingGongGongWei() - 1;
    for (let i = 0; i < 12; i++) {
      daXian[index] = base[i] ?? '';
      index += 1;
      if (index > 11) {
        index = 0;
      }
    }
    return daXian;
  }

  private getXiaoXian() {
    return [...(ZW.XIAO_XIAN[`${this.yearZhi}${this.getSex()}`] ?? createEmptyPalaceList())];
  }

  private getShiErGongBoShi() {
    const shiErGongBoShi = createEmptyPalaceList();
    const sequence = [...ZW.SHI_ER_GONG_BO_SHI_SHUN];
    let gongWei = findStarGongWei(this.getNianGanZhuXing(), '禄存') - 1;
    const yinYang = this.getNanNvYinYang();

    if (gongWei < 0) {
      gongWei = 0;
    }

    if (yinYang === '阳男' || yinYang === '阴女') {
      for (let i = 0; i < 12; i++) {
        shiErGongBoShi[gongWei] = sequence[i] ?? '';
        gongWei += 1;
        if (gongWei > 11) {
          gongWei = 0;
        }
      }
    } else {
      for (let i = 0; i < 12; i++) {
        shiErGongBoShi[gongWei] = sequence[i] ?? '';
        gongWei -= 1;
        if (gongWei < 0) {
          gongWei = 11;
        }
      }
    }

    return shiErGongBoShi;
  }

  private getLiuNianSuiQianZhuXing() {
    return [...(ZW.LIU_NIAN_SUI_QIAN_ZHU_XING[this.yearZhi] ?? createEmptyPalaceList())];
  }

  private getLiuNianJiangQianZhuXing() {
    return [...(ZW.LIU_NIAN_JIANG_QIAN_ZHU_XING[this.yearZhi] ?? createEmptyPalaceList())];
  }

  private getShiErGongZhuXing(isMark: boolean) {
    if (this.shiErGongZhuXing.length && this.shiErGongZhuXingMark.length) {
      return isMark ? this.shiErGongZhuXingMark : this.shiErGongZhuXing;
    }

    const shiErGongZhuXing: string[][] = [];
    const shiErGongZhuXingMark: string[][] = [];

    const ziWeiXingXiZhuXing = this.getZiWeiXingXiZhuXing();
    const tianFuXingXiZhuXing = this.getTianFuXingXiZhuXing();
    const shiZhiZhuXing = this.getShiZhiZhuXing();
    const yueZhiZhuXing = this.getYueZhiZhuXing();
    const nianGanZhuXing = this.getNianGanZhuXing();
    const nianZhiZhuXing = this.getNianZhiZhuXing();
    const dayZhuXing = this.getDayZhuXing();
    const tianShangTianShiXing = this.getTianShangTianShiXing();
    const jieLuKongWang = this.getJieLuKongWang();
    const xunZhongKongWang = this.getXunZhongKongWang();

    for (let i = 0; i < 12; i++) {
      const oneGongZhuXing: string[] = [];
      const oneGongZhuXingMark: string[] = [];

      if (ziWeiXingXiZhuXing[i]) {
        oneGongZhuXing.push(ziWeiXingXiZhuXing[i]);
        oneGongZhuXingMark.push(`1_${ziWeiXingXiZhuXing[i]}`);
      }
      if (tianFuXingXiZhuXing[i]) {
        oneGongZhuXing.push(tianFuXingXiZhuXing[i]);
        oneGongZhuXingMark.push(`2_${tianFuXingXiZhuXing[i]}`);
      }

      addZhuXing(shiZhiZhuXing, oneGongZhuXing, i);
      addZhuXing(shiZhiZhuXing, oneGongZhuXingMark, i, '3_');
      addZhuXing(yueZhiZhuXing, oneGongZhuXing, i);
      addZhuXing(yueZhiZhuXing, oneGongZhuXingMark, i, '4_');
      addZhuXing(nianGanZhuXing, oneGongZhuXing, i);
      addZhuXing(nianGanZhuXing, oneGongZhuXingMark, i, '5_');
      addZhuXing(nianZhiZhuXing, oneGongZhuXing, i);
      addZhuXing(nianZhiZhuXing, oneGongZhuXingMark, i, '6_');

      if (dayZhuXing[i]) {
        oneGongZhuXing.push(dayZhuXing[i]);
        oneGongZhuXingMark.push(`7_${dayZhuXing[i]}`);
      }
      if (tianShangTianShiXing[i]) {
        oneGongZhuXing.push(tianShangTianShiXing[i]);
        oneGongZhuXingMark.push(`8_${tianShangTianShiXing[i]}`);
      }
      if (jieLuKongWang[i]) {
        oneGongZhuXing.push(jieLuKongWang[i]);
        oneGongZhuXingMark.push(`9_${jieLuKongWang[i]}`);
      }
      if (xunZhongKongWang[i]) {
        oneGongZhuXing.push(xunZhongKongWang[i]);
        oneGongZhuXingMark.push(`10_${xunZhongKongWang[i]}`);
      }

      shiErGongZhuXing.push(oneGongZhuXing);
      shiErGongZhuXingMark.push(oneGongZhuXingMark);
    }

    this.shiErGongZhuXing = shiErGongZhuXing;
    this.shiErGongZhuXingMark = shiErGongZhuXingMark;

    return isMark ? shiErGongZhuXingMark : shiErGongZhuXing;
  }

  private getShiErGongZhuXingGuanXi() {
    const zhuXingGuanXiMap = ZW.ZHU_XING_GUAN_XI;
    return this.getShiErGongZhuXing(false).map((oneGongXing, palaceIndex) =>
      oneGongXing.map((item) => zhuXingGuanXiMap[item]?.[palaceIndex] || '~')
    );
  }

  private getHuaLuXingGongWei() {
    const target = ZW.SI_HUA_GONG_WEI[this.yearGan]?.[0];
    return this.findSiHuaGongWei(target);
  }

  private getHuaQuanXingGongWei() {
    const target = ZW.SI_HUA_GONG_WEI[this.yearGan]?.[1];
    return this.findSiHuaGongWei(target);
  }

  private getHuaKeXingGongWei() {
    const target = ZW.SI_HUA_GONG_WEI[this.yearGan]?.[2];
    return this.findSiHuaGongWei(target);
  }

  private getHuaJiXingGongWei() {
    const target = ZW.SI_HUA_GONG_WEI[this.yearGan]?.[3];
    return this.findSiHuaGongWei(target);
  }

  private findSiHuaGongWei(target?: string) {
    if (!target) {
      return 1;
    }
    const shiErGongZhuXing = this.getShiErGongZhuXing(false);
    for (let i = 0; i < shiErGongZhuXing.length; i++) {
      if (shiErGongZhuXing[i].includes(target)) {
        return i + 1;
      }
    }
    return 1;
  }

  private getHuaLuXingGongWeiJieDu() {
    const huaLuLuoGong = this.getShiErMingGong()[this.getHuaLuXingGongWei() - 1];
    return `化禄星落${huaLuLuoGong}宫，${ZW.SI_HUA_XING_SHI_ER_GONG[`禄${huaLuLuoGong}`] ?? ''}`;
  }

  private getHuaQuanXingGongWeiJieDu() {
    const huaQuanLuoGong = this.getShiErMingGong()[this.getHuaQuanXingGongWei() - 1];
    return `化权星落${huaQuanLuoGong}宫，${ZW.SI_HUA_XING_SHI_ER_GONG[`权${huaQuanLuoGong}`] ?? ''}`;
  }

  private getHuaKeXingGongWeiJieDu() {
    const huaKeLuoGong = this.getShiErMingGong()[this.getHuaKeXingGongWei() - 1];
    return `化科星落${huaKeLuoGong}宫，${ZW.SI_HUA_XING_SHI_ER_GONG[`科${huaKeLuoGong}`] ?? ''}`;
  }

  private getHuaJiXingGongWeiJieDu() {
    const huaJiLuoGong = this.getShiErMingGong()[this.getHuaJiXingGongWei() - 1];
    return `化忌星落${huaJiLuoGong}宫，${ZW.SI_HUA_XING_SHI_ER_GONG[`忌${huaJiLuoGong}`] ?? ''}`;
  }

  private getShiErGongSiHuaXing() {
    const siHuaList = ZW.SI_HUA_GONG_WEI[this.yearGan] ?? [];
    return this.getShiErGongZhuXing(false).map((oneZhuXing) => {
      const oneSiHuaXing: string[] = [];
      for (const item of oneZhuXing) {
        if (item === siHuaList[0]) oneSiHuaXing.push('禄');
        if (item === siHuaList[1]) oneSiHuaXing.push('权');
        if (item === siHuaList[2]) oneSiHuaXing.push('科');
        if (item === siHuaList[3]) oneSiHuaXing.push('忌');
      }
      return oneSiHuaXing;
    });
  }

  private getShiErGongSiHuaXingGuanXi() {
    return this.getShiErGongSiHuaXing().map((oneSiHuaXing, palaceIndex) =>
      oneSiHuaXing.map((item) => ZW.ZHU_XING_GUAN_XI[item]?.[palaceIndex] || '~')
    );
  }

  private getMingZhu() {
    return ZW.MING_ZHU[this.getMingGongDiZhi()] ?? '';
  }

  private getShenZhu() {
    return ZW.SHEN_ZHU[this.yearZhi] ?? '';
  }

  private getZiDou() {
    return ZW.ZI_DOU[`${this.monthZhi}${this.hourZhi}`] ?? '';
  }

  private getLiuDou() {
    let ziDouGongWei = ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[this.getZiDou()];
    for (let i = 0; i < ZW.DI_ZHI.length; i++) {
      if (ZW.DI_ZHI[i] !== this.yearZhi) {
        ziDouGongWei += 1;
        if (ziDouGongWei > 12) {
          ziDouGongWei = 1;
        }
      } else {
        break;
      }
    }
    return ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[ziDouGongWei];
  }
  private buildGongWei(data: {
    shiErGongDiZhi: string[];
    shiErGongTianGan: string[];
    shiErMingGong: string[];
    shiErShenGong: string[];
    shiErGongZhuXing: string[][];
    shiErGongZhuXingMark: string[][];
    shiErGongZhuXingGuanXi: string[][];
    shiErGongSiHuaXing: string[][];
    shiErGongSiHuaXingGuanXi: string[][];
    shiErZhangSheng: string[];
    shiErGongBoShi: string[];
    liuNianSuiQianZhuXing: string[];
    liuNianJiangQianZhuXing: string[];
  }) {
    const gongWei: Record<string, ZiWeiGongWei> = {};

    for (let i = 0; i < 12; i++) {
      const diZhi = data.shiErGongDiZhi[i];
      const allStars = data.shiErGongZhuXing[i] ?? [];
      const allMarks = data.shiErGongZhuXingMark[i] ?? [];
      const allRelations = data.shiErGongZhuXingGuanXi[i] ?? [];

      const zhuXing: string[] = [];
      const zhuXingGuanXi: string[] = [];
      const auxStars: string[] = [];
      const minorStars: string[] = [];

      for (let index = 0; index < allMarks.length; index++) {
        const mark = allMarks[index];
        const star = mark.replace(/^\d+_/, '');
        const relation = allRelations[index] ?? '~';
        const prefix = getMarkPrefix(mark);

        if (prefix <= 2) {
          zhuXing.push(star);
          zhuXingGuanXi.push(relation);
        } else if (prefix <= 7) {
          auxStars.push(star);
        } else {
          minorStars.push(star);
        }
      }

      gongWei[diZhi] = {
        name: data.shiErMingGong[i] ?? '',
        tianGan: data.shiErGongTianGan[i] ?? '',
        diZhi,
        isMingGong: (data.shiErMingGong[i] ?? '') === '命宫',
        isShenGong: (data.shiErShenGong[i] ?? '') === '身宫',
        zhuXing,
        zhuXingGuanXi,
        auxStars: uniqueStrings(auxStars),
        minorStars: uniqueStrings(minorStars),
        siHua: data.shiErGongSiHuaXing[i] ?? [],
        siHuaGuanXi: data.shiErGongSiHuaXingGuanXi[i] ?? [],
        allStars,
        allStarMarks: allMarks,
        allStarRelations: allRelations,
        zhangSheng: data.shiErZhangSheng[i] ?? '',
        boShi: data.shiErGongBoShi[i] ?? '',
        liuNianSuiQian: data.liuNianSuiQianZhuXing[i] ?? '',
        liuNianJiangQian: data.liuNianJiangQianZhuXing[i] ?? '',
      };
    }

    return gongWei;
  }
}

export function createZiWeiPaiPan(settings: ZiWeiSettings): ZiWeiResult {
  const paiPan = new ZiWeiPaiPan(settings);
  return paiPan.getPaiPan();
}
