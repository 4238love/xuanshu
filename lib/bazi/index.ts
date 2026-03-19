// @ts-ignore - lunar-javascript 类型定义不完整
import { Solar, Lunar, EightChar } from 'lunar-javascript';
import { BaZiSettings, BaZiResult } from '@/types';
import {
  TIAN_GAN,
  DI_ZHI,
  SHENG_XIAO,
  WU_XING_MAP,
  NA_YIN,
  DI_ZHI_CANG_GAN,
  SHI_SHEN,
  TIAN_YI_GUI_REN,
  WEN_CHANG_GUI_REN,
  TIAN_DE_GUI_REN,
  YUE_DE_GUI_REN,
  LU_SHEN,
  YANG_REN,
  YI_MA,
  TAO_HUA,
  HUA_GAI,
  JIANG_XING,
  JIE_SHA,
  ZAI_SHA,
  GU_CHEN,
  GUA_SU,
  HONG_YAN,
  JIN_YU,
  TIAN_LUO_DI_WANG,
  FU_XING_GUI_REN,
  TIAN_GUAN_GUI_REN,
  XUE_TANG,
  CI_GUAN,
  WANG_SHEN,
  GOU_JIAO,
  YUAN_CHEN,
  FEI_REN,
  YIN_YANG_CHA_CUO,
  GU_LUAN_SHA,
  TIE_SAO_ZHOU,
  HONG_LUAN,
  TIAN_XI,
  TIAN_YI_STAR,
  TIAN_CHU,
  YUE_KONG,
  JIE_LU_KONG_WANG,
  TAI_JI_GUI_REN,
  SAN_QI_GUI_REN,
  DE_XIU_GUI_REN,
  TIAN_DE_HE,
  YUE_DE_HE,
  SHI_E_DA_BAI,
  SI_FEI_RI,
  LIU_XIU_RI,
  SHI_LING_RI,
  YIN_ZHU_YANG_SHOU,
  KUI_GANG_RI,
  BA_ZHUAN_RI,
  JIU_CHOU_RI,
  TONG_ZI_SHA,
  LIU_XIA,
  DIAO_KE,
  PI_MA,
  SANG_MEN,
  GUO_YIN,
  JIE_KONG,
  XUE_REN,
  TIAN_SHE,
  TIAN_ZHUAN,
  DI_ZHUAN,
  GONG_LU,
  JIN_SHEN,
  LIU_E,
  WU_BU_YU_SHI
} from '../constants';
import {
  KONG_WANG,
  TIAN_GAN_WU_XING,
  YUE_JIANG as YUE_JIANG_BY_QI,
} from '../liuyao/liuyaoMaps';
import {
  getWuXing,
  getNaYin,
  getWeekDay,
  getSeason,
  getXingZuo,
  getAge,
  getRealAge,
  parseDate,
  formatDate,
  getShiShen,
  getZhiShiShen,
  analyzeShiShenPattern,
  calculateQiYunSui,
  calculateDaYun,
  calculateLiuNian,
  getCurrentDaYun,
  getCurrentLiuNian,
  analyzeTianGanWuHe,
  analyzeDiZhiSanHe,
  analyzeDiZhiSanHui,
  analyzeDiZhiLiuHe,
  analyzeDiZhiXiangChong,
  analyzeDiZhiXiangXing,
  analyzeDiZhiXiangHai,
  analyzeDiZhiXiangPo,
  analyzeGeJu,
  getTaiYuan,
  getTaiXi,
  getMingGong,
  getShenGong,
  calculateXiaoYun,
  calculateLiuYue,
  calculateLiuRi,
  calculateLiuShi,
  analyzeGanZhiLiuYi,
  calculateJiuXing,
  generateDetailedAnalysis,
  calculateGuZhong,
  calculateShenQiangShenRuo,
  getChongShengXiao,
  getPengZuBaiJi,
  getMingGua,
  getRiZhuLunMing,
  calculateZhengCai,
  calculatePianCai,
  calculateZhengTaoHua,
  calculatePianTaoHua,
  getJiuXingLuck
} from '../utils/common';
import { REN_YUAN_TABLES } from './baziMaps';
import { calculateTrueSolarTime, getLongitudeByCity } from '../utils/trueSolarTime';
import {
  normalizeDateValue,
  parseLunarDateTimeString,
  parseSolarDateTimeString,
  solarPartsToDate,
} from '../utils/dateTime';

