// @ts-ignore - lunar-javascript types are incomplete
import { Solar, Lunar } from 'lunar-javascript';
import { LiuYaoResult, LiuYaoSettings } from '@/types';
import { LIUYAO_SHENSHA_NAME_MAP, filterShenSha } from '@/lib/config/shenShaConfig';
import { formatDate, generateYaoShu, getRealAge } from '../utils/common';
import { parseLunarDateTimeString, parseSolarDateTimeString, solarPartsToDate } from '../utils/dateTime';
import {
  LIU_SHI_SI_GUA,
  LIU_SHI_SI_GUA_LIU_YAO_YAO_MING,
  LIU_SHI_SI_GUA_LIU_YAO_SHI_YING,
  LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN,
  LIU_SHI_SI_GUA_LIU_YAO_GAN_ZHI,
  LIU_SHI_SI_GUA_LIU_YAO_WU_XING,
  LIU_SHI_SI_GUA_LIU_YAO_NA_YIN,
  LIU_SHI_SI_GUA_LIU_YAO_LIU_SHEN,
  LIU_SHI_SI_GUA_LIU_YAO_YAO_CI,
  LIU_SHI_SI_GUA_LIU_QIN_QUE_SHI,
  LIU_SHI_SI_GUA_SHEN_CI,
  GUA_NAME_AND_AS,
  HU_CUO_ZONG_FU,
  DI_ZHI_SHU,
  XIAN_TIAN_BA_GUA,
  XIAN_TIAN_BA_GUA_YAO,
  KONG_WANG,
  YUE_JIANG,
  WU_BU_YU_SHI,
  TIAN_GAN_WU_XING,
  DI_ZHI_WU_XING,
  NA_YIN,
  MANUAL_RANDOM_YAO,
} from './liuyaoMaps';
import {
  TAI_JI_GUI_REN,
  TIAN_YI_GUI_REN,
  FU_XING_GUI_REN,
  WEN_CHANG_GUI_REN,
  TIAN_CHU_GUI_REN,
  YUE_DE_GUI_REN,
  TIAN_DE_GUI_REN,
  TANG_FU_GUO_YIN,
  LU_MA,
  HUA_GAI,
  YI_MA,
  TIAN_MA,
  JIANG_XING,
  XIAN_CHI,
  TIAN_XI,
  ZAI_SHA,
  TIAN_YI,
  MOU_XING,
  HUANG_EN,
  YANG_REN,
  FEI_REN,
  TIAN_REN,
  JIE_SHA,
} from './shensha';

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

type ShenShaBucket = {
  year: string[];
  month: string[];
  day: string[];
  hour: string[];
};

const YIN_YAO = '--';
const YANG_YAO = Object.values(XIAN_TIAN_BA_GUA_YAO)
  .flat()
  .find((value) => value !== YIN_YAO) ?? '—';
