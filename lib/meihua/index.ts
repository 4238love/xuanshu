import { Solar, Lunar } from 'lunar-javascript';
import { MeiHuaSettings, MeiHuaResult } from '@/types';
import { BA_GUA, BA_GUA_SYMBOL, LIU_SHI_SI_GUA, DI_ZHI, TIAN_GAN, WU_XING_MAP, NA_YIN, SHENG_XIAO } from '../constants';
import { parseDate, formatDate, getWuXing, getNaYin, getXingZuo } from '../utils/common';
import { BA_GUA_WU_XING, BA_GUA_FANG_WEI, DI_ZHI_SHU, YONG_TI_GUAN_XI, BIAN_GUA, GUA_CI, getYaoMing, getYaoXiang, getYaoCi, YUE_JIANG, KONG_WANG, WU_BU_YU_SHI } from './constants';

/**
 * 梅花易数排盘类
 */
export class MeiHuaPaiPan {
  private settings: MeiHuaSettings;
  private solar: Solar;
  private lunar: Lunar;
  private guaMa: number;

  constructor(settings: MeiHuaSettings) {
    this.settings = settings;

    // 解析日期
    const date = parseDate(this.settings.date);

    if (this.settings.dateType === 0) {
      this.solar = Solar.fromDate(date);
      this.lunar = this.solar.getLunar();
    } else {
      this.lunar = Lunar.fromDate(date);
      this.solar = this.lunar.getSolar();
    }

    // 获取或生成卦码
    this.guaMa = this.settings.guaMa || this.generateGuaMa();
  }

