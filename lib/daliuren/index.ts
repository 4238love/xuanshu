// @ts-ignore - lunar-javascript 类型定义不完整
import { Solar, Lunar } from 'lunar-javascript';
import { DaLiuRenResult, DaLiuRenSettings } from '@/types';
import { formatDate, getRealAge } from '../utils/common';
import { parseLunarDateTimeString, parseSolarDateTimeString, solarPartsToDate } from '../utils/dateTime';
import {
  KONG_WANG,
  WU_BU_YU_SHI,
  TIAN_GAN_WU_XING,
  DI_ZHI_WU_XING,
  NA_YIN,
} from '../liuyao/liuyaoMaps';
import {
  YUE_JIANG,
  DI_ZHI_SHUN_PAI,
  SHI_GAN_JI_GONG,
  GUI_REN_FANG_XIANG,
  GUI_REN_SHUN_XU,
  DUN_GAN_SHUN,
  GAN_ZHI_SHENG_KE_LIU_QIN,
  ZHOU_YE_GUI_REN,
} from './constants';
import { TIAN_DI_PAN_TYPE } from './tianDiPanType';
import { SAN_CHUAN, WU_XING_WANG_SHUAI, ZHOU_GUI_REN, YE_GUI_REN } from './generatedMaps';

const DI_PAN = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'] as const;
const EMPTY_TIAN_GAN = new Array(12).fill('');

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

