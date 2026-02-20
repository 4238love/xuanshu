import { Solar, Lunar } from 'lunar-javascript';
import { QiMenSettings, QiMenResult } from '@/types';
import { DI_ZHI } from '../constants';
import { parseDate, formatDate } from '../utils/common';
import * as QiMenConstants from './constants';

/**
 * 奇门遁甲排盘类（转盘）
 */
export class QiMenPaiPan {
  private settings: QiMenSettings;
  private solar: Solar;
  private lunar: Lunar;

  // 四柱干支
  private yearGanZhi: string = '';
  private monthGanZhi: string = '';
  private dayGanZhi: string = '';
  private hourGanZhi: string = '';
  private yearGan: string = '';
  private monthGan: string = '';
  private dayGan: string = '';
  private hourGan: string = '';
  private yearZhi: string = '';
  private monthZhi: string = '';
  private dayZhi: string = '';
  private hourZhi: string = '';

  // 基础信息
  private fuTou: string = '';
  private jieQi: string = '';
  private sanYuan: string = '';
  private yinYangDun: string = '';
  private juShu: number = 1;
  private xunShou: string = '';
  private xunShouYiZhang: string = '';
  private xunShouGongWei: number = 1;

  // 地盘数据
  private diQiYi: string[] = [];
  private diLiuJia: string[] = [];

  // 值符值使
  private zhiFu: string = '';
  private zhiShi: string = '';
  private oldZhiFuGongWei: number = 1;
  private newZhiFuGongWei: number = 1;
  private oldZhiShiGongWei: number = 1;
  private newZhiShiGongWei: number = 1;

  // 四盘
  private diPan: string[] = [];
  private tianPan: string[] = [];
  private renPan: string[] = [];
  private shenPan: string[] = [];

  constructor(settings: QiMenSettings) {
    this.settings = {
      panType: 'zhuan',
      paiPanType: 3,  // 默认时家奇门
      zhiShiType: 0,
      yueJiaQiJuType: 1,
      jieQiType: 1,
      yearGanZhiType: 2,
      monthGanZhiType: 1,
      dayGanZhiType: 0,
      leapMonthType: 0,
      ...settings
    };

    // 解析日期
    const date = parseDate(this.settings.date);

    if (this.settings.dateType === 0) {
      this.solar = Solar.fromDate(date);
      this.lunar = this.solar.getLunar();
    } else {
      this.lunar = Lunar.fromDate(date);
      this.solar = this.lunar.getSolar();
    }

    // 初始化
    this.initialize();
  }