  /**
   * 获取排盘结果
   */
  public getPaiPan(): MeiHuaResult {
    // 解析卦码
    const shangGuaNum = Math.floor(this.guaMa / 100);
    const xiaGuaNum = Math.floor((this.guaMa % 100) / 10);
    const dongYao = this.guaMa % 10;

    // 获取卦象
    const shangGua = BA_GUA[shangGuaNum - 1];
    const xiaGua = BA_GUA[xiaGuaNum - 1];

    // 计算本卦
    const benGua = this.getGuaCode(shangGuaNum) + this.getGuaCode(xiaGuaNum);

    // 计算变卦（动爻变化）
    const bianGua = this.calculateBianGua(benGua, dongYao);

    // 计算互卦
    const huGua = this.calculateHuGua(benGua);

    // 计算错卦
    const cuoGua = this.calculateCuoGua(benGua);

    // 计算综卦
    const zongGua = this.calculateZongGua(benGua);

    // 判断体用关系
    const shangGuaYong = dongYao > 3; // 动爻在4、5、6爻，上卦为用
    const tiGua = shangGuaYong ? xiaGua : shangGua;
    const yongGua = shangGuaYong ? shangGua : xiaGua;

    // 获取体用关系
    const tiYongGuanXi = this.getTiYongGuanXi(yongGua, tiGua);

    // 获取卦象五行和方位
    const benGuaWuXing = this.getGuaWuXing(shangGua, xiaGua);
    const benGuaFangWei = this.getGuaFangWei(shangGua, xiaGua);

    // 获取八字干支
    const eightChar = this.lunar.getEightChar();
    const yearGan = eightChar.getYearGan();
    const yearZhi = eightChar.getYearZhi();
    const monthGan = eightChar.getMonthGan();
    const monthZhi = eightChar.getMonthZhi();
    const dayGan = eightChar.getDayGan();
    const dayZhi = eightChar.getDayZhi();
    const hourGan = eightChar.getTimeGan();
    const hourZhi = eightChar.getTimeZhi();

    // 获取生肖和星座
    const shengXiao = SHENG_XIAO[DI_ZHI.indexOf(yearZhi)];
    const xingZuo = getXingZuo(this.solar.getMonth(), this.solar.getDay());

    // 获取卦名
    const benGuaMing = this.getGuaMingByCode(benGua);
    const bianGuaMing = this.getGuaMingByCode(bianGua);
    const huGuaMing = this.getGuaMingByCode(huGua);
    const cuoGuaMing = this.getGuaMingByCode(cuoGua);
    const zongGuaMing = this.getGuaMingByCode(zongGua);

    const result: MeiHuaResult = {
      solar: formatDate(new Date(
        this.solar.getYear(),
        this.solar.getMonth() - 1,
        this.solar.getDay(),
        this.solar.getHour(),
        this.solar.getMinute(),
        this.solar.getSecond()
      )),
      lunar: this.lunar.toString(),
      name: this.settings.name,
      occupy: this.settings.occupy,

      guaMa: this.guaMa,
      shangGua: shangGua + '(' + BA_GUA_SYMBOL[shangGua] + ')',
      xiaGua: xiaGua + '(' + BA_GUA_SYMBOL[xiaGua] + ')',
      dongYao,
      benGua: benGuaMing,
      bianGua: bianGuaMing,
      huGua: huGuaMing,
      cuoGua: cuoGuaMing,
      zongGua: zongGuaMing,

      // 体用关系
      tiGua,
      yongGua,
      tiGuaWuXing: BA_GUA_WU_XING[tiGua],
      yongGuaWuXing: BA_GUA_WU_XING[yongGua],
      tiYongGuanXi,

      // 卦象五行和方位
      benGuaWuXing,
      benGuaFangWei,

      // 干支系统
      yearGan,
      monthGan,
      dayGan,
      hourGan,
      yearZhi,
      monthZhi,
      dayZhi,
      hourZhi,
      yearGanZhi: yearGan + yearZhi,
      monthGanZhi: monthGan + monthZhi,
      dayGanZhi: dayGan + dayZhi,
      hourGanZhi: hourGan + hourZhi,

      // 干支五行
      yearGanWuXing: getWuXing(yearGan),
      monthGanWuXing: getWuXing(monthGan),
      dayGanWuXing: getWuXing(dayGan),
      hourGanWuXing: getWuXing(hourGan),
      yearZhiWuXing: getWuXing(yearZhi),
      monthZhiWuXing: getWuXing(monthZhi),
      dayZhiWuXing: getWuXing(dayZhi),
      hourZhiWuXing: getWuXing(hourZhi),

      // 干支纳音
      yearNaYin: getNaYin(yearGan + yearZhi),
      monthNaYin: getNaYin(monthGan + monthZhi),
      dayNaYin: getNaYin(dayGan + dayZhi),
      hourNaYin: getNaYin(hourGan + hourZhi),

      // 干支空亡
      yearKongWang: this.getKongWang(yearGan, yearZhi),
      monthKongWang: this.getKongWang(monthGan, monthZhi),
      dayKongWang: this.getKongWang(dayGan, dayZhi),
      hourKongWang: this.getKongWang(hourGan, hourZhi),

      // 节气信息
      ...this.getJieQiInfo(),

      // 月将和月将神
      yueJiang: this.calculateYueJiang()[0],
      yueJiangShen: this.calculateYueJiang()[1],

      // 卦辞
      benGuaGuaCi: this.getGuaCi(benGua),
      bianGuaGuaCi: this.getGuaCi(bianGua),
      huGuaGuaCi: this.getGuaCi(huGua),
      cuoGuaGuaCi: this.getGuaCi(cuoGua),
      zongGuaGuaCi: this.getGuaCi(zongGua),

      // 六爻详细信息
      benGuaLiuYao: this.getLiuYaoInfo(benGua, benGuaMing),
      bianGuaLiuYao: this.getLiuYaoInfo(bianGua, bianGuaMing),
      huGuaLiuYao: this.getLiuYaoInfo(huGua, huGuaMing),
      cuoGuaLiuYao: this.getLiuYaoInfo(cuoGua, cuoGuaMing),
      zongGuaLiuYao: this.getLiuYaoInfo(zongGua, zongGuaMing),

      // 卦象分解
      benGuaShangGuaName: shangGua,
      benGuaXiaGuaName: xiaGua,
      benGuaShangGuaAs: BA_GUA_SYMBOL[shangGua],
      benGuaXiaGuaAs: BA_GUA_SYMBOL[xiaGua],

      bianGuaShangGuaName: this.getShangGuaName(bianGua),
      bianGuaXiaGuaName: this.getXiaGuaName(bianGua),
      bianGuaShangGuaAs: BA_GUA_SYMBOL[this.getShangGuaName(bianGua)],
      bianGuaXiaGuaAs: BA_GUA_SYMBOL[this.getXiaGuaName(bianGua)],

      huGuaShangGuaName: this.getShangGuaName(huGua),
      huGuaXiaGuaName: this.getXiaGuaName(huGua),
      huGuaShangGuaAs: BA_GUA_SYMBOL[this.getShangGuaName(huGua)],
      huGuaXiaGuaAs: BA_GUA_SYMBOL[this.getXiaGuaName(huGua)],

      cuoGuaShangGuaName: this.getShangGuaName(cuoGua),
      cuoGuaXiaGuaName: this.getXiaGuaName(cuoGua),
      cuoGuaShangGuaAs: BA_GUA_SYMBOL[this.getShangGuaName(cuoGua)],
      cuoGuaXiaGuaAs: BA_GUA_SYMBOL[this.getXiaGuaName(cuoGua)],

      zongGuaShangGuaName: this.getShangGuaName(zongGua),
      zongGuaXiaGuaName: this.getXiaGuaName(zongGua),
      zongGuaShangGuaAs: BA_GUA_SYMBOL[this.getShangGuaName(zongGua)],
      zongGuaXiaGuaAs: BA_GUA_SYMBOL[this.getXiaGuaName(zongGua)],

      // 辅助信息
      shengXiao,
      xingZuo,
      yueXiang: this.getYueXiang(),
      wuBuYuShi: this.isWuBuYuShi(dayGan, hourZhi)
    };

    return result;
  }