function formatKongWang(value?: [string, string]): string | undefined {
  return value ? value.join('、') : undefined;
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

export class DaLiuRenPaiPan {
  private settings: Required<
    Pick<
      DaLiuRenSettings,
      | 'name'
      | 'occupy'
      | 'sex'
      | 'date'
      | 'dateType'
      | 'leapMonthType'
      | 'xuShiSuiType'
      | 'jieQiType'
      | 'guiRenType'
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

  private diPan = [...DI_PAN];
  private tianPan: string[] = [];
  private tianGan: string[] = [...EMPTY_TIAN_GAN];
  private shenPan: string[] = [];
  private siKe: string[][] = [];
  private sanChuan: string[] = [];

  constructor(settings: DaLiuRenSettings) {
    this.settings = {
      name: settings.name ?? '',
      occupy: settings.occupy ?? '',
      sex: settings.sex ?? 1,
      date: settings.date ?? '2024-01-01 00:00:00',
      dateType: settings.dateType ?? 0,
      leapMonthType: settings.leapMonthType ?? 0,
      xuShiSuiType: settings.xuShiSuiType ?? 0,
      jieQiType: settings.jieQiType ?? 1,
      guiRenType: settings.guiRenType ?? 0,
      yearGanZhiType: settings.yearGanZhiType ?? 2,
      monthGanZhiType: settings.monthGanZhiType ?? 1,
      dayGanZhiType: settings.dayGanZhiType ?? 0,
    };

    this.initializeDate();
    this.initializeGanZhi();
    this.initializeJieQi();
    this.initializeTianPan();
    this.initializeTianGan();
    this.initializeShenPan();
    this.initializeSiKe();
    this.initializeSanChuan();
  }

  public getPaiPan(): DaLiuRenResult {
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
      shengXiao: this.getShengXiao(),
      xingZuo: `${this.solar.getXingZuo()}座`,
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
      wuXingWangShuai: WU_XING_WANG_SHUAI[this.monthZhi],

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
      yueXiang: this.lunar.getYueXiang(),
      yueJiang: yueJiangData[0],
      yueJiangShen: yueJiangData[1],

      diPan: [...this.diPan],
      tianPan: [...this.tianPan],
      shenPan: [...this.shenPan],
      tianGan: [...this.tianGan],
      siKe: this.siKe.map((item) => [...item]),
      siKeDunGan: this.getSiKeDunGan(),
      siKeShenJiang: this.getSiKeShenJiang(),
      sanChuan: [...this.sanChuan],
      sanChuanDunGan: this.getSanChuanDunGan(),
      sanChuanShenJiang: this.getSanChuanShenJiang(),
      sanChuanLiuQin: this.getSanChuanLiuQin(),
      tianDiPanType: TIAN_DI_PAN_TYPE[`${yueJiangData[0]}${this.hourZhi}`] || '',
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

  private initializeTianPan() {
    const yueJiang = this.getYueJiangData()[0];
    const startIndex = this.diPan.findIndex((zhi) => zhi === this.hourZhi);
    const shunPai = DI_ZHI_SHUN_PAI[yueJiang];

    if (startIndex < 0 || !shunPai) {
      throw new Error('大六壬天盘初始化失败');
    }

    this.tianPan = new Array(12).fill('');
    let currentIndex = startIndex;
    for (let i = 0; i < 12; i += 1) {
      this.tianPan[currentIndex] = shunPai[i];
      currentIndex = (currentIndex + 1) % 12;
    }
  }

  private initializeTianGan() {
    const dayKongWang = KONG_WANG[this.dayGanZhi];
    if (!dayKongWang) {
      this.tianGan = [...EMPTY_TIAN_GAN];
      return;
    }

    const kongWangIndex = this.tianPan.findIndex((zhi) => zhi === dayKongWang[1]);
    this.tianGan = kongWangIndex >= 0 ? [...(DUN_GAN_SHUN[kongWangIndex + 1] || EMPTY_TIAN_GAN)] : [...EMPTY_TIAN_GAN];
  }

  private initializeShenPan() {
    const guiRen = this.getGuiRen();
    const startIndex = this.tianPan.findIndex((zhi) => zhi === guiRen);
    if (startIndex < 0) {
      throw new Error('大六壬神盘初始化失败');
    }

    const direction = GUI_REN_FANG_XIANG[this.diPan[startIndex]];
    this.shenPan = new Array(12).fill('');
    let currentIndex = startIndex;

    for (let i = 0; i < 12; i += 1) {
      this.shenPan[currentIndex] = GUI_REN_SHUN_XU[i];
      currentIndex = direction === 0 ? (currentIndex + 1) % 12 : (currentIndex + 11) % 12;
    }
  }

  private initializeSiKe() {
    const jiGong = SHI_GAN_JI_GONG[this.dayGan];
    const ganYang = this.lookupPanValue(this.diPan, jiGong, this.tianPan);
    const ganYin = this.lookupPanValue(this.diPan, ganYang, this.tianPan);
    const zhiYang = this.lookupPanValue(this.diPan, this.dayZhi, this.tianPan);
    const zhiYin = this.lookupPanValue(this.diPan, zhiYang, this.tianPan);

    this.siKe = [
      [ganYang, this.dayGan],
      [ganYin, ganYang],
      [zhiYang, this.dayZhi],
      [zhiYin, zhiYang],
    ];
  }

  private initializeSanChuan() {
    const sanChuan = SAN_CHUAN[`${this.dayGanZhi}${this.siKe[0][0]}`];
    if (!sanChuan) {
      throw new Error(`三传映射缺失: ${this.dayGanZhi}${this.siKe[0][0]}`);
    }
    this.sanChuan = [...sanChuan];
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
    const data = YUE_JIANG[key];
    if (!data) {
      throw new Error(`月将映射缺失: ${key}`);
    }
    return data;
  }

  private getGuiRen() {
    if (this.settings.guiRenType === 1) {
      return ZHOU_GUI_REN[this.dayGan];
    }
    if (this.settings.guiRenType === 2) {
      return YE_GUI_REN[this.dayGan];
    }
    return ZHOU_YE_GUI_REN[`${this.dayGan}${this.hourZhi}`];
  }

  private lookupPanValue(source: string[], key: string, target: string[]) {
    const index = source.findIndex((item) => item === key);
    if (index < 0) {
      throw new Error(`盘面映射缺失: ${key}`);
    }
    return target[index];
  }

  private lookupTianPanRelated(zhi: string, target: string[]) {
    const index = this.tianPan.findIndex((item) => item === zhi);
    if (index < 0) {
      throw new Error(`天盘定位失败: ${zhi}`);
    }
    return target[index];
  }

  private getSiKeReference() {
    const firstLower = SHI_GAN_JI_GONG[this.siKe[0][1]];
    return [
      [this.siKe[0][0], firstLower],
      [...this.siKe[1]],
      [...this.siKe[2]],
      [...this.siKe[3]],
    ];
  }

  private getSiKeDunGan() {
    return this.getSiKeReference().map((ke) => ke.map((zhi) => this.lookupTianPanRelated(zhi, this.tianGan)));
  }

  private getSiKeShenJiang() {
    return this.getSiKeReference().map((ke) => ke.map((zhi) => this.lookupTianPanRelated(zhi, this.shenPan)));
  }

  private getSanChuanDunGan() {
    return this.sanChuan.map((zhi) => this.lookupTianPanRelated(zhi, this.tianGan));
  }

  private getSanChuanShenJiang() {
    return this.sanChuan.map((zhi) => this.lookupTianPanRelated(zhi, this.shenPan));
  }

  private getSanChuanLiuQin() {
    return this.sanChuan.map((zhi) => GAN_ZHI_SHENG_KE_LIU_QIN[`${this.dayGan}${zhi}`]);
  }
}

export function createDaLiuRenPaiPan(settings: DaLiuRenSettings): DaLiuRenResult {
  return new DaLiuRenPaiPan(settings).getPaiPan();
}