type JieQiRef = {
  toString(): string;
  getName?: () => string;
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

function getJieQiName(ref?: JieQiRef) {
  return ref?.getName?.() ?? ref?.toString?.() ?? '';
}

function getJieQiTime(ref?: JieQiRef) {
  return ref?.getSolar().toYmdHms();
}

/**
 * 八字排盘类
 */
export class BaZiPaiPan {
  private settings: BaZiSettings;
  private solar!: Solar;
  private lunar!: Lunar;
  private solarDate!: Date;
  private eightChar!: EightChar;

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

  constructor(settings: BaZiSettings) {
    this.settings = {
      leapMonthType: 0,
      xuShiSuiType: 1,
      jieQiType: 1,
      qiYunLiuPaiType: 1,
      renYuanType: 0,
      daYunLunShu: 10,
      yearGanZhiType: 2,
      monthGanZhiType: 1,
      dayGanZhiType: 0,
      useTrueSolarTime: false,
      showXiaoYun: true,
      showLiuYue: true,
      showLiuRi: true,
      showLiuShi: true,
      showJiuXing: true,
      showGanZhiLiuYi: true,
      showShenSha: true,
      showGeJu: true,
      ...settings
    };

    const dateType = this.settings.dateType ?? 0;
    const rawDate = this.settings.date || '2024-01-01 00:00:00';
    const normalizedDate = normalizeDateValue(rawDate, dateType);
    this.settings.date = normalizedDate;
    this.initializeDate();
    this.initializeGanZhi();
    this.initializeJieQi();
  }

  private initializeDate() {
    if (this.settings.dateType === 1) {
      const lunarParts = parseLunarDateTimeString(this.settings.date);
      if (!lunarParts) {
        throw new Error('农历日期格式无效');
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
    } else {
      const solarParts = parseSolarDateTimeString(this.settings.date);
      if (!solarParts) {
        throw new Error('日期格式无效，请使用 yyyy-MM-dd HH:mm:ss');
      }

      this.solarDate = solarPartsToDate(solarParts);
      this.solar = Solar.fromDate(this.solarDate);
      this.lunar = this.solar.getLunar();
    }

    if (this.settings.useTrueSolarTime) {
      const trimmedCity = this.settings.city?.trim();
      const cityLongitude = trimmedCity ? getLongitudeByCity(trimmedCity) : null;
      const longitude = cityLongitude ?? this.settings.longitude;

      if (longitude === undefined || Number.isNaN(longitude)) {
        throw new Error('启用真太阳时后，请填写受支持的城市或直接输入经度。');
      }

      this.solarDate = calculateTrueSolarTime(this.solarDate, longitude);
      this.solar = Solar.fromDate(this.solarDate);
      this.lunar = this.solar.getLunar();
    }
  }

  private initializeGanZhi() {
    this.yearGanZhi = this.getYearGanZhi();
    this.monthGanZhi = this.getMonthGanZhi();
    this.dayGanZhi = this.getDayGanZhi();

    this.eightChar = this.lunar.getEightChar();
    (this.eightChar as any).setSect?.((this.settings.dayGanZhiType ?? 0) + 1);
    this.hourGanZhi = (this.eightChar as any).getTime?.() || `${this.eightChar.getTimeGan()}${this.eightChar.getTimeZhi()}`;

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

  private getYueJiangData() {
    const key = `${this.prevQi.toString()}${this.nextQi.toString()}`;
    const data = YUE_JIANG_BY_QI[key];
    if (!data) {
      throw new Error(`月将映射缺失: ${key}`);
    }

    return {
      yueJiang: data[0],
      yueJiangShen: data[1],
    };
  }

  private getPrevJieDay() {
    const diff = this.solarDate.getTime() - solarToDate(this.prevJie.getSolar()).getTime();
    return Math.floor(diff / (24 * 60 * 60 * 1000));
  }

  private getRenYuanSiLingFenYe() {
    const table = REN_YUAN_TABLES[this.settings.renYuanType ?? 0] ?? REN_YUAN_TABLES[0];
    const index = this.getPrevJieDay();
    const dayIndex = index < 0 || index > 29 ? 1 : index;
    const renYuan = table[this.monthZhi]?.[dayIndex] || '己';
    return `${renYuan}${TIAN_GAN_WU_XING[renYuan] || ''}值令`;
  }

  /**
   * 获取排盘结果
   */
  public getPaiPan(): BaZiResult {
    const yearGanZhi = this.yearGanZhi;
    const monthGanZhi = this.monthGanZhi;
    const dayGanZhi = this.dayGanZhi;
    const hourGanZhi = this.hourGanZhi;
    const yearGan = this.yearGan;
    const yearZhi = this.yearZhi;
    const monthGan = this.monthGan;
    const monthZhi = this.monthZhi;
    const dayGan = this.dayGan;
    const dayZhi = this.dayZhi;
    const hourGan = this.hourGan;
    const hourZhi = this.hourZhi;

    // 计算五行数量
    const wuXingCount = this.calculateWuXingCount();

    // 获取生肖
    const shengXiao = SHENG_XIAO[DI_ZHI.indexOf(yearZhi)];

    // 将Solar对象转换为Date对象
    const solarDate = this.solarDate;

    // 获取星座
    const xingZuo = getXingZuo(this.solar.getMonth(), this.solar.getDay());

    // 获取星期
    const xingQi = getWeekDay(solarDate);

    // 获取季节
    const jiJie = this.getJiJie();

    // 获取年龄（默认使用实岁）
    const xuShiSuiType = this.settings.xuShiSuiType ?? 1; // 默认实岁
    const age = xuShiSuiType === 0
      ? getAge(solarDate)
      : getRealAge(solarDate);

    // 同时计算虚岁和实岁
    const xuSui = getAge(solarDate);      // 虚岁
    const shiSui = getRealAge(solarDate); // 实岁

    const shenQiangShenRuo = calculateShenQiangShenRuo(
      dayGan,
      yearGan,
      monthGan,
      hourGan,
      yearZhi,
      monthZhi,
      dayZhi,
      hourZhi
    );

    const geJu = this.settings.showGeJu !== false
      ? this.getGeJu(dayGan, monthZhi, [yearGan, monthGan, dayGan, hourGan], [yearZhi, monthZhi, dayZhi, hourZhi])
      : undefined;

    // 预先计算大运流年数据（用于财运和桃花运计算）
    const daYunLiuNianData = this.getDaYunLiuNian(dayGan);
    const daYunList = daYunLiuNianData.daYun || [];
    const liuNianList = daYunLiuNianData.liuNian || [];

    // 获取当前节气
    const jieQiInfo = this.getJieQiInfo();
    const yueJiang = this.getYueJiangData();

    const result: BaZiResult = {
      // 基础信息
      solar: formatDate(solarDate),
      lunar: this.lunar.toString(),
      name: this.settings.name,
      occupy: this.settings.occupy,
      sex: this.settings.sex === 1 ? '男' : '女',
      age: age,
      ageLabel: xuShiSuiType === 0 ? '虚岁' : '实岁',
      xuSui: xuSui,
      shiSui: shiSui,
      shengXiao,
      xingZuo,
      xingQi,
      jiJie,

      // 八字
      baZi: [
        yearGanZhi,
        monthGanZhi,
        dayGanZhi,
        hourGanZhi
      ],
      baZiWuXing: [
        getWuXing(yearGan) + getWuXing(yearZhi),
        getWuXing(monthGan) + getWuXing(monthZhi),
        getWuXing(dayGan) + getWuXing(dayZhi),
        getWuXing(hourGan) + getWuXing(hourZhi)
      ],
      baZiNaYin: [
        getNaYin(yearGanZhi),
        getNaYin(monthGanZhi),
        getNaYin(dayGanZhi),
        getNaYin(hourGanZhi)
      ],
      baZiKongWang: this.getKongWang(),

      // 干支
      yearGan,
      monthGan,
      dayGan,
      hourGan,
      yearZhi,
      monthZhi,
      dayZhi,
      hourZhi,
      yearGanZhi,
      monthGanZhi,
      dayGanZhi,
      hourGanZhi,

      // 五行统计
      muCount: wuXingCount.mu,
      huoCount: wuXingCount.huo,
      tuCount: wuXingCount.tu,
      jinCount: wuXingCount.jin,
      shuiCount: wuXingCount.shui,

      // 五行分析
      wuXingWangShuai: this.getWuXingWangShuai(wuXingCount),
      wuXingQueShi: this.getWuXingQueShi(wuXingCount),
      xiYongShen: this.getXiYongShen(dayGan, shenQiangShenRuo.result, geJu),

      // 神煞
      shenSha: this.settings.showShenSha !== false ? this.getShenSha() : undefined,

      // 十神系统
      shiShen: this.getShiShen(dayGan, yearGan, monthGan, hourGan),
      shiShenZhi: this.getShiShenZhi(dayGan, yearZhi, monthZhi, dayZhi, hourZhi),
      shiShenAnalysis: this.getShiShenAnalysis(dayGan, yearGan, monthGan, hourGan, yearZhi, monthZhi, dayZhi, hourZhi),

      // 大运流年系统
      ...daYunLiuNianData,

      // 地支藏干系统
      diZhiCangGan: this.getDiZhiCangGan(dayGan, yearZhi, monthZhi, dayZhi, hourZhi),

      // 五行生克关系
      wuXingShengKe: this.getWuXingShengKe([yearGan, monthGan, dayGan, hourGan], [yearZhi, monthZhi, dayZhi, hourZhi]),

      // 格局判断系统
      geJu,

      // 胎元、胎息、命宫、身宫
      taiYuan: (this.eightChar as any).getTaiYuan?.() || getTaiYuan(monthGan, monthZhi),
      taiXi: (this.eightChar as any).getTaiXi?.() || getTaiXi(dayGan, dayZhi),
      mingGong: (this.eightChar as any).getMingGong?.() || getMingGong(monthZhi, hourZhi),
      shenGong: (this.eightChar as any).getShenGong?.() || getShenGong(monthZhi, hourZhi),

      // 小运、流月、流日、流时
      xiaoYun: daYunLiuNianData.xiaoYun,
      // 流月、流日、流时使用当前时间
      liuYue: this.settings.showLiuYue !== false ? this.getCurrentLiuYue() : undefined,
      liuRi: this.settings.showLiuRi === true ? this.getCurrentLiuRi() : undefined,
      liuShi: this.settings.showLiuShi !== false ? this.getCurrentLiuShi() : undefined,

      // 干支留意系统
      ganZhiLiuYi: this.settings.showGanZhiLiuYi !== false ?
        this.filterGanZhiLiuYi(analyzeGanZhiLiuYi([yearGan, monthGan, dayGan, hourGan], [yearZhi, monthZhi, dayZhi, hourZhi])) :
        undefined,

      // 九星系统（5种体系）
      jiuXing: this.settings.showJiuXing !== false ? calculateJiuXing(
        this.lunar,
        this.settings.yearGanZhiType || 0,
        this.settings.monthGanZhiType || 0
      ) : undefined,

      // 重冲生肖
      chongShengXiao: getChongShengXiao(yearZhi, monthZhi, dayZhi, hourZhi),

      // 彭祖百忌
      pengZuBaiJi: getPengZuBaiJi(dayGan, dayZhi),

      // 命卦
      mingGua: getMingGua(this.lunar.getYear(), this.settings.sex),

      // 日主论命
      riZhuLunMing: getRiZhuLunMing(dayGan + dayZhi),
      renYuanSiLingFenYe: this.getRenYuanSiLingFenYe(),

      // 月将
      yueJiang,

      // 财富运势
      caiYun: {
        zhengCai: calculateZhengCai(dayGan, daYunList, liuNianList),
        pianCai: calculatePianCai(dayGan, daYunList, liuNianList)
      },

      // 桃花运
      taoHuaYun: {
        zhengTaoHua: calculateZhengTaoHua(dayGan, this.settings.sex, daYunList, liuNianList),
        pianTaoHua: calculatePianTaoHua(dayGan, this.settings.sex, daYunList, liuNianList)
      }
    };

    // 生成详细分析（需要先计算十神数量）
    const shiShenCount: { [key: string]: number } = {};
    const gans = [yearGan, monthGan, hourGan];
    gans.forEach(gan => {
      const shiShen = getShiShen(dayGan, gan);
      if (shiShen) {
        shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 1;
      }
    });

    const zhis = [yearZhi, monthZhi, dayZhi, hourZhi];
    zhis.forEach(zhi => {
      const shiShens = getZhiShiShen(dayGan, zhi);
      shiShens.forEach(shiShen => {
        if (shiShen) {
          shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 0.5;
        }
      });
    });

    const shenSha = this.settings.showShenSha !== false ? this.getShenSha() : [[], [], [], []];
    const geJuName = result.geJu?.geJuName || '普通格局';

    result.detailedAnalysis = generateDetailedAnalysis(
      dayGan,
      dayZhi,
      shiShenCount,
      wuXingCount,
      geJuName,
      shenSha
    );

    // 计算骨重
    const dayInChinese = (this.lunar as any).getDayInChinese();
    result.guZhong = calculateGuZhong(
      yearGan + yearZhi,
      monthZhi,
      dayInChinese,
      hourZhi,
      this.settings.sex
    );

    // 计算身强身弱
    result.shenQiangShenRuo = shenQiangShenRuo;

    // 判断五不遇时
    const currentHourGanZhi = hourGan + hourZhi;
    result.wuBuYuShi = WU_BU_YU_SHI[dayGan] === currentHourGanZhi;

    // 获取节气信息
    result.jieQiInfo = jieQiInfo;

    return result;
  }

  /**
   * 计算五行数量
   */
  private calculateWuXingCount(): { mu: number; huo: number; tu: number; jin: number; shui: number } {
    const count = { mu: 0, huo: 0, tu: 0, jin: 0, shui: 0 };

    const gans = [
      this.yearGan,
      this.monthGan,
      this.dayGan,
      this.hourGan
    ];

    const zhis = [
      this.yearZhi,
      this.monthZhi,
      this.dayZhi,
      this.hourZhi
    ];

    // 统计天干五行
    gans.forEach(gan => {
      const wuXing = getWuXing(gan);
      if (wuXing === '木') count.mu++;
      else if (wuXing === '火') count.huo++;
      else if (wuXing === '土') count.tu++;
      else if (wuXing === '金') count.jin++;
      else if (wuXing === '水') count.shui++;
    });

    // 统计地支五行
    zhis.forEach(zhi => {
      const wuXing = getWuXing(zhi);
      if (wuXing === '木') count.mu++;
      else if (wuXing === '火') count.huo++;
      else if (wuXing === '土') count.tu++;
      else if (wuXing === '金') count.jin++;
      else if (wuXing === '水') count.shui++;
    });

    return count;
  }

  /**
   * 获取五行旺衰
   */
  private getWuXingWangShuai(count: { mu: number; huo: number; tu: number; jin: number; shui: number }): string {
    const max = Math.max(count.mu, count.huo, count.tu, count.jin, count.shui);
    const wangList: string[] = [];

    if (count.mu === max) wangList.push('木');
    if (count.huo === max) wangList.push('火');
    if (count.tu === max) wangList.push('土');
    if (count.jin === max) wangList.push('金');
    if (count.shui === max) wangList.push('水');

    return wangList.join('、') + '旺';
  }

  /**
   * 获取五行缺失
   */
  private getWuXingQueShi(count: { mu: number; huo: number; tu: number; jin: number; shui: number }): string[] {
    const que: string[] = [];

    if (count.mu === 0) que.push('木');
    if (count.huo === 0) que.push('火');
    if (count.tu === 0) que.push('土');
    if (count.jin === 0) que.push('金');
    if (count.shui === 0) que.push('水');

    return que;
  }

  /**
   * 获取喜用神（简化版）
   */
  private getXiYongShen(
    dayGan: string,
    strength: '身强' | '身弱' | '中和',
    geJu?: {
      yongShen: string;
      xiShen: string;
      jiShen: string;
      chouShen: string;
    }
  ): string {
    if (geJu) {
      return `用神 ${geJu.yongShen}；喜神 ${geJu.xiShen}`;
    }

    const element = getWuXing(dayGan);
    const cycle = {
      木: { resource: '水', output: '火', wealth: '土', official: '金' },
      火: { resource: '木', output: '土', wealth: '金', official: '水' },
      土: { resource: '火', output: '金', wealth: '水', official: '木' },
      金: { resource: '土', output: '水', wealth: '木', official: '火' },
      水: { resource: '金', output: '木', wealth: '火', official: '土' },
    } as const;

    const relation = cycle[element as keyof typeof cycle];
    if (!relation) {
      return '';
    }

    if (strength === '身弱') {
      return `用神 ${relation.resource}、${element}；喜神 ${element}、${relation.official}`;
    }
    if (strength === '身强') {
      return `用神 ${relation.output}、${relation.wealth}；喜神 ${relation.official}`;
    }
    return `用神 ${relation.wealth}、${relation.official}；喜神 ${relation.output}`;
  }

  /**
   * 获取空亡
   */
  private getKongWang(): string[] {
    return [
      this.yearGanZhi,
      this.monthGanZhi,
      this.dayGanZhi,
      this.hourGanZhi,
    ].map((ganZhi) => {
      const kongWang = KONG_WANG[ganZhi];
      return kongWang ? kongWang.join('、') : '';
    });
  }

  /**
   * 获取季节
   */
  private getJiJie(): string {
    const month = this.lunar.getMonth();
    const jieQi = this.lunar.getJieQi();

    if (month >= 1 && month <= 3) {
      if (month === 1) return '孟春';
      if (month === 2) return '仲春';
      return '季春';
    } else if (month >= 4 && month <= 6) {
      if (month === 4) return '孟夏';
      if (month === 5) return '仲夏';
      return '季夏';
    } else if (month >= 7 && month <= 9) {
      if (month === 7) return '孟秋';
      if (month === 8) return '仲秋';
      return '季秋';
    } else {
      if (month === 10) return '孟冬';
      if (month === 11) return '仲冬';
      return '季冬';
    }
  }

  /**
   * 过滤干支留意关系（根据配置）
   */
  private filterGanZhiLiuYi(ganZhiLiuYi: any): any {
    if (!this.settings.ganZhiLiuYiConfig || !ganZhiLiuYi) {
      return ganZhiLiuYi; // 如果没有配置，返回所有关系
    }

    const filtered: any = {};

    // 过滤天干相生
    if (this.settings.ganZhiLiuYiConfig['天干相生'] !== false && ganZhiLiuYi.tianGanSheng) {
      filtered.tianGanSheng = ganZhiLiuYi.tianGanSheng;
    }

    // 过滤天干相克
    if (this.settings.ganZhiLiuYiConfig['天干相克'] !== false && ganZhiLiuYi.tianGanKe) {
      filtered.tianGanKe = ganZhiLiuYi.tianGanKe;
    }

    // 过滤天干相冲
    if (this.settings.ganZhiLiuYiConfig['天干相冲'] !== false && ganZhiLiuYi.tianGanChong) {
      filtered.tianGanChong = ganZhiLiuYi.tianGanChong;
    }

    // 过滤地支半合
    if (this.settings.ganZhiLiuYiConfig['地支半合'] !== false && ganZhiLiuYi.diZhiBanHe) {
      filtered.diZhiBanHe = ganZhiLiuYi.diZhiBanHe;
    }

    // 过滤地支拱合
    if (this.settings.ganZhiLiuYiConfig['地支拱合'] !== false && ganZhiLiuYi.diZhiGongHe) {
      filtered.diZhiGongHe = ganZhiLiuYi.diZhiGongHe;
    }

    // 过滤地支暗合
    if (this.settings.ganZhiLiuYiConfig['地支暗合'] !== false && ganZhiLiuYi.diZhiAnHe) {
      filtered.diZhiAnHe = ganZhiLiuYi.diZhiAnHe;
    }

    return filtered;
  }

  /**
   * 过滤神煞（根据配置）
   */
  private filterShenSha(shenSha: string[][]): string[][] {
    if (!this.settings.shenShaConfig) {
      return shenSha; // 如果没有配置，返回所有神煞
    }

    // 导入神煞过滤函数和名称映射
    const { filterShenSha: filterFunc, BAZI_SHENSHA_NAME_MAP } = require('@/lib/config/shenShaConfig');

    return shenSha.map(pillarShenSha =>
      filterFunc(pillarShenSha, this.settings.shenShaConfig, BAZI_SHENSHA_NAME_MAP)
    );
  }

  /**
   * 获取神煞（完善版）
   */
  private getShenSha(): string[][] {
    const yearGan = this.yearGan;
    const yearZhi = this.yearZhi;
    const monthGan = this.monthGan;
    const monthZhi = this.monthZhi;
    const dayGan = this.dayGan;
    const dayZhi = this.dayZhi;
    const hourGan = this.hourGan;
    const hourZhi = this.hourZhi;

    const allZhi = [yearZhi, monthZhi, dayZhi, hourZhi];
    const allGan = [yearGan, monthGan, dayGan, hourGan];

    // 计算基础神煞
    const result = [
      this.calculateShenSha(yearGan, yearZhi, dayGan, dayZhi, monthZhi, yearGan, allZhi),
      this.calculateShenSha(monthGan, monthZhi, dayGan, dayZhi, monthZhi, yearGan, allZhi),
      this.calculateShenSha(dayGan, dayZhi, dayGan, dayZhi, monthZhi, yearGan, allZhi),
      this.calculateShenSha(hourGan, hourZhi, dayGan, dayZhi, monthZhi, yearGan, allZhi)
    ];

    // 检查三奇贵人（需要在四柱天干中同时出现）
    const tianQi = SAN_QI_GUI_REN.tian.every(g => allGan.includes(g));
    const diQi = SAN_QI_GUI_REN.di.every(g => allGan.includes(g));
    const renQi = SAN_QI_GUI_REN.ren.every(g => allGan.includes(g));

    if (tianQi || diQi || renQi) {
      // 将三奇贵人添加到日柱
      if (!result[2].includes('三奇贵人')) {
        result[2].push('三奇贵人');
      }
    }

    // 检查四废日（需要根据季节判断）
    const jiJie = this.getJiJie();
    let season = '';
    if (jiJie.includes('春')) season = '春';
    else if (jiJie.includes('夏')) season = '夏';
    else if (jiJie.includes('秋')) season = '秋';
    else if (jiJie.includes('冬')) season = '冬';

    if (season && SI_FEI_RI[season]) {
      const dayGanZhi = dayGan + dayZhi;
      if (SI_FEI_RI[season].includes(dayGanZhi)) {
        if (!result[2].includes('四废日')) {
          result[2].push('四废日');
        }
      }
    }

    // 检查童子煞（需要根据季节和地支判断）
    const tongZiZhis = season === '春' || season === '秋' ? TONG_ZI_SHA['春秋'] : TONG_ZI_SHA['冬夏'];
    for (let i = 0; i < allZhi.length; i++) {
      if (tongZiZhis.includes(allZhi[i])) {
        if (!result[i].includes('童子煞')) {
          result[i].push('童子煞');
        }
      }
    }

    // 检查冲天煞（年干支=月干支 或 日干支=时干支）
    const yearGanZhi = yearGan + yearZhi;
    const monthGanZhi = monthGan + monthZhi;
    const dayGanZhi = dayGan + dayZhi;
    const hourGanZhi = hourGan + hourZhi;

    if (yearGanZhi === monthGanZhi) {
      if (!result[0].includes('冲天煞')) result[0].push('冲天煞');
      if (!result[1].includes('冲天煞')) result[1].push('冲天煞');
    }

    if (dayGanZhi === hourGanZhi) {
      if (!result[2].includes('冲天煞')) result[2].push('冲天煞');
      if (!result[3].includes('冲天煞')) result[3].push('冲天煞');
    }

    // 检查截空（以日干查时支）
    const jieKongZhis = JIE_KONG[dayGan];
    if (jieKongZhis && jieKongZhis.includes(hourZhi)) {
      if (!result[3].includes('截空')) {
        result[3].push('截空');
      }
    }

    // 检查天赦（以月支查日干支）
    const tianSheGanZhis = TIAN_SHE[monthZhi];
    if (tianSheGanZhis && tianSheGanZhis.includes(dayGanZhi)) {
      if (!result[2].includes('天赦')) {
        result[2].push('天赦');
      }
    }

    // 检查天转（以月支查日干支）
    const tianZhuanGanZhis = TIAN_ZHUAN[monthZhi];
    if (tianZhuanGanZhis && tianZhuanGanZhis.includes(dayGanZhi)) {
      if (!result[2].includes('天转')) {
        result[2].push('天转');
      }
    }

    // 检查地转（以月支查日干支）
    const diZhuanGanZhis = DI_ZHUAN[monthZhi];
    if (diZhuanGanZhis && diZhuanGanZhis.includes(dayGanZhi)) {
      if (!result[2].includes('地转')) {
        result[2].push('地转');
      }
    }

    // 检查拱禄（特定日时干支组合）
    const gongLuKey = dayGanZhi + hourGanZhi;
    if (GONG_LU[gongLuKey]) {
      const gongLuZhi = GONG_LU[gongLuKey];
      // 检查年月日时支中是否有拱禄的地支
      for (let i = 0; i < allZhi.length; i++) {
        if (allZhi[i] === gongLuZhi) {
          if (!result[i].includes('拱禄')) {
            result[i].push('拱禄');
          }
        }
      }
    }

    // 检查金神（固定日干支或时干支）
    if (JIN_SHEN.includes(dayGanZhi)) {
      if (!result[2].includes('金神')) {
        result[2].push('金神');
      }
    }
    if (JIN_SHEN.includes(hourGanZhi)) {
      if (!result[3].includes('金神')) {
        result[3].push('金神');
      }
    }

    // 应用神煞过滤配置
    return this.filterShenSha(result);
  }

  /**
   * 计算单柱神煞
   */
  private calculateShenSha(
    gan: string,
    zhi: string,
    dayGan: string,
    dayZhi: string,
    monthZhi: string,
    yearGan: string,
    allZhi: string[]
  ): string[] {
    const shenSha: string[] = [];
    const yearZhi = allZhi[0];
    const ganZhi = gan + zhi;

    // 天乙贵人（以日干查四柱地支）
    const tianYi = TIAN_YI_GUI_REN[dayGan];
    if (tianYi && tianYi.includes(zhi)) {
      shenSha.push('天乙贵人');
    }

    // 文昌贵人（以日干查地支）
    if (WEN_CHANG_GUI_REN[dayGan] === zhi) {
      shenSha.push('文昌贵人');
    }

    // 天德贵人（以月支查地支）
    if (TIAN_DE_GUI_REN[monthZhi] === zhi || TIAN_DE_GUI_REN[monthZhi] === gan) {
      shenSha.push('天德贵人');
    }

    // 月德贵人（以月支查天干或地支）
    if (YUE_DE_GUI_REN[monthZhi] === gan || YUE_DE_GUI_REN[monthZhi] === zhi) {
      shenSha.push('月德贵人');
    }

    // 福星贵人（以日干查地支）
    if (FU_XING_GUI_REN[dayGan] === zhi) {
      shenSha.push('福星贵人');
    }

    // 天官贵人（以日干查地支）
    if (TIAN_GUAN_GUI_REN[dayGan] === zhi) {
      shenSha.push('天官贵人');
    }

    // 禄神（以日干查地支）
    if (LU_SHEN[dayGan] === zhi) {
      shenSha.push('禄神');
    }

    // 羊刃（以日干查地支）
    if (YANG_REN[dayGan] === zhi) {
      shenSha.push('羊刃');
    }

    // 驿马（以年支或日支查）
    if (YI_MA[dayZhi] === zhi || YI_MA[yearZhi] === zhi) {
      shenSha.push('驿马');
    }

    // 桃花（以年支或日支查）
    if (TAO_HUA[dayZhi] === zhi || TAO_HUA[yearZhi] === zhi) {
      shenSha.push('桃花');
    }

    // 华盖（以年支或日支查）
    if (HUA_GAI[dayZhi] === zhi || HUA_GAI[yearZhi] === zhi) {
      shenSha.push('华盖');
    }

    // 将星（以年支或日支查）
    if (JIANG_XING[dayZhi] === zhi || JIANG_XING[yearZhi] === zhi) {
      shenSha.push('将星');
    }

    // 劫煞（以年支或日支查）
    if (JIE_SHA[dayZhi] === zhi || JIE_SHA[yearZhi] === zhi) {
      shenSha.push('劫煞');
    }

    // 灾煞（以年支或日支查）
    if (ZAI_SHA[dayZhi] === zhi || ZAI_SHA[yearZhi] === zhi) {
      shenSha.push('灾煞');
    }

    // 孤辰（以年支查）
    if (GU_CHEN[yearZhi] === zhi) {
      shenSha.push('孤辰');
    }

    // 寡宿（以年支查）
    if (GUA_SU[yearZhi] === zhi) {
      shenSha.push('寡宿');
    }

    // 红艳（以日干查地支）
    if (HONG_YAN[dayGan] === zhi) {
      shenSha.push('红艳');
    }

    // 金舆（以日干查地支）
    if (JIN_YU[dayGan] === zhi) {
      shenSha.push('金舆');
    }

    // 学堂（以年支查）
    if (XUE_TANG[yearZhi] === zhi) {
      shenSha.push('学堂');
    }

    // 词馆（以年支查）
    if (CI_GUAN[yearZhi] === zhi) {
      shenSha.push('词馆');
    }

    // 亡神（以年支查）
    if (WANG_SHEN[yearZhi] === zhi) {
      shenSha.push('亡神');
    }

    // 勾绞（以年支查）
    const gouJiao = GOU_JIAO[yearZhi];
    if (gouJiao) {
      if (gouJiao.gou === zhi) shenSha.push('勾绞');
      if (gouJiao.jiao === zhi) shenSha.push('勾绞');
    }

    // 元辰（以年支查）
    if (YUAN_CHEN[yearZhi] === zhi) {
      shenSha.push('元辰');
    }

    // 飞刃（以日干查地支）
    if (FEI_REN[dayGan] === zhi) {
      shenSha.push('飞刃');
    }

    // 红鸾（以年支查）
    if (HONG_LUAN[yearZhi] === zhi) {
      shenSha.push('红鸾');
    }

    // 天喜（以年支查）
    if (TIAN_XI[yearZhi] === zhi) {
      shenSha.push('天喜');
    }

    // 天医（以年支查）
    if (TIAN_YI_STAR[yearZhi] === zhi) {
      shenSha.push('天医');
    }

    // 天厨（以年支查）
    if (TIAN_CHU[yearZhi] === zhi) {
      shenSha.push('天厨');
    }

    // 月空（以月支查）
    const yueKong = YUE_KONG[monthZhi];
    if (yueKong && yueKong.includes(zhi)) {
      shenSha.push('月空');
    }

    // 截路空亡（以年支查）
    const jieLuKongWang = JIE_LU_KONG_WANG[yearZhi];
    if (jieLuKongWang && jieLuKongWang.includes(zhi)) {
      shenSha.push('截路空亡');
    }

    // 阴阳差错（固定日柱）
    if (YIN_YANG_CHA_CUO.includes(ganZhi)) {
      shenSha.push('阴阳差错');
    }

    // 孤鸾煞（固定日柱）
    if (GU_LUAN_SHA.includes(ganZhi)) {
      shenSha.push('孤鸾煞');
    }

    // 铁扫帚（以年支查，需要性别信息）
    const tieSaoZhou = TIE_SAO_ZHOU[yearZhi];
    if (tieSaoZhou) {
      const targetZhi = this.settings.sex === 1 ? tieSaoZhou.male : tieSaoZhou.female;
      if (targetZhi === zhi) {
        shenSha.push('铁扫帚');
      }
    }

    // 天罗地网
    if (TIAN_LUO_DI_WANG.includes(zhi)) {
      if (zhi === '辰' || zhi === '戌') {
        shenSha.push('天罗');
      }
      if (zhi === '丑' || zhi === '未') {
        shenSha.push('地网');
      }
    }

    // 太极贵人（以日干查地支）
    const taiJi = TAI_JI_GUI_REN[dayGan];
    if (taiJi && taiJi.includes(zhi)) {
      shenSha.push('太极贵人');
    }

    // 德秀贵人（以日干查月支）
    const deXiu = DE_XIU_GUI_REN[dayGan];
    if (deXiu && deXiu.includes(monthZhi) && zhi === monthZhi) {
      shenSha.push('德秀贵人');
    }

    // 天德合（以月支查天干）
    if (TIAN_DE_HE[monthZhi] === gan) {
      shenSha.push('天德合');
    }

    // 月德合（以月支查天干）
    if (YUE_DE_HE[monthZhi] === gan) {
      shenSha.push('月德合');
    }

    // 十恶大败（固定日柱）
    if (SHI_E_DA_BAI.includes(ganZhi)) {
      shenSha.push('十恶大败');
    }

    // 六秀日（固定日柱）
    if (LIU_XIU_RI.includes(ganZhi)) {
      shenSha.push('六秀日');
    }

    // 十灵日（固定日柱）
    if (SHI_LING_RI.includes(ganZhi)) {
      shenSha.push('十灵日');
    }

    // 阴注阳受（固定日柱）
    if (YIN_ZHU_YANG_SHOU.includes(ganZhi)) {
      shenSha.push('阴注阳受');
    }

    // 魁罡日（固定日柱）
    if (KUI_GANG_RI.includes(ganZhi)) {
      shenSha.push('魁罡日');
    }

    // 八专日（固定日柱）
    if (BA_ZHUAN_RI.includes(ganZhi)) {
      shenSha.push('八专日');
    }

    // 九丑日（固定日柱）
    if (JIU_CHOU_RI.includes(ganZhi)) {
      shenSha.push('九丑日');
    }

    // 流霞（以日干查地支）
    if (LIU_XIA[dayGan] === zhi) {
      shenSha.push('流霞');
    }

    // 吊客（以年支查地支）
    if (DIAO_KE[yearZhi] === zhi) {
      shenSha.push('吊客');
    }

    // 披麻（以年支查地支）
    if (PI_MA[yearZhi] === zhi) {
      shenSha.push('披麻');
    }

    // 丧门（以年支查地支）
    if (SANG_MEN[yearZhi] === zhi) {
      shenSha.push('丧门');
    }

    // 国印（以年干或日干查地支）
    if (GUO_YIN[yearGan] === zhi || GUO_YIN[dayGan] === zhi) {
      shenSha.push('国印');
    }

    // 血刃（以月支查地支）
    if (XUE_REN[monthZhi] === zhi) {
      shenSha.push('血刃');
    }

    // 六厄（以年支查地支）
    if (LIU_E[yearZhi] === zhi) {
      shenSha.push('六厄');
    }

    return shenSha;
  }

  /**
   * 获取地支神煞（简化版，已废弃）
   */
  private getZhiShenSha(zhi: string): string[] {
    const shenSha: string[] = [];

    // 桃花
    if (['子', '午', '卯', '酉'].includes(zhi)) {
      shenSha.push('桃花');
    }

    // 华盖
    if (['辰', '戌', '丑', '未'].includes(zhi)) {
      shenSha.push('华盖');
    }

    return shenSha;
  }

  /**
   * 获取天干十神
   */
  private getShiShen(dayGan: string, yearGan: string, monthGan: string, hourGan: string): {
    year: string;
    month: string;
    day: string;
    hour: string;
  } {
    return {
      year: getShiShen(dayGan, yearGan),
      month: getShiShen(dayGan, monthGan),
      day: '日主',  // 日干是自己，标记为日主
      hour: getShiShen(dayGan, hourGan)
    };
  }

  /**
   * 获取地支藏干十神
   */
  private getShiShenZhi(dayGan: string, yearZhi: string, monthZhi: string, dayZhi: string, hourZhi: string): {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  } {
    return {
      year: getZhiShiShen(dayGan, yearZhi),
      month: getZhiShiShen(dayGan, monthZhi),
      day: getZhiShiShen(dayGan, dayZhi),
      hour: getZhiShiShen(dayGan, hourZhi)
    };
  }

  /**
   * 获取十神格局分析
   */
  private getShiShenAnalysis(
    dayGan: string,
    yearGan: string,
    monthGan: string,
    hourGan: string,
    yearZhi: string,
    monthZhi: string,
    dayZhi: string,
    hourZhi: string
  ): string {
    // 统计十神数量
    const shiShenCount: { [key: string]: number } = {};

    // 统计天干十神
    const gans = [yearGan, monthGan, hourGan];
    gans.forEach(gan => {
      const shiShen = getShiShen(dayGan, gan);
      if (shiShen) {
        shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 1;
      }
    });

    // 统计地支藏干十神
    const zhis = [yearZhi, monthZhi, dayZhi, hourZhi];
    zhis.forEach(zhi => {
      const shiShens = getZhiShiShen(dayGan, zhi);
      shiShens.forEach(shiShen => {
        if (shiShen) {
          // 地支藏干权重较小，按0.5计算
          shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 0.5;
        }
      });
    });

    return analyzeShiShenPattern(shiShenCount);
  }

  /**
   * 获取大运流年信息
   */
  /**
   * 计算单个干支的神煞（用于大运流年）
   * @param ganZhi 干支字符串（如"甲子"）
   * @param dayGan 日干
   * @param dayZhi 日支
   * @param monthZhi 月支
   * @param yearZhi 年支
   * @returns 神煞数组
   */
  private calculateGanZhiShenSha(
    ganZhi: string,
    dayGan: string,
    dayZhi: string,
    monthZhi: string,
    yearZhi: string
  ): string[] {
    const shenSha: string[] = [];
    const gan = ganZhi[0];
    const zhi = ganZhi[1];

    // 天乙贵人（以日干查地支）
    const tianYi = TIAN_YI_GUI_REN[dayGan];
    if (tianYi && tianYi.includes(zhi)) {
      shenSha.push('天乙贵人');
    }

    // 文昌贵人（以日干查地支）
    if (WEN_CHANG_GUI_REN[dayGan] === zhi) {
      shenSha.push('文昌贵人');
    }

    // 禄神（以日干查地支）
    if (LU_SHEN[dayGan] === zhi) {
      shenSha.push('禄神');
    }

    // 羊刃（以日干查地支）
    if (YANG_REN[dayGan] === zhi) {
      shenSha.push('羊刃');
    }

    // 驿马（以日支查）
    if (YI_MA[dayZhi] === zhi) {
      shenSha.push('驿马');
    }

    // 桃花（以日支查）
    if (TAO_HUA[dayZhi] === zhi) {
      shenSha.push('桃花');
    }

    // 华盖（以日支查）
    if (HUA_GAI[dayZhi] === zhi) {
      shenSha.push('华盖');
    }

    // 将星（以日支查）
    if (JIANG_XING[dayZhi] === zhi) {
      shenSha.push('将星');
    }

    // 劫煞（以日支查）
    if (JIE_SHA[dayZhi] === zhi) {
      shenSha.push('劫煞');
    }

    // 灾煞（以日支查）
    if (ZAI_SHA[dayZhi] === zhi) {
      shenSha.push('灾煞');
    }

    // 红鸾（以年支查）
    if (HONG_LUAN[yearZhi] === zhi) {
      shenSha.push('红鸾');
    }

    // 天喜（以年支查）
    if (TIAN_XI[yearZhi] === zhi) {
      shenSha.push('天喜');
    }

    // 天医（以年支查）
    if (TIAN_YI_STAR[yearZhi] === zhi) {
      shenSha.push('天医');
    }

    // 天罗地网
    if (TIAN_LUO_DI_WANG.includes(zhi)) {
      shenSha.push('天罗地网');
    }

    // 应用神煞过滤配置
    return this.filterShenSha([shenSha])[0];
  }

  private getDaYunLiuNian(dayGan: string): {
    qiYunSui: number;
    qiYunDate?: string;
    daYun: { ganZhi: string; startAge: number; endAge: number; shiShen: string; shenSha?: string[] }[];
    liuNian: { year: number; ganZhi: string; age: number; shiShen: string; shenSha?: string[] }[];
    xiaoYun?: { ganZhi: string; age: number }[];
    currentDaYun?: { ganZhi: string; startAge: number; endAge: number; shiShen: string; shenSha?: string[] };
    currentLiuNian?: { year: number; ganZhi: string; age: number; shiShen: string; shenSha?: string[] };
  } {
    const sect = (this.settings.qiYunLiuPaiType ?? 1) + 1;
    const yun = (this.eightChar as any).getYun(this.settings.sex, sect);
    const daYunLunShu = this.settings.daYunLunShu || 10;
    const allDaYunRefs = (yun.getDaYun(daYunLunShu + 1) as any[]) || [];
    const displayDaYunRefs = allDaYunRefs.filter((item: any) => item.getIndex() > 0);
    const childDaYunRef = allDaYunRefs.find((item: any) => item.getIndex() === 0);
    const now = this.getChinaNow();
    const currentYear = now.getFullYear();
    const startSolar = yun.getStartSolar();
    const qiYunDate = formatDate(new Date(
      startSolar.getYear(),
      startSolar.getMonth() - 1,
      startSolar.getDay(),
      startSolar.getHour(),
      startSolar.getMinute(),
      startSolar.getSecond()
    ));
    const qiYunSui = displayDaYunRefs[0]?.getStartAge() || 0;

    const dayZhi = this.dayZhi;
    const monthZhi = this.monthZhi;
    const yearZhi = this.yearZhi;

    const decorateGanZhi = (ganZhi: string, includeShenSha: boolean) => {
      const result: { shiShen: string; shenSha?: string[] } = {
        shiShen: getShiShen(dayGan, ganZhi[0])
      };

      if (includeShenSha) {
        result.shenSha = this.calculateGanZhiShenSha(ganZhi, dayGan, dayZhi, monthZhi, yearZhi);
      }

      return result;
    };

    const daYun = displayDaYunRefs.map((item: any) => ({
      ganZhi: item.getGanZhi(),
      startAge: item.getStartAge(),
      endAge: item.getEndAge(),
      ...decorateGanZhi(item.getGanZhi(), this.settings.showDaYunShenSha !== false)
    }));

    const activeDaYunRef = allDaYunRefs.find(
      (item: any) => currentYear >= item.getStartYear() && currentYear <= item.getEndYear()
    ) || displayDaYunRefs[0];

    const liuNianRefs = activeDaYunRef ? (activeDaYunRef.getLiuNian() as any[]) : [];
    const liuNian = liuNianRefs.map((item: any) => ({
      year: item.getYear(),
      ganZhi: item.getGanZhi(),
      age: item.getAge(),
      ...decorateGanZhi(item.getGanZhi(), this.settings.showLiuNianShenSha !== false)
    }));

    const xiaoYun = this.settings.showXiaoYun !== false && childDaYunRef && qiYunSui > 1
      ? (childDaYunRef.getXiaoYun(qiYunSui - 1) as any[]).map((item: any) => ({
          ganZhi: item.getGanZhi(),
          age: item.getAge()
        }))
      : undefined;

    const currentDaYun = activeDaYunRef && activeDaYunRef.getIndex() > 0
      ? {
          ganZhi: activeDaYunRef.getGanZhi(),
          startAge: activeDaYunRef.getStartAge(),
          endAge: activeDaYunRef.getEndAge(),
          ...decorateGanZhi(activeDaYunRef.getGanZhi(), this.settings.showDaYunShenSha !== false)
        }
      : undefined;

    const currentLiuNian = liuNian.find(item => item.year === currentYear)
      || getCurrentLiuNian(liuNian, currentYear)
      || undefined;

    return {
      qiYunSui,
      qiYunDate,
      daYun,
      liuNian,
      xiaoYun,
      currentDaYun,
      currentLiuNian
    };
  }

  /**
   * 获取地支藏干信息
   */
  private getDiZhiCangGan(
    dayGan: string,
    yearZhi: string,
    monthZhi: string,
    dayZhi: string,
    hourZhi: string
  ): {
    year: { gan: string[]; shiShen: string[] };
    month: { gan: string[]; shiShen: string[] };
    day: { gan: string[]; shiShen: string[] };
    hour: { gan: string[]; shiShen: string[] };
  } {
    const getCangGanInfo = (zhi: string) => {
      const cangGan = DI_ZHI_CANG_GAN[zhi] || [];
      const shiShen = cangGan.map(gan => getShiShen(dayGan, gan));
      return { gan: cangGan, shiShen };
    };

    return {
      year: getCangGanInfo(yearZhi),
      month: getCangGanInfo(monthZhi),
      day: getCangGanInfo(dayZhi),
      hour: getCangGanInfo(hourZhi)
    };
  }

  /**
   * 获取五行生克关系
   */
  private getWuXingShengKe(gans: string[], zhis: string[]): {
    tianGanWuHe?: Array<{
      gan1: string;
      gan2: string;
      position1: string;
      position2: string;
      heHua: string;
    }>;
    diZhiSanHe?: Array<{
      zhis: string[];
      positions: string[];
      wuXing: string;
      isComplete: boolean;
    }>;
    diZhiSanHui?: Array<{
      zhis: string[];
      positions: string[];
      wuXing: string;
      isComplete: boolean;
    }>;
    diZhiLiuHe?: Array<{
      zhi1: string;
      zhi2: string;
      position1: string;
      position2: string;
      heHua: string;
    }>;
    diZhiXiangChong?: Array<{
      zhi1: string;
      zhi2: string;
      position1: string;
      position2: string;
    }>;
    diZhiXiangXing?: Array<{
      zhis: string[];
      positions: string[];
      xingType: string;
    }>;
    diZhiXiangHai?: Array<{
      zhi1: string;
      zhi2: string;
      position1: string;
      position2: string;
    }>;
    diZhiXiangPo?: Array<{
      zhi1: string;
      zhi2: string;
      position1: string;
      position2: string;
    }>;
  } {
    return {
      tianGanWuHe: analyzeTianGanWuHe(gans),
      diZhiSanHe: analyzeDiZhiSanHe(zhis),
      diZhiSanHui: analyzeDiZhiSanHui(zhis),
      diZhiLiuHe: analyzeDiZhiLiuHe(zhis),
      diZhiXiangChong: analyzeDiZhiXiangChong(zhis),
      diZhiXiangXing: analyzeDiZhiXiangXing(zhis),
      diZhiXiangHai: analyzeDiZhiXiangHai(zhis),
      diZhiXiangPo: analyzeDiZhiXiangPo(zhis)
    };
  }

  /**
   * 获取格局判断
   */
  private getGeJu(dayGan: string, monthZhi: string, gans: string[], zhis: string[]): {
    geJuType: string;
    geJuName: string;
    geJuMeaning: string;
    geJuChengBai: string;
    yongShen: string;
    xiShen: string;
    jiShen: string;
    chouShen: string;
  } {
    // 统计十神数量
    const shiShenCount: { [key: string]: number } = {};

    // 统计天干十神
    gans.forEach(gan => {
      const shiShen = getShiShen(dayGan, gan);
      if (shiShen && shiShen !== '日主') {
        shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 1;
      }
    });

    // 统计地支藏干十神
    zhis.forEach(zhi => {
      const shiShens = getZhiShiShen(dayGan, zhi);
      shiShens.forEach(shiShen => {
        if (shiShen) {
          // 地支藏干权重较小，按0.5计算
          shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 0.5;
        }
      });
    });

    return analyzeGeJu(dayGan, monthZhi, gans, zhis, shiShenCount);
  }

  /**
   * 获取节气信息
   */
  private getJieQiInfo(): {
    current: string;
    prev: string;
    next: string;
    currentTime?: string;
    nextTime?: string;
    daysToNext?: number;
  } {
    try {
      const byDay = this.settings.jieQiType === 0;
      const lunarRef = this.lunar as any;
      const currentRef = lunarRef.getPrevJieQi?.(byDay) as JieQiRef | undefined;
      const nextRef = lunarRef.getNextJieQi?.(byDay) as JieQiRef | undefined;
      const nextDate = nextRef ? solarToDate(nextRef.getSolar()) : undefined;

      return {
        current: getJieQiName(currentRef) || getJieQiName(this.prevJie) || '未知',
        prev: getJieQiName(this.prevJie) || '未知',
        next: getJieQiName(nextRef) || getJieQiName(this.nextJie) || '未知',
        currentTime: getJieQiTime(currentRef) || getJieQiTime(this.prevJie),
        nextTime: getJieQiTime(nextRef) || getJieQiTime(this.nextJie),
        daysToNext: nextDate
          ? Math.floor((nextDate.getTime() - this.solarDate.getTime()) / (24 * 60 * 60 * 1000))
          : undefined,
      };

      const jieQiTable = (this.lunar as any).getJieQiTable();

      // 获取所有节气名称（按时间顺序）
      const jieQiNames = [
        '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
        '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
        '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
        '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
      ];

      if (!jieQiTable) {
        return {
          current: '未知',
          prev: '未知',
          next: '未知'
        };
      }

      // 获取出生日期的时间戳
      const birthDate = new Date(this.solar.getYear(), this.solar.getMonth() - 1, this.solar.getDay());
      const birthTime = birthDate.getTime();

      // 找到最接近且不晚于出生日期的节气
      let currentJieQi = '';
      let currentJieQiTime = 0;
      let currentIndex = -1;

      for (let i = 0; i < jieQiNames.length; i++) {
        const jieQiName = jieQiNames[i];
        if (jieQiTable[jieQiName]) {
          const jieQiSolar = jieQiTable[jieQiName];
          const jieQiDate = new Date(
            jieQiSolar.getYear(),
            jieQiSolar.getMonth() - 1,
            jieQiSolar.getDay()
          );
          const jieQiTime = jieQiDate.getTime();

          // 找到最接近且不晚于出生日期的节气
          if (jieQiTime <= birthTime && jieQiTime > currentJieQiTime) {
            currentJieQi = jieQiName;
            currentJieQiTime = jieQiTime;
            currentIndex = i;
          }
        }
      }

      // 如果没有找到当前节气，使用第一个节气
      if (currentIndex === -1) {
        currentIndex = 0;
        currentJieQi = jieQiNames[0];
      }

      const prevIndex = (currentIndex - 1 + 24) % 24;
      const nextIndex = (currentIndex + 1) % 24;

      const prev = jieQiNames[prevIndex];
      const next = jieQiNames[nextIndex];

      // 获取当前节气的时间
      let currentTime: string | undefined;
      if (jieQiTable[currentJieQi]) {
        const currentJieQiSolar = jieQiTable[currentJieQi];
        const year = currentJieQiSolar.getYear();
        const month = String(currentJieQiSolar.getMonth()).padStart(2, '0');
        const day = String(currentJieQiSolar.getDay()).padStart(2, '0');
        const hour = String(currentJieQiSolar.getHour()).padStart(2, '0');
        const minute = String(currentJieQiSolar.getMinute()).padStart(2, '0');
        currentTime = `${year}-${month}-${day} ${hour}:${minute}`;
      }

      // 获取下一个节气的时间
      let nextTime: string | undefined;
      let daysToNext: number | undefined;

      if (jieQiTable[next]) {
        const nextJieQiSolar = jieQiTable[next];
        const year = nextJieQiSolar.getYear();
        const month = String(nextJieQiSolar.getMonth()).padStart(2, '0');
        const day = String(nextJieQiSolar.getDay()).padStart(2, '0');
        const hour = String(nextJieQiSolar.getHour()).padStart(2, '0');
        const minute = String(nextJieQiSolar.getMinute()).padStart(2, '0');
        nextTime = `${year}-${month}-${day} ${hour}:${minute}`;

        // 计算距离下一个节气的天数
        const currentDate = new Date(this.solar.getYear(), this.solar.getMonth() - 1, this.solar.getDay());
        const nextDate = new Date(nextJieQiSolar.getYear(), nextJieQiSolar.getMonth() - 1, nextJieQiSolar.getDay());
        daysToNext = Math.ceil((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        current: currentJieQi,
        prev,
        next,
        currentTime,
        nextTime,
        daysToNext
      };
    } catch (error) {
      console.error('获取节气信息失败:', error);
      return {
        current: '未知',
        prev: '未知',
        next: '未知'
      };
    }
  }

  /**
   * 获取中国时区的当前日期
   */
  private getChinaNow(): Date {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    });
    const parts = formatter.formatToParts(new Date()).reduce<Record<string, string>>((result, part) => {
      if (part.type !== 'literal') {
        result[part.type] = part.value;
      }
      return result;
    }, {});

    return new Date(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
  }

  /**
   * 获取当前时间的流月
   */
  private getCurrentLiuYue() {
    const now = this.getChinaNow();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript月份从0开始
    const liuYueList = calculateLiuYue(currentYear);

    // 标记当前月份
    return liuYueList.map(ly => ({
      ...ly,
      isCurrent: ly.month === currentMonth
    }));
  }

  /**
   * 获取当前时间的流日
   */
  private getCurrentLiuRi() {
    const now = this.getChinaNow();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript月份从0开始
    const currentDay = now.getDate();

    // 使用 lunar-javascript 库获取准确的干支
    const liuRiList: { day: number; ganZhi: string; isCurrent?: boolean }[] = [];

    // 获取该月的天数
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const solar = Solar.fromDate(date);
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();
      const dayGan = eightChar.getDayGan();
      const dayZhi = eightChar.getDayZhi();
      const ganZhi = dayGan + dayZhi;

      liuRiList.push({
        day,
        ganZhi,
        isCurrent: day === currentDay
      });
    }

    return liuRiList;
  }

  /**
   * 获取当前时间的流时
   */
  private getCurrentLiuShi() {
    // 获取中国时区的当前时间
    const now = this.getChinaNow();
    const currentSolar = Solar.fromDate(now);
    const currentLunar = currentSolar.getLunar();
    const currentEightChar = currentLunar.getEightChar();
    const currentDayGan = currentEightChar.getDayGan();
    const currentTimeZhi = currentEightChar.getTimeZhi(); // 获取当前时辰的地支

    const liuShiList = calculateLiuShi(currentDayGan);

    // 标记当前时辰（通过地支匹配）
    return liuShiList.map(ls => {
      // 从干支中提取地支（第二个字符）
      const zhi = ls.ganZhi[1];
      return {
        ...ls,
        isCurrent: zhi === currentTimeZhi
      };
    });
  }

  /**
   * 判断是否为当前时辰（已废弃，使用库的方法）
   */
  private isCurrentHour(shiHour: number, currentHour: number): boolean {
    // 时辰对应关系：
    // 0=子时(23-1), 1=丑时(1-3), 2=寅时(3-5), 3=卯时(5-7)
    // 4=辰时(7-9), 5=巳时(9-11), 6=午时(11-13), 7=未时(13-15)
    // 8=申时(15-17), 9=酉时(17-19), 10=戌时(19-21), 11=亥时(21-23)

    if (shiHour === 0) {
      // 子时：23-1点
      return currentHour === 23 || currentHour === 0;
    } else {
      // 其他时辰：每2小时一个时辰
      const startHour = shiHour * 2 - 1;
      const endHour = shiHour * 2 + 1;
      return currentHour >= startHour && currentHour < endHour;
    }
  }
}

/**
 * 创建八字排盘
 */
export function createBaZiPaiPan(settings: BaZiSettings): BaZiResult {
  const paiPan = new BaZiPaiPan(settings);
  return paiPan.getPaiPan();

}