  /**
   * 获取卦辞
   */
  private getGuaCi(guaCode: string): string {
    return GUA_CI[guaCode] || '卦辞暂缺';
  }

  /**
   * 获取六爻信息
   */
  private getLiuYaoInfo(guaCode: string, guaMing: string): {
    yaoMing: string[];
    yaoXiang: string[];
    yaoCi: string[];
  } {
    const yaoMing = getYaoMing(guaCode);
    const yaoXiang = getYaoXiang(guaCode);
    const yaoCi = getYaoCi(guaMing, yaoMing);

    return {
      yaoMing,
      yaoXiang,
      yaoCi
    };
  }

  /**
   * 获取上卦名称
   */
  private getShangGuaName(guaCode: string): string {
    const shangGuaCode = guaCode.substring(0, 3);
    const codes = ['111', '110', '101', '100', '011', '010', '001', '000'];
    const index = codes.indexOf(shangGuaCode);
    return index !== -1 ? BA_GUA[index] : '';
  }

  /**
   * 获取下卦名称
   */
  private getXiaGuaName(guaCode: string): string {
    const xiaGuaCode = guaCode.substring(3, 6);
    const codes = ['111', '110', '101', '100', '011', '010', '001', '000'];
    const index = codes.indexOf(xiaGuaCode);
    return index !== -1 ? BA_GUA[index] : '';
  }

  /**
   * 获取月相
   */
  private getYueXiang(): string {
    const day = this.lunar.getDay();

    if (day === 1) return '朔';
    if (day <= 7) return '上弦';
    if (day === 15) return '望';
    if (day <= 22) return '下弦';
    return '晦';
  }

  /**
   * 判断是否为五不遇时
   */
  private isWuBuYuShi(dayGan: string, hourZhi: string): boolean {
    const wuBuYuShi: { [key: string]: string } = {
      '甲': '申',
      '乙': '酉',
      '丙': '戌',
      '丁': '亥',
      '戊': '子',
      '己': '丑',
      '庚': '寅',
      '辛': '卯',
      '壬': '辰',
      '癸': '巳'
    };

    return wuBuYuShi[dayGan] === hourZhi;
  }

