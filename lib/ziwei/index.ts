import { Solar, Lunar } from 'lunar-javascript';
import { ZiWeiSettings, ZiWeiResult } from '@/types';
import { TIAN_GAN, DI_ZHI } from '../constants';
import { parseDate, formatDate } from '../utils/common';
import * as ZW from './constants';

/**
 * 紫微斗数排盘类（完整版）
 */
export class ZiWeiPaiPan {
  private settings: ZiWeiSettings;
  private solar: Solar;
  private lunar: Lunar;

  // 四柱干支
  private yearGan: string = '';
  private yearZhi: string = '';
  private monthGan: string = '';
  private monthZhi: string = '';
  private dayGan: string = '';
  private dayZhi: string = '';
  private hourGan: string = '';
  private hourZhi: string = '';

  // 命宫身宫
  private mingGongGongWei: number = 0;
  private shenGongGongWei: number = 0;
  private mingGongDiZhi: string = '';
  private shenGongDiZhi: string = '';

  // 五行局
  private wuXingJu: string = '';

  // 紫微星和天府星宫位
  private ziWeiXingGongWei: number = 0;
  private tianFuXingGongWei: number = 0;

  constructor(settings: ZiWeiSettings) {
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

    // 初始化四柱干支
    this.initGanZhi();
  }

  /**
   * 初始化四柱干支
   */
  private initGanZhi(): void {
    // 使用lunar-javascript库获取四柱
    const eightChar = this.lunar.getEightChar();

    this.yearGan = eightChar.getYearGan();
    this.yearZhi = eightChar.getYearZhi();
    this.monthGan = eightChar.getMonthGan();
    this.monthZhi = eightChar.getMonthZhi();
    this.dayGan = eightChar.getDayGan();
    this.dayZhi = eightChar.getDayZhi();
    this.hourGan = eightChar.getTimeGan();
    this.hourZhi = eightChar.getTimeZhi();
  }

  /**
   * 获取排盘结果
   */
  public getPaiPan(): ZiWeiResult {
    // 1. 计算命宫身宫
    this.calculateMingGongShenGong();

    // 2. 计算五行局
    this.calculateWuXingJu();

    // 3. 计算紫微星和天府星宫位
    this.calculateZiWeiTianFuGongWei();

    // 4. 安排十二宫
    const gongWei = this.arrangeGongWei();

    // 5. 计算四化
    const siHua = this.calculateSiHua();

    // 6. 计算大限小限
    const daXian = this.calculateDaXian();
    const xiaoXian = this.calculateXiaoXian();

    const result: ZiWeiResult = {
      solar: formatDate(new Date(
        this.solar.getYear(),
        this.solar.getMonth() - 1,
        this.solar.getDay(),
        this.solar.getHour(),
        this.solar.getMinute(),
        this.solar.getSecond()
      )),
      lunar: this.lunar.toString(),
      name: this.settings.name || '命主',
      sex: this.settings.sex === 1 ? '男' : '女',

      wuXingJu: this.wuXingJu,
      mingGong: this.mingGongDiZhi,
      shenGong: this.shenGongDiZhi,
      gongWei,

      huaLu: siHua.huaLu,
      huaQuan: siHua.huaQuan,
      huaKe: siHua.huaKe,
      huaJi: siHua.huaJi,

      huaLuJieDu: this.getHuaLuJieDu(siHua.huaLu, gongWei),
      huaQuanJieDu: this.getHuaQuanJieDu(siHua.huaQuan, gongWei),
      huaKeJieDu: this.getHuaKeJieDu(siHua.huaKe, gongWei),
      huaJiJieDu: this.getHuaJiJieDu(siHua.huaJi, gongWei),

      daXian,
      xiaoXian,

      mingZhu: ZW.MING_ZHU[this.mingGongDiZhi] || '',
      shenZhu: ZW.SHEN_ZHU[this.yearZhi] || ''
    };

    return result;
  }

  /**
   * 计算命宫身宫
   */
  private calculateMingGongShenGong(): void {
    const month = Math.abs(this.lunar.getMonth());
    const hourZhiIndex = DI_ZHI.indexOf(this.hourZhi);

    // 命宫：从出生月落宫起子时，逆时针数至生时
    // 寅宫起正月，顺数至生月，再从生月起子时，逆数至生时
    let mingGongIndex = (month + 1) % 12; // 寅宫起正月
    mingGongIndex = (mingGongIndex - hourZhiIndex + 12) % 12;

    this.mingGongGongWei = ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[ZW.SHI_ER_GONG_DI_ZHI[mingGongIndex]];
    this.mingGongDiZhi = ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.mingGongGongWei];

    // 身宫：从出生月落宫起子时，顺时针数至生时
    let shenGongIndex = (month + 1) % 12;
    shenGongIndex = (shenGongIndex + hourZhiIndex) % 12;