const YAO_NUMBER_TO_MANUAL_CODE: Record<number, number> = {
  6: 3,
  7: 0,
  8: 1,
  9: 2,
};
const TIAN_GAN_SET = new Set(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']);
const DI_ZHI_SET = new Set(['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']);

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
  return `${name}${relation}${day}天${hour}小时${minute}分钟${second}秒`;
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

function formatKongWang(value?: [string, string]) {
  return value ? value.join('、') : undefined;
}

function normalizeManualYaoShu(values?: number[]) {
  const next = [...(values ?? [])].slice(0, 6);
  while (next.length < 6) {
    next.push(0);
  }
  return next.map((value) => (value >= 0 && value <= 3 ? value : 0));
}

function uniquePush(target: string[], value: string) {
  if (value && !target.includes(value)) {
    target.push(value);
  }
}

function resolveYaoTupleByNumber(yaoNumber: number): [string, string, string] {
  const manualCode = YAO_NUMBER_TO_MANUAL_CODE[yaoNumber] ?? 0;
  return MANUAL_RANDOM_YAO[manualCode] ?? [YANG_YAO, '', '少阳'];
}

function matchesShenShaTarget(target: string | undefined, pillarGan: string, pillarZhi: string, pillarGanZhi: string) {
  if (!target) {
    return false;
  }

  if (target === pillarGanZhi) {
    return true;
  }

  const chars = Array.from(target);
  if (chars.length === 2 && TIAN_GAN_SET.has(chars[0]) && DI_ZHI_SET.has(chars[1])) {
    return pillarGanZhi === target;
  }

  return target.includes(pillarGan) || target.includes(pillarZhi);
}

export class LiuYaoPaiPan {
  private settings: Required<
    Pick<
      LiuYaoSettings,
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
      | 'paiPanType'
      | 'yaoShu'
      | 'manualYaoShu'
      | 'shenShaConfig'
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

  private yaoShu: number[] = [];
  private liuYaoAs: string[] = [];
  private liuYaoAsMark: string[] = [];
  private liuYaoAsMarkName: string[] = [];
  private bianGuaLiuYaoAs: string[] = [];

  constructor(settings: LiuYaoSettings) {
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
      paiPanType: settings.paiPanType ?? 1,
      yaoShu: settings.yaoShu ?? [],
      manualYaoShu: normalizeManualYaoShu(settings.manualYaoShu),
      shenShaConfig: settings.shenShaConfig ?? {},
    };

    this.initializeDate();
    this.initializeGanZhi();
    this.initializeJieQi();
    this.initializeLiuYaoData();
  }

  public getPaiPan(): LiuYaoResult {
    const benGuaAs = this.getGuaAs(this.liuYaoAs);
    const bianGuaAs = this.getGuaAs(this.bianGuaLiuYaoAs);
    const [huGuaAs = '', cuoGuaAs = '', zongGuaAs = '', fuGuaAs = ''] = HU_CUO_ZONG_FU[benGuaAs] ?? ['', '', '', ''];

    const benGuaName = LIU_SHI_SI_GUA[benGuaAs] ?? '';
    const bianGuaName = LIU_SHI_SI_GUA[bianGuaAs] ?? '';
    const huGuaName = LIU_SHI_SI_GUA[huGuaAs] ?? '';
    const cuoGuaName = LIU_SHI_SI_GUA[cuoGuaAs] ?? '';
    const zongGuaName = LIU_SHI_SI_GUA[zongGuaAs] ?? '';
    const fuGuaName = LIU_SHI_SI_GUA[fuGuaAs] ?? '';

    const [shangGuaName = '', shangGuaSymbol = '', xiaGuaName = '', xiaGuaSymbol = ''] =
      GUA_NAME_AND_AS[this.liuYaoAs.join(',')] ?? ['', '', '', '', '', ''];

    const benGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[benGuaName] ?? ['', '', ''];
    const bianGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[bianGuaName] ?? ['', '', ''];
    const huGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[huGuaName] ?? ['', '', ''];
    const cuoGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[cuoGuaName] ?? ['', '', ''];
    const zongGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[zongGuaName] ?? ['', '', ''];
    const fuGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[fuGuaName] ?? ['', '', ''];

    const benGuaLiuQin = LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN[benGuaAs] ?? ['', '', '', '', '', ''];
    const bianGuaLiuQin = LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN[bianGuaAs] ?? ['', '', '', '', '', ''];
    const liuQinQueShi = LIU_SHI_SI_GUA_LIU_QIN_QUE_SHI[benGuaName] ?? null;
    const fuShen = this.calculateFuShen(fuGuaAs, liuQinQueShi);

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
      ageLabel: this.settings.xuShiSuiType === 1 ? '周岁' : '虚岁',
      xuSui: calculateAge(this.solarDate, 0),
      shiSui: calculateAge(this.solarDate, 1),
      zao: this.settings.sex === 1 ? '乾造' : '坤造',
      xingQi: `星期${this.lunar.getWeekInChinese()}`,
      jiJie: this.lunar.getSeason(),
      shengXiao: this.getShengXiao(),
      xingZuo: `${this.solar.getXingZuo()}座`,
      yueXiang: this.lunar.getYueXiang(),
      yueJiang: yueJiangData[0],
      yueJiangShen: yueJiangData[1],
      wuBuYuShi: this.hourGanZhi === WU_BU_YU_SHI[this.dayGan],
      kongWang: KONG_WANG[this.dayGanZhi] ? [...KONG_WANG[this.dayGanZhi]] : undefined,

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

      shangGua: `${shangGuaName}(${shangGuaSymbol})`,
      xiaGua: `${xiaGuaName}(${xiaGuaSymbol})`,
      benGua: benGuaName,
      benGuaAs,
      bianGua: bianGuaName,
      bianGuaAs,
      huGua: huGuaName,
      huGuaAs,
      cuoGua: cuoGuaName,
      cuoGuaAs,
      zongGua: zongGuaName,
      zongGuaAs,
      fuGua: fuGuaName,
      fuGuaAs,

      benGuaType: benGuaShenCi[0],
      benGuaShen: benGuaShenCi[1],
      bianGuaType: bianGuaShenCi[0],
      bianGuaShen: bianGuaShenCi[1],

      benGuaCi: benGuaShenCi[2],
      bianGuaCi: bianGuaShenCi[2],
      huGuaCi: huGuaShenCi[2],
      cuoGuaCi: cuoGuaShenCi[2],
      zongGuaCi: zongGuaShenCi[2],
      fuGuaCi: fuGuaShenCi[2],

      liuYao: {
        benGua: {
          yaoMing: LIU_SHI_SI_GUA_LIU_YAO_YAO_MING[benGuaAs] ?? ['', '', '', '', '', ''],
          yaoAs: [...this.liuYaoAs],
          yaoAsMark: [...this.liuYaoAsMark],
          yaoAsMarkName: [...this.liuYaoAsMarkName],
          shiYing: LIU_SHI_SI_GUA_LIU_YAO_SHI_YING[benGuaAs] ?? ['', '', '', '', '', ''],
          liuQin: benGuaLiuQin,
          ganZhi: LIU_SHI_SI_GUA_LIU_YAO_GAN_ZHI[benGuaAs] ?? ['', '', '', '', '', ''],
          wuXing: LIU_SHI_SI_GUA_LIU_YAO_WU_XING[benGuaAs] ?? ['', '', '', '', '', ''],
          naYin: LIU_SHI_SI_GUA_LIU_YAO_NA_YIN[benGuaAs] ?? ['', '', '', '', '', ''],
          liuShen: LIU_SHI_SI_GUA_LIU_YAO_LIU_SHEN[this.dayGan] ?? ['', '', '', '', '', ''],
          yaoCi: LIU_SHI_SI_GUA_LIU_YAO_YAO_CI[benGuaAs] ?? ['', '', '', '', '', ''],
          fuShen,
        },
        bianGua: {
          yaoMing: LIU_SHI_SI_GUA_LIU_YAO_YAO_MING[bianGuaAs] ?? ['', '', '', '', '', ''],
          yaoAs: [...this.bianGuaLiuYaoAs],
          shiYing: LIU_SHI_SI_GUA_LIU_YAO_SHI_YING[bianGuaAs] ?? ['', '', '', '', '', ''],
          liuQin: bianGuaLiuQin,
          ganZhi: LIU_SHI_SI_GUA_LIU_YAO_GAN_ZHI[bianGuaAs] ?? ['', '', '', '', '', ''],
          wuXing: LIU_SHI_SI_GUA_LIU_YAO_WU_XING[bianGuaAs] ?? ['', '', '', '', '', ''],
          naYin: LIU_SHI_SI_GUA_LIU_YAO_NA_YIN[bianGuaAs] ?? ['', '', '', '', '', ''],
          liuShen: LIU_SHI_SI_GUA_LIU_YAO_LIU_SHEN[this.dayGan] ?? ['', '', '', '', '', ''],
          yaoCi: LIU_SHI_SI_GUA_LIU_YAO_YAO_CI[bianGuaAs] ?? ['', '', '', '', '', ''],
        },
      },

      liuQinQueShi,
      ganZhi: {
        year: this.yearGanZhi,
        month: this.monthGanZhi,
        day: this.dayGanZhi,
        hour: this.hourGanZhi,
      },
      jieQi: {
        prevJie: this.prevJie.toString(),
        nextJie: this.nextJie.toString(),
        prevQi: this.prevQi.toString(),
        nextQi: this.nextQi.toString(),
        prevJieDate,
        prevJieDay: diffParts(solarToDate(this.prevJie.getSolar()), this.solarDate).day,
        nextJieDate,
        nextJieDay: diffParts(this.solarDate, solarToDate(this.nextJie.getSolar())).day,
        prevQiDate,
        prevQiDay: diffParts(solarToDate(this.prevQi.getSolar()), this.solarDate).day,
        nextQiDate,
        nextQiDay: diffParts(this.solarDate, solarToDate(this.nextQi.getSolar())).day,
        chuShengJie: `${formatBirthMarker(this.prevJie.toString(), '后', solarToDate(this.prevJie.getSolar()), this.solarDate)}。${formatBirthMarker(this.nextJie.toString(), '前', this.solarDate, solarToDate(this.nextJie.getSolar()))}`,
        chuShengQi: `${formatBirthMarker(this.prevQi.toString(), '后', solarToDate(this.prevQi.getSolar()), this.solarDate)}。${formatBirthMarker(this.nextQi.toString(), '前', this.solarDate, solarToDate(this.nextQi.getSolar()))}`,
      },
      shenSha: this.calculateShenSha(),
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

  private initializeLiuYaoData() {
    if (this.settings.paiPanType === 0) {
      this.initializeDateModeYaoData();
    } else if (this.settings.paiPanType === 2) {
      this.initializeManualModeYaoData();
    } else {
      this.initializeAutoModeYaoData();
    }

    this.bianGuaLiuYaoAs = this.liuYaoAs.map((yaoAs, index) => (
      this.liuYaoAsMark[index] ? (yaoAs === YIN_YAO ? YANG_YAO : YIN_YAO) : yaoAs
    ));
  }

  private initializeDateModeYaoData() {
    const yearNumber = DI_ZHI_SHU[this.yearZhi] ?? 1;
    const monthNumber = this.lunar.getMonth();
    const dayNumber = this.lunar.getDay();
    const hourNumber = DI_ZHI_SHU[this.hourZhi] ?? 1;

    let shangGuaNumber = (yearNumber + monthNumber + dayNumber) % 8;
    let xiaGuaNumber = (yearNumber + monthNumber + dayNumber + hourNumber) % 8;
    let dongYaoNumber = (yearNumber + monthNumber + dayNumber + hourNumber) % 6;

    shangGuaNumber = shangGuaNumber === 0 ? 8 : shangGuaNumber;
    xiaGuaNumber = xiaGuaNumber === 0 ? 8 : xiaGuaNumber;
    dongYaoNumber = dongYaoNumber === 0 ? 6 : dongYaoNumber;

    const shangGuaName = XIAN_TIAN_BA_GUA[shangGuaNumber];
    const xiaGuaName = XIAN_TIAN_BA_GUA[xiaGuaNumber];
    const shangGuaYao = XIAN_TIAN_BA_GUA_YAO[shangGuaName] ?? [YANG_YAO, YANG_YAO, YANG_YAO];
    const xiaGuaYao = XIAN_TIAN_BA_GUA_YAO[xiaGuaName] ?? [YANG_YAO, YANG_YAO, YANG_YAO];
    const combined = [...xiaGuaYao, ...shangGuaYao];

    this.yaoShu = combined.map((yaoAs, index) => {
      const isMoving = index + 1 === dongYaoNumber;
      if (yaoAs === YIN_YAO) {
        return isMoving ? 6 : 8;
      }
      return isMoving ? 9 : 7;
    });

    this.applyYaoShu(this.yaoShu);
  }

  private initializeManualModeYaoData() {
    this.yaoShu = this.settings.manualYaoShu.map((value) => {
      if (value === 1) return 8;
      if (value === 2) return 9;
      if (value === 3) return 6;
      return 7;
    });
    this.applyYaoShu(this.yaoShu);
  }

  private initializeAutoModeYaoData() {
    const yaoShu = this.settings.yaoShu.length === 6
      ? this.settings.yaoShu.map((value) => (value >= 6 && value <= 9 ? value : 7))
      : generateYaoShu();

    this.yaoShu = yaoShu;
    this.applyYaoShu(this.yaoShu);
  }

  private applyYaoShu(yaoShu: number[]) {
    this.liuYaoAs = [];
    this.liuYaoAsMark = [];
    this.liuYaoAsMarkName = [];

    yaoShu.forEach((value) => {
      const [yaoAs, mark, markName] = resolveYaoTupleByNumber(value);
      this.liuYaoAs.push(yaoAs);
      this.liuYaoAsMark.push(mark);
      this.liuYaoAsMarkName.push(markName);
    });
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

  private getGuaAs(liuYaoAs: string[]) {
    const guaInfo = GUA_NAME_AND_AS[liuYaoAs.join(',')];
    return guaInfo ? guaInfo[5] : '';
  }

  private getYueJiangData(): [string, string] {
    const key = `${this.prevQi.toString()}${this.nextQi.toString()}`;
    const data = YUE_JIANG[key];
    if (!data) {
      throw new Error(`月将映射缺失: ${key}`);
    }
    return data;
  }

  private calculateFuShen(fuGuaAs: string, liuQinQueShi: string[] | null) {
    const result = ['', '', '', '', '', ''];
    if (!fuGuaAs || !liuQinQueShi?.length) {
      return result;
    }

    const fuGuaLiuQin = LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN[fuGuaAs] ?? ['', '', '', '', '', ''];
    fuGuaLiuQin.forEach((liuQin, index) => {
      if (liuQinQueShi.includes(liuQin)) {
        result[index] = liuQin;
      }
    });

    return result;
  }

  private calculateShenSha(): ShenShaBucket {
    const pillars = {
      year: { gan: this.yearGan, zhi: this.yearZhi, ganZhi: this.yearGanZhi },
      month: { gan: this.monthGan, zhi: this.monthZhi, ganZhi: this.monthGanZhi },
      day: { gan: this.dayGan, zhi: this.dayZhi, ganZhi: this.dayGanZhi },
      hour: { gan: this.hourGan, zhi: this.hourZhi, ganZhi: this.hourGanZhi },
    } as const;

    const result: ShenShaBucket = {
      year: [],
      month: [],
      day: [],
      hour: [],
    };

    const applyTarget = (name: string, target?: string) => {
      (Object.entries(pillars) as Array<[keyof ShenShaBucket, typeof pillars.year]>).forEach(([key, pillar]) => {
        if (matchesShenShaTarget(target, pillar.gan, pillar.zhi, pillar.ganZhi)) {
          uniquePush(result[key], name);
        }
      });
    };

    applyTarget('太极贵人', TAI_JI_GUI_REN[this.yearGan]);
    applyTarget('太极贵人', TAI_JI_GUI_REN[this.dayGan]);
    applyTarget('天乙贵人', TIAN_YI_GUI_REN[this.dayGan]);
    applyTarget('福星贵人', FU_XING_GUI_REN[this.dayGan]);
    applyTarget('文昌贵人', WEN_CHANG_GUI_REN[this.dayGan]);
    applyTarget('天厨贵人', TIAN_CHU_GUI_REN[this.dayGan]);
    applyTarget('月德贵人', YUE_DE_GUI_REN[this.monthZhi]);
    applyTarget('天德贵人', TIAN_DE_GUI_REN[this.monthZhi]);
    applyTarget('唐符国印', TANG_FU_GUO_YIN[this.yearZhi]);
    applyTarget('天元禄', LU_MA[this.dayGan]);
    applyTarget('华盖', HUA_GAI[this.yearZhi]);
    applyTarget('华盖', HUA_GAI[this.dayZhi]);
    applyTarget('驿马', YI_MA[this.dayZhi]);
    applyTarget('天马', TIAN_MA[this.dayZhi]);
    applyTarget('禄马', LU_MA[this.dayGan]);
    applyTarget('劫煞', JIE_SHA[this.dayZhi]);
    applyTarget('将星', JIANG_XING[this.yearZhi]);
    applyTarget('将星', JIANG_XING[this.dayZhi]);
    applyTarget('咸池', XIAN_CHI[this.dayZhi]);
    applyTarget('天喜', TIAN_XI[this.monthZhi]);
    applyTarget('灾煞', ZAI_SHA[this.dayZhi]);
    applyTarget('天医', TIAN_YI[this.monthZhi]);
    applyTarget('谋星', MOU_XING[this.dayZhi]);
    applyTarget('皇恩', HUANG_EN[this.monthZhi]);
    applyTarget('阳刃', YANG_REN[this.dayGan]);
    applyTarget('飞刃', FEI_REN[this.dayGan]);
    applyTarget('天人', TIAN_REN[this.dayGan]);

    if (this.settings.shenShaConfig) {
      result.year = filterShenSha(result.year, this.settings.shenShaConfig, LIUYAO_SHENSHA_NAME_MAP);
      result.month = filterShenSha(result.month, this.settings.shenShaConfig, LIUYAO_SHENSHA_NAME_MAP);
      result.day = filterShenSha(result.day, this.settings.shenShaConfig, LIUYAO_SHENSHA_NAME_MAP);
      result.hour = filterShenSha(result.hour, this.settings.shenShaConfig, LIUYAO_SHENSHA_NAME_MAP);
    }

    return result;
  }
}

export function createLiuYaoPaiPan(settings: LiuYaoSettings): LiuYaoResult {
  const paiPan = new LiuYaoPaiPan(settings);
  return paiPan.getPaiPan();
}