  /**
   * 获取卦象五行
   */
  private getGuaWuXing(shangGua: string, xiaGua: string): string {
    const shangWuXing = BA_GUA_WU_XING[shangGua];
    const xiaWuXing = BA_GUA_WU_XING[xiaGua];
    return `上卦${shangWuXing}，下卦${xiaWuXing}`;
  }

  /**
   * 获取卦象方位
   */
  private getGuaFangWei(shangGua: string, xiaGua: string): string {
    const shangFangWei = BA_GUA_FANG_WEI[shangGua];
    const xiaFangWei = BA_GUA_FANG_WEI[xiaGua];
    return `上卦${shangFangWei}，下卦${xiaFangWei}`;
  }

  /**
   * 获取空亡
   */
  private getKongWang(gan: string, zhi: string): string {
    const ganIndex = TIAN_GAN.indexOf(gan);
    const zhiIndex = DI_ZHI.indexOf(zhi);

    if (ganIndex === -1 || zhiIndex === -1) return '';

    // 计算旬首
    const xunShouGanIndex = ganIndex;
    const xunShouZhiIndex = zhiIndex;

    // 空亡地支：旬首后的两个地支
    const kongWang1Index = (xunShouZhiIndex + 10) % 12;
    const kongWang2Index = (xunShouZhiIndex + 11) % 12;

    return DI_ZHI[kongWang1Index] + '、' + DI_ZHI[kongWang2Index];
  }