    this.shenGongGongWei = ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[ZW.SHI_ER_GONG_DI_ZHI[shenGongIndex]];
    this.shenGongDiZhi = ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.shenGongGongWei];
  }

  /**
   * 计算五行局
   */
  private calculateWuXingJu(): void {
    // 默认使用方式1：年干+命宫地支
    const key = this.yearGan + this.mingGongDiZhi;
    this.wuXingJu = ZW.WU_XING_JU_1[key] || '水二局';

    // 如果配置了使用方式2，则使用命宫天干+命宫地支
    // const mingGongTianGan = ZW.SHI_ER_GONG_TIAN_GAN[this.yearGan + this.mingGongDiZhi];
    // const key2 = mingGongTianGan + this.mingGongDiZhi;
    // this.wuXingJu = ZW.WU_XING_JU_2[key2] || '水二局';
  }

  /**
   * 计算紫微星和天府星宫位
   */
  private calculateZiWeiTianFuGongWei(): void {
    const lunarDay = Math.abs(this.lunar.getDay());
    const key = lunarDay + this.wuXingJu;

    // 紫微星宫位
    const ziWeiDiZhi = ZW.ZI_WEI_XING_GONG_WEI[key] || '寅';
    this.ziWeiXingGongWei = ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[ziWeiDiZhi];

    // 天府星宫位（根据紫微星位置确定）
    const tianFuDiZhi = ZW.TIAN_FU_ZI_WEI[ziWeiDiZhi] || '寅';
    this.tianFuXingGongWei = ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[tianFuDiZhi];
  }

  /**
   * 安排十二宫位
   */
  private arrangeGongWei(): { [key: string]: { name: string; zhuXing: string[]; auxStars: string[]; minorStars: string[]; siHua: string[] } } {
    const gongWei: { [key: string]: { name: string; zhuXing: string[]; auxStars: string[]; minorStars: string[]; siHua: string[] } } = {};

    // 获取紫微星和天府星的地支
    const ziWeiDiZhi = ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.ziWeiXingGongWei];
    const tianFuDiZhi = ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.tianFuXingGongWei];

    // 获取紫微星系和天府星系的诸星
    const ziWeiXingXi = ZW.ZI_WEI_XING_XING_XI_ZHU_XING[ziWeiDiZhi] || [];
    const tianFuXingXi = ZW.TIAN_FU_XING_XING_XI_ZHU_XING[tianFuDiZhi] || [];

    // 计算辅星位置
    const zuoFuDiZhi = ZW.ZUO_FU_XING[this.yearGan];
    const youBiDiZhi = ZW.YOU_BI_XING[this.yearGan];
    const wenChangDiZhi = ZW.WEN_CHANG_XING[this.hourZhi];
    const wenQuDiZhi = ZW.WEN_QU_XING[this.hourZhi];
    const luCunDiZhi = ZW.LU_CUN_XING[this.yearGan];
    const tianMaDiZhi = ZW.TIAN_MA_XING[this.yearZhi];

    // 计算杂曜位置
    const qingYangDiZhi = ZW.QING_YANG_XING[this.yearGan];
    const tuoLuoDiZhi = ZW.TUO_LUO_XING[this.yearGan];
    const huoXingDiZhi = ZW.HUO_XING[this.yearZhi]?.[this.hourZhi] || '';
    const lingXingDiZhi = ZW.LING_XING[this.yearZhi]?.[this.hourZhi] || '';
    const diKongDiZhi = ZW.DI_KONG_XING[this.yearZhi];
    const diJieDiZhi = ZW.DI_JIE_XING[this.yearZhi];

    // 安排十二宫
    for (let i = 0; i < 12; i++) {
      const gongWeiNum = (this.mingGongGongWei + i - 1) % 12 + 1;
      const zhi = ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[gongWeiNum];
      const gongName = i === 0 ? '命宫' : ZW.SHI_ER_GONG[i - 1];

      // 收集该宫位的主星
      const zhuXing: string[] = [];

      // 添加紫微星系的星
      const ziWeiIndex = ZW.SHI_ER_GONG_DI_ZHI.indexOf(zhi);
      if (ziWeiXingXi[ziWeiIndex] && ziWeiXingXi[ziWeiIndex] !== '') {
        zhuXing.push(ziWeiXingXi[ziWeiIndex]);
      }

      // 添加天府星系的星
      if (tianFuXingXi[ziWeiIndex] && tianFuXingXi[ziWeiIndex] !== '') {
        zhuXing.push(tianFuXingXi[ziWeiIndex]);
      }

      // 收集该宫位的辅星
      const auxStars: string[] = [];
      if (zhi === zuoFuDiZhi) auxStars.push('左辅');
      if (zhi === youBiDiZhi) auxStars.push('右弼');
      if (zhi === wenChangDiZhi) auxStars.push('文昌');
      if (zhi === wenQuDiZhi) auxStars.push('文曲');
      if (zhi === luCunDiZhi) auxStars.push('禄存');
      if (zhi === tianMaDiZhi) auxStars.push('天马');

      // 收集该宫位的杂曜
      const minorStars: string[] = [];
      if (zhi === qingYangDiZhi) minorStars.push('擎羊');
      if (zhi === tuoLuoDiZhi) minorStars.push('陀罗');
      if (zhi === huoXingDiZhi) minorStars.push('火星');
      if (zhi === lingXingDiZhi) minorStars.push('铃星');
      if (zhi === diKongDiZhi) minorStars.push('地空');
      if (zhi === diJieDiZhi) minorStars.push('地劫');

      gongWei[zhi] = {
        name: gongName,
        zhuXing,
        auxStars,
        minorStars,
        siHua: []
      };
    }

    return gongWei;
  }

  /**
   * 计算四化
   */
  private calculateSiHua(): { huaLu: string; huaQuan: string; huaKe: string; huaJi: string } {
    const siHuaList = ZW.SI_HUA_GONG_WEI[this.yearGan] || ['', '', '', ''];

    return {
      huaLu: siHuaList[0],
      huaQuan: siHuaList[1],
      huaKe: siHuaList[2],
      huaJi: siHuaList[3]
    };
  }

  /**
   * 计算大限
   */
  private calculateDaXian(): string[] {
    // 判断阴阳男女
    const yangGan = ['甲', '丙', '戊', '庚', '壬'];
    const isYangYear = yangGan.includes(this.yearGan);
    const sex = this.settings.sex === 1 ? '男' : '女';

    let yinYang = isYangYear ? '阳' : '阴';
    if (sex === '女') {
      yinYang = isYangYear ? '阴' : '阳';
    }

    const key = yinYang + sex + this.wuXingJu;
    const daXianTemplate = ZW.DA_XIAN[key] || ZW.DA_XIAN['阳男水二局'];

    // 从命宫开始排列大限
    const daXian: string[] = [];
    for (let i = 0; i < 12; i++) {
      const gongWeiNum = (this.mingGongGongWei + i - 1) % 12;
      daXian.push(daXianTemplate[gongWeiNum]);
    }

    return daXian;
  }

  /**
   * 计算小限
   */
  private calculateXiaoXian(): string[] {
    const sex = this.settings.sex === 1 ? '男' : '女';
    const key = this.yearZhi + sex;
    const xiaoXianData = ZW.XIAO_XIAN[key] || ZW.XIAO_XIAN['子男'];

    return xiaoXianData;
  }

  /**
   * 化禄解读
   */
  private getHuaLuJieDu(huaLu: string, gongWei: any): string {
    // 找到化禄星落入的宫位
    for (const [zhi, gong] of Object.entries(gongWei)) {
      const gongData = gong as { name: string; zhuXing: string[] };
      if (gongData.zhuXing.includes(huaLu)) {
        const key = '禄' + gongData.name;
        return ZW.SI_HUA_XING_SHI_ER_GONG[key] || `化禄星${huaLu}落${gongData.name}宫`;
      }
    }
    return `化禄星${huaLu}`;
  }

  /**
   * 化权解读
   */
  private getHuaQuanJieDu(huaQuan: string, gongWei: any): string {
    for (const [zhi, gong] of Object.entries(gongWei)) {
      const gongData = gong as { name: string; zhuXing: string[] };
      if (gongData.zhuXing.includes(huaQuan)) {
        const key = '权' + gongData.name;
        return ZW.SI_HUA_XING_SHI_ER_GONG[key] || `化权星${huaQuan}落${gongData.name}宫`;
      }
    }
    return `化权星${huaQuan}`;
  }

  /**
   * 化科解读
   */
  private getHuaKeJieDu(huaKe: string, gongWei: any): string {
    for (const [zhi, gong] of Object.entries(gongWei)) {
      const gongData = gong as { name: string; zhuXing: string[] };
      if (gongData.zhuXing.includes(huaKe)) {
        const key = '科' + gongData.name;
        return ZW.SI_HUA_XING_SHI_ER_GONG[key] || `化科星${huaKe}落${gongData.name}宫`;
      }
    }
    return `化科星${huaKe}`;
  }

  /**
   * 化忌解读
   */
  private getHuaJiJieDu(huaJi: string, gongWei: any): string {
    for (const [zhi, gong] of Object.entries(gongWei)) {
      const gongData = gong as { name: string; zhuXing: string[] };
      if (gongData.zhuXing.includes(huaJi)) {
        const key = '忌' + gongData.name;
        return ZW.SI_HUA_XING_SHI_ER_GONG[key] || `化忌星${huaJi}落${gongData.name}宫`;
      }
    }
    return `化忌星${huaJi}`;
  }
}

/**
 * 创建紫微斗数排盘
 */
export function createZiWeiPaiPan(settings: ZiWeiSettings): ZiWeiResult {
  const paiPan = new ZiWeiPaiPan(settings);
  return paiPan.getPaiPan();
}