  /**
   * 初始化所有数据
   */
  private initialize(): void {
    this.initializeGanZhi();
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

  /**
   * 初始化四柱干支
   */
  private initializeGanZhi(): void {
    const eightChar = this.lunar.getEightChar();

    this.yearGanZhi = this.lunar.getYearInGanZhi();
    this.monthGanZhi = this.lunar.getMonthInGanZhi();
    this.dayGanZhi = this.lunar.getDayInGanZhi();
    this.hourGanZhi = this.lunar.getTimeInGanZhi();

    this.yearGan = eightChar.getYearGan();
    this.monthGan = eightChar.getMonthGan();
    this.dayGan = eightChar.getDayGan();
    this.hourGan = eightChar.getTimeGan();

    this.yearZhi = eightChar.getYearZhi();
    this.monthZhi = eightChar.getMonthZhi();
    this.dayZhi = eightChar.getDayZhi();
    this.hourZhi = eightChar.getTimeZhi();
  }

  /**
   * 初始化符头和节气
   */
  private initializeFuTouAndJieQi(): void {
    const paiPanType: 0 | 1 | 2 | 3 = this.settings.paiPanType ?? 3;

    // 年家奇门、月家奇门
    if (paiPanType === 0 || paiPanType === 1) {
      this.fuTou = QiMenConstants.RI_ZHU_FU_TOU[this.dayGanZhi] || '甲子';
      const prevJieQi = this.lunar.getPrevJieQi();
      this.jieQi = prevJieQi ? prevJieQi.getName() : '冬至';
      return;
    }

    // 日家奇门、时家奇门
    if (paiPanType === 2 || paiPanType === 3) {
      // 获取当前节气
      const currentJieQi = this.lunar.getJieQi();

      if (currentJieQi) {
        // 当天是节气
        this.jieQi = currentJieQi;
        // 检查是否是符头
        if (QiMenConstants.SAN_YUAN_FU_TOU.includes(this.dayGanZhi)) {
          this.fuTou = this.dayGanZhi;
        } else {
          // 向前查找符头
          this.fuTou = this.findPrevFuTou();
        }
      } else {
        // 当天不是节气
        if (QiMenConstants.SAN_YUAN_FU_TOU.includes(this.dayGanZhi)) {
          // 当天是符头
          this.fuTou = this.dayGanZhi;
          const prevJieQi = this.lunar.getPrevJieQi();
          this.jieQi = prevJieQi ? prevJieQi.getName() : '冬至';
        } else {
          // 向前查找符头和节气
          this.fuTou = this.findPrevFuTou();
          const prevJieQi = this.lunar.getPrevJieQi();
          this.jieQi = prevJieQi ? prevJieQi.getName() : '冬至';
        }
      }
    }
  }

  /**
   * 向前查找符头
   */
  private findPrevFuTou(): string {
    for (let i = 1; i <= 60; i++) {
      const prevLunar = this.lunar.next(-i);
      const prevDayGanZhi = prevLunar.getDayInGanZhi();
      if (QiMenConstants.SAN_YUAN_FU_TOU.includes(prevDayGanZhi)) {
        return prevDayGanZhi;
      }
    }
    return '甲子';
  }

  /**
   * 初始化三元和局数
   */
  private initializeSanYuanAndJuShu(): void {
    const paiPanType: 0 | 1 | 2 | 3 = this.settings.paiPanType ?? 3;

    // 1. 年家奇门
    if (paiPanType === 0) {
      // 简化实现：根据年份计算
      const year = this.solar.getYear();
      const cycle = year % 180;
      if (cycle < 60) {
        this.sanYuan = '上元';
        this.juShu = ((cycle % 9) || 9);
      } else if (cycle < 120) {
        this.sanYuan = '中元';
        this.juShu = (((cycle - 60) % 9) || 9);
      } else {
        this.sanYuan = '下元';
        this.juShu = (((cycle - 120) % 9) || 9);
      }
      return;
    }

    // 2. 月家奇门
    if (paiPanType === 1) {
      const yueJiaQiJuType: 0 | 1 = this.settings.yueJiaQiJuType ?? 1;
      let diZhi: string;

      if (yueJiaQiJuType === 0) {
        // 使用年支起局
        diZhi = this.yearZhi;
      } else {
        // 使用年干支的符头地支起局
        const fuTouData = QiMenConstants.SIX_JIA_ZI_XUN_SHOU_AND_YI_ZHANG[this.yearGanZhi];
        diZhi = fuTouData ? fuTouData[0].substring(1, 2) : this.yearZhi;
      }

      // 根据地支判断三元和局数
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

    // 3. 日家奇门
    if (paiPanType === 2) {
      this.sanYuan = QiMenConstants.RI_ZHU_SAN_YUAN[this.dayGanZhi] || '上元';

      // 根据当年第几天计算局数
      const dayOfYear = this.solar.getDay();
      if (dayOfYear <= 60) this.juShu = 1;
      else if (dayOfYear <= 120) this.juShu = 7;
      else if (dayOfYear <= 180) this.juShu = 4;
      else if (dayOfYear <= 240) this.juShu = 9;
      else if (dayOfYear <= 300) this.juShu = 3;
      else this.juShu = 6;
      return;
    }

    // 4. 时家奇门
    if (paiPanType === 3) {
      this.sanYuan = QiMenConstants.RI_ZHU_SAN_YUAN[this.dayGanZhi] || '上元';
      const juShuArray = QiMenConstants.JU_SHU[this.jieQi] || [1, 7, 4];

      if (this.sanYuan === '上元') this.juShu = juShuArray[0];
      else if (this.sanYuan === '中元') this.juShu = juShuArray[1];
      else this.juShu = juShuArray[2];
    }
  }

  /**
   * 初始化阴阳遁
   */
  private initializeYinYangDun(): void {
    const paiPanType: 0 | 1 | 2 | 3 = this.settings.paiPanType ?? 3;

    // 年家奇门、月家奇门：一律阴遁
    if (paiPanType === 0 || paiPanType === 1) {
      this.yinYangDun = '阴遁';
      return;
    }

    // 日家奇门：根据节气判断
    if (paiPanType === 2) {
      const yangJieQi = QiMenConstants.YIN_YANG_DUN_JIE_QI['阳遁'];
      this.yinYangDun = yangJieQi.includes(this.jieQi) ? '阳遁' : '阴遁';
      return;
    }

    // 时家奇门：根据节气判断
    if (paiPanType === 3) {
      this.yinYangDun = QiMenConstants.JIE_QI_YIN_YANG_DUN[this.jieQi] || '阳遁';
    }
  }

  /**
   * 初始化旬首
   */
  private initializeXunShou(): void {
    const xunShouData = QiMenConstants.SIX_JIA_ZI_XUN_SHOU_AND_YI_ZHANG[this.hourGanZhi];
    if (xunShouData) {
      this.xunShou = xunShouData[0];
      this.xunShouYiZhang = xunShouData[1];
    } else {
      this.xunShou = '甲子';
      this.xunShouYiZhang = '戊';
    }
  }

  /**
   * 初始化地盘奇仪、地盘六甲、值符、值使
   */
  private initializeDiQiYiLiuJiaFuShi(): void {
    // 获取地盘奇仪和六甲
    if (this.yinYangDun === '阳遁') {
      this.diQiYi = QiMenConstants.DI_YANG_QI_YI[this.juShu] || QiMenConstants.DI_YANG_QI_YI[1];
      this.diLiuJia = QiMenConstants.DI_YANG_LIU_JIA[this.juShu] || QiMenConstants.DI_YANG_LIU_JIA[1];
    } else {
      this.diQiYi = QiMenConstants.DI_YIN_QI_YI[this.juShu] || QiMenConstants.DI_YIN_QI_YI[1];
      this.diLiuJia = QiMenConstants.DI_YIN_LIU_JIA[this.juShu] || QiMenConstants.DI_YIN_LIU_JIA[1];
    }

    // 根据旬首找到旬首落宫
    for (let i = 0; i < this.diLiuJia.length; i++) {
      if (this.xunShou === this.diLiuJia[i]) {
        this.xunShouGongWei = i + 1;
        this.oldZhiFuGongWei = i + 1;
        this.oldZhiShiGongWei = i + 1;
        break;
      }
    }

    // 设置值符
    this.zhiFu = QiMenConstants.JIU_XING_INITIAL[this.xunShouGongWei - 1];

    // 设置值使
    const zhiShiType: 0 | 1 | 2 = this.settings.zhiShiType ?? 0;
    if (this.zhiFu === '天禽' || this.xunShouGongWei === 5) {
      if (zhiShiType === 1) {
        // 根据阴阳遁判断
        this.zhiShi = this.yinYangDun === '阳遁' ? '生门' : '死门';
      } else if (zhiShiType === 2) {
        // 根据节气判断
        this.zhiShi = this.getZhiShiByJieQi();
      } else {
        // 一律用死门
        this.zhiShi = '死门';
      }
    } else {
      this.zhiShi = QiMenConstants.BA_MEN_INITIAL[this.xunShouGongWei - 1];
    }
  }

  /**
   * 根据节气获取值使
   */
  private getZhiShiByJieQi(): string {
    const yangJieQi = ['冬至', '立春', '春分', '立夏', '夏至', '立秋', '秋分', '立冬'];
    return yangJieQi.includes(this.jieQi) ? '生门' : '死门';
  }

  /**
   * 初始化地盘
   */
  private initializeDiPan(): void {
    this.diPan = [...this.diQiYi];
  }

  /**
   * 初始化天盘
   */
  private initializeTianPan(): void {
    // 若时干为甲，则使用旬首仪仗
    const hourGan = this.hourGan === '甲' ? this.xunShouYiZhang : this.hourGan;

    // 计算时干落宫
    for (let i = 0; i < this.diQiYi.length; i++) {
      if (hourGan === this.diQiYi[i]) {
        // 值符旋转后落入的宫位，若落中五宫则寄坤二宫
        this.newZhiFuGongWei = (i + 1 === 5) ? 2 : i + 1;
        break;
      }
    }

    // 将九星依次加入宫位中
    for (let i = 0; i < 9; i++) {
      const jiuXing = QiMenConstants.JIU_XING_SHUN[i];
      let zhiFu = this.zhiFu;

      // 若值符为天禽，则使用天芮进行判断
      if (zhiFu === '天禽') zhiFu = '天芮';

      if (zhiFu === jiuXing[this.newZhiFuGongWei - 1]) {
        // 找到匹配的九星排列
        this.tianPan = [...jiuXing];

        // 将天芮更换为芮禽
        for (let j = 0; j < this.tianPan.length; j++) {
          if (this.tianPan[j] === '天芮') {
            this.tianPan[j] = '芮禽';
            break;
          }
        }
        break;
      }
    }

    if (this.tianPan.length === 0) {
      this.tianPan = [...QiMenConstants.JIU_XING_INITIAL];
    }
  }

  /**
   * 初始化人盘
   */
  private initializeRenPan(): void {
    const hourZhi = this.hourZhi;
    const xunShouZhi = this.xunShou.substring(1, 2);

    // 获取旬首地支在地支数组中的索引
    let xunShouZhiIndex = DI_ZHI.indexOf(xunShouZhi);

    // 计算从旬首地支到时支需要的步数
    let hourZhiCount = 0;
    for (let i = 0; i < 12; i++) {
      if (xunShouZhiIndex >= 12) {
        xunShouZhiIndex = 0;
      }
      if (DI_ZHI[xunShouZhiIndex] === hourZhi) {
        break;
      }
      hourZhiCount++;
      xunShouZhiIndex++;
    }

    // 计算值使旋转后的宫位
    let xunShouGong = this.xunShouGongWei;
    if (xunShouZhi !== hourZhi) {
      if (this.yinYangDun === '阳遁') {
        // 阳遁顺排九宫
        for (let i = 0; i < hourZhiCount; i++) {
          if (xunShouGong >= 9) {
            xunShouGong = 1;
          } else {
            xunShouGong++;
          }
        }
      } else {
        // 阴遁逆排九宫
        for (let i = 0; i < hourZhiCount; i++) {
          if (xunShouGong <= 1) {
            xunShouGong = 9;
          } else {
            xunShouGong--;
          }
        }
      }
    }

    // 若值使旋转后落中五宫则寄坤二宫
    this.newZhiShiGongWei = xunShouGong === 5 ? 2 : xunShouGong;

    // 计算人盘
    for (let i = 0; i < 9; i++) {
      const baMen = QiMenConstants.BA_MEN_SHUN_ZHUAN[i];
      if (baMen[this.newZhiShiGongWei - 1] === this.zhiShi) {
        this.renPan = [...baMen];
        break;
      }
    }

    if (this.renPan.length === 0) {
      this.renPan = [...QiMenConstants.BA_MEN_INITIAL];
    }
  }

  /**
   * 初始化神盘
   */
  private initializeShenPan(): void {
    // 若值符落中五宫则寄二宫
    const newZhiFuGong = this.newZhiFuGongWei === 5 ? 2 : this.newZhiFuGongWei;

    // 根据阴阳遁选择顺转或逆转
    if (this.yinYangDun === '阳遁') {
      this.shenPan = QiMenConstants.BA_SHEN_SHUN_ZHUAN[newZhiFuGong] ||
                     [...QiMenConstants.BA_SHEN, ''];
    } else {
      this.shenPan = QiMenConstants.BA_SHEN_NI_ZHUAN[newZhiFuGong] ||
                     [...QiMenConstants.BA_SHEN, ''];
    }
  }

  /**
   * 获取排盘结果
   */
  public getPaiPan(): QiMenResult {
    const result: QiMenResult = {
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

      // 四柱干支
      yearGanZhi: this.yearGanZhi,
      monthGanZhi: this.monthGanZhi,
      dayGanZhi: this.dayGanZhi,
      hourGanZhi: this.hourGanZhi,

      // 基础信息
      fuTou: this.fuTou,
      jieQi: this.jieQi,
      sanYuan: this.sanYuan,
      yinYangDun: this.yinYangDun,
      juShu: `${this.yinYangDun}${this.juShu}局`,
      xunShou: this.xunShou,
      zhiFu: this.zhiFu,
      zhiShi: this.zhiShi,

      // 值符值使宫位
      oldZhiFuGongWei: this.oldZhiFuGongWei,
      newZhiFuGongWei: this.newZhiFuGongWei,
      oldZhiShiGongWei: this.oldZhiShiGongWei,
      newZhiShiGongWei: this.newZhiShiGongWei,

      // 四盘
      diPan: this.diPan,
      tianPan: this.tianPan,
      renPan: this.renPan,
      shenPan: this.shenPan,

      // 地盘六甲
      diLiuJia: this.diLiuJia
    };

    return result;
  }
}

/**
 * 创建奇门遁甲排盘
 */
export function createQiMenPaiPan(settings: QiMenSettings): QiMenResult {
  const paiPan = new QiMenPaiPan(settings);
  return paiPan.getPaiPan();
}