  /**
   * 获取节气信息
   */
  private getJieQiInfo(): {
    prevJie?: string;
    prevJieDate?: string;
    prevJieDay?: number;
    nextJie?: string;
    nextJieDate?: string;
    nextJieDay?: number;
    prevQi?: string;
    prevQiDate?: string;
    prevQiDay?: number;
    nextQi?: string;
    nextQiDate?: string;
    nextQiDay?: number;
  } {
    const currentDate = this.solar.toYmd();
    const jieQiList = this.lunar.getJieQiList();
    const jieQiTable = this.lunar.getJieQiTable();

    let prevJie = '';
    let prevJieDate = '';
    let nextJie = '';
    let nextJieDate = '';
    let prevQi = '';
    let prevQiDate = '';
    let nextQi = '';
    let nextQiDate = '';

    // 节气列表（奇数为节，偶数为气）
    const jieList = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
    const qiList = ['雨水', '春分', '谷雨', '小满', '夏至', '大暑', '处暑', '秋分', '霜降', '小雪', '冬至', '大寒'];

    // 查找上一节和下一节
    for (let i = 0; i < jieQiList.length; i++) {
      const jieQiName = jieQiList[i];
      const jieQiDate = jieQiTable[jieQiName];

      if (!jieQiDate) continue;

      const isJie = jieList.includes(jieQiName);
      const isQi = qiList.includes(jieQiName);
      const jieQiDateStr = jieQiDate.toYmd();

      if (jieQiDateStr <= currentDate) {
        if (isJie) {
          prevJie = jieQiName;
          prevJieDate = jieQiDateStr;
        } else if (isQi) {
          prevQi = jieQiName;
          prevQiDate = jieQiDateStr;
        }
      } else {
        if (isJie && !nextJie) {
          nextJie = jieQiName;
          nextJieDate = jieQiDateStr;
        } else if (isQi && !nextQi) {
          nextQi = jieQiName;
          nextQiDate = jieQiDateStr;
        }
      }
    }

    // 计算天数差
    const calcDayDiff = (dateStr: string): number => {
      if (!dateStr) return 0;
      const parts = dateStr.split('-');
      const targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const current = new Date(this.solar.getYear(), this.solar.getMonth() - 1, this.solar.getDay());
      const diff = Math.abs(targetDate.getTime() - current.getTime());
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    return {
      prevJie,
      prevJieDate,
      prevJieDay: prevJieDate ? calcDayDiff(prevJieDate) : undefined,
      nextJie,
      nextJieDate,
      nextJieDay: nextJieDate ? calcDayDiff(nextJieDate) : undefined,
      prevQi,
      prevQiDate,
      prevQiDay: prevQiDate ? calcDayDiff(prevQiDate) : undefined,
      nextQi,
      nextQiDate,
      nextQiDay: nextQiDate ? calcDayDiff(nextQiDate) : undefined
    };
  }

  /**
   * 计算月将和月将神
   * 根据上一个节气和下一个节气查找对应的月将
   */
  private calculateYueJiang(): [string, string] {
    const jieQiInfo = this.getJieQiInfo();
    const prevQi = jieQiInfo.prevQi || '';
    const nextQi = jieQiInfo.nextQi || '';

    // 根据上一气和下一气查找月将
    const key = prevQi + nextQi;
    const yueJiangData = YUE_JIANG[key];

    if (yueJiangData) {
      return yueJiangData;
    }

    return ['', ''];
  }

  /**
   * 生成卦码
   * 支持多种起卦方式
   */
  private generateGuaMa(): number {
    const paiPanType = this.settings.paiPanType || 0;

    switch (paiPanType) {
      case 0:
        // 时间起卦（使用农历和地支数）
        return this.generateByTime();
      case 1:
        // 随机起卦
        return this.generateByRandom();
      case 2:
        // 数字起卦（三位数）
        return this.generateByNumber();
      case 3:
        // 单数起卦（任意位数）
        return this.generateBySingleNumber();
      case 4:
        // 双数起卦（两个数字）
        return this.generateByDoubleNumber();
      default:
        return this.generateByTime();
    }
  }

  /**
   * 时间起卦（使用农历和地支数）
   */
  private generateByTime(): number {
    const eightChar = this.lunar.getEightChar();
    const yearZhi = eightChar.getYearZhi();
    const hourZhi = eightChar.getTimeZhi();

    // 使用地支数（1-12）
    const yearNumber = DI_ZHI_SHU[yearZhi] || 1;
    const monthNumber = this.lunar.getMonth();
    const dayNumber = this.lunar.getDay();
    const hourNumber = DI_ZHI_SHU[hourZhi] || 1;

    // 上卦 = (年数 + 月数 + 日数) % 8
    let shangGua = (yearNumber + monthNumber + dayNumber) % 8;
    if (shangGua === 0) shangGua = 8;

    // 下卦 = (年数 + 月数 + 日数 + 时数) % 8
    let xiaGua = (yearNumber + monthNumber + dayNumber + hourNumber) % 8;
    if (xiaGua === 0) xiaGua = 8;

    // 动爻 = (年数 + 月数 + 日数 + 时数) % 6
    let dongYao = (yearNumber + monthNumber + dayNumber + hourNumber) % 6;
    if (dongYao === 0) dongYao = 6;

    return shangGua * 100 + xiaGua * 10 + dongYao;
  }

  /**
   * 随机起卦
   */
  private generateByRandom(): number {
    const shangGua = Math.floor(Math.random() * 8) + 1;
    const xiaGua = Math.floor(Math.random() * 8) + 1;
    const dongYao = Math.floor(Math.random() * 6) + 1;
    return shangGua * 100 + xiaGua * 10 + dongYao;
  }

  /**
   * 数字起卦（三位数）
   */
  private generateByNumber(): number {
    const shu = this.settings.shu || 123;
    const shuStr = String(shu);

    if (shuStr.length < 3) {
      return this.generateByTime();
    }

    let shangGua = parseInt(shuStr[0]) % 8;
    if (shangGua === 0) shangGua = 8;

    let xiaGua = parseInt(shuStr[1]) % 8;
    if (xiaGua === 0) xiaGua = 8;

    let dongYao = parseInt(shuStr[2]) % 6;
    if (dongYao === 0) dongYao = 6;

    return shangGua * 100 + xiaGua * 10 + dongYao;
  }

  /**
   * 单数起卦（任意位数）
   */
  private generateBySingleNumber(): number {
    const danShu = this.settings.danShu || 12345;
    const danShuStr = String(danShu);
    const length = danShuStr.length;

    if (length < 2) {
      return this.generateByTime();
    }

    // 前半段数字之和
    let number1Count = 0;
    const half = Math.floor(length / 2);
    for (let i = 0; i < half; i++) {
      number1Count += parseInt(danShuStr[i]);
    }

    // 后半段数字之和
    let number2Count = 0;
    for (let i = half; i < length; i++) {
      number2Count += parseInt(danShuStr[i]);
    }

    let shangGua = number1Count % 8;
    if (shangGua === 0) shangGua = 8;

    let xiaGua = number2Count % 8;
    if (xiaGua === 0) xiaGua = 8;

    let dongYao = (number1Count + number2Count) % 6;
    if (dongYao === 0) dongYao = 6;

    return shangGua * 100 + xiaGua * 10 + dongYao;
  }

  /**
   * 双数起卦（两个数字）
   */
  private generateByDoubleNumber(): number {
    const shuangShuOne = this.settings.shuangShuOne || 12;
    const shuangShuTwo = this.settings.shuangShuTwo || 34;

    let num1 = shuangShuOne;
    let num2 = shuangShuTwo;

    // 如果需要求和
    if (this.settings.shangXiaGuaType === 0) {
      const str1 = String(shuangShuOne);
      const str2 = String(shuangShuTwo);
      num1 = 0;
      num2 = 0;
      for (let i = 0; i < str1.length; i++) {
        num1 += parseInt(str1[i]);
      }
      for (let i = 0; i < str2.length; i++) {
        num2 += parseInt(str2[i]);
      }
    }

    let shangGua = num1 % 8;
    if (shangGua === 0) shangGua = 8;

    let xiaGua = num2 % 8;
    if (xiaGua === 0) xiaGua = 8;

    // 动爻计算
    let dongYaoBase = num1 + num2;
    if (this.settings.dongYaoType === 1) {
      // 加时辰数
      const eightChar = this.lunar.getEightChar();
      const hourZhi = eightChar.getTimeZhi();
      const hourNumber = DI_ZHI_SHU[hourZhi] || 1;
      dongYaoBase += hourNumber;
    }

    let dongYao = dongYaoBase % 6;
    if (dongYao === 0) dongYao = 6;

    return shangGua * 100 + xiaGua * 10 + dongYao;
  }

  /**
   * 获取卦的二进制编码
   */
  private getGuaCode(guaNum: number): string {
    const codes = ['111', '110', '101', '100', '011', '010', '001', '000'];
    return codes[guaNum - 1] || '000';
  }

  /**
   * 计算变卦
   */
  private calculateBianGua(benGua: string, dongYao: number): string {
    const guaArray = benGua.split('');
    // 动爻位置（从下往上数）
    const yaoIndex = 6 - dongYao;
    guaArray[yaoIndex] = guaArray[yaoIndex] === '0' ? '1' : '0';
    return guaArray.join('');
  }

  /**
   * 计算互卦
   */
  private calculateHuGua(benGua: string): string {
    // 互卦由2、3、4爻组成下卦，3、4、5爻组成上卦
    const xiaGua = benGua[4] + benGua[3] + benGua[2];
    const shangGua = benGua[3] + benGua[2] + benGua[1];
    return shangGua + xiaGua;
  }

  /**
   * 计算错卦
   */
  private calculateCuoGua(benGua: string): string {
    let cuoGua = '';
    for (let i = 0; i < 6; i++) {
      cuoGua += benGua[i] === '0' ? '1' : '0';
    }
    return cuoGua;
  }

  /**
   * 计算综卦
   */
  private calculateZongGua(benGua: string): string {
    return benGua.split('').reverse().join('');
  }

  /**
   * 根据卦码获取卦名
   */
  private getGuaMingByCode(code: string): string {
    const guaMing = LIU_SHI_SI_GUA[code];
    return guaMing || '未知卦';
  }

  /**
   * 获取体用关系
   */
  private getTiYongGuanXi(yongGua: string, tiGua: string): string {
    const key = yongGua + tiGua;
    return YONG_TI_GUAN_XI[key] || '关系未知';
  }
}

/**
 * 创建梅花易数排盘
 */
export function createMeiHuaPaiPan(settings: MeiHuaSettings): MeiHuaResult {
  const paiPan = new MeiHuaPaiPan(settings);
  return paiPan.getPaiPan();
}
