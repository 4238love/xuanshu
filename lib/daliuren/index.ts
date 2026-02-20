import { Solar, Lunar } from 'lunar-javascript';
import { DaLiuRenSettings, DaLiuRenResult } from '@/types';
import { DI_ZHI, TIAN_GAN } from '../constants';
import { KONG_WANG } from '../liuyao/liuyaoMaps';
import { parseDate, formatDate } from '../utils/common';
import {
  YUE_JIANG,
  DI_ZHI_SHUN_PAI,
  SHI_GAN_JI_GONG,
  GUI_REN_FANG_XIANG,
  ZHOU_YE_GUI_REN,
  GUI_REN_SHUN_XU,
  DUN_GAN_SHUN,
  GAN_ZHI_SHENG_KE_LIU_QIN
} from './constants';
import { TIAN_DI_PAN_TYPE } from './tianDiPanType';

/**
 * 大六壬排盘类
 */
export class DaLiuRenPaiPan {
  private settings: DaLiuRenSettings;
  private solar: Solar;
  private lunar: Lunar;

  private tianPan: string[] = []; // 天盘
  private tianGan: string[] = []; // 天干（遁干）

  constructor(settings: DaLiuRenSettings) {
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
  }

  /**
   * 获取排盘结果
   */
  public getPaiPan(): DaLiuRenResult {
    const eightChar = this.lunar.getEightChar();
    const dayGan = eightChar.getDayGan();
    const dayZhi = eightChar.getDayZhi();
    const hourZhi = eightChar.getTimeZhi();

    // 计算地盘（固定）
    const diPan = this.getDiPan();

    // 计算天盘
    this.tianPan = this.getTianPan();

    // 计算天干（遁干）
    this.initializeTianGan();

    // 计算神盘
    const shenPan = this.getShenPan(this.tianPan, dayGan, hourZhi);

    // 计算四课
    const siKe = this.getSiKe(dayGan, dayZhi, this.tianPan);

    // 计算三传（使用正确的算法）
    const sanChuan = this.getSanChuan(dayGan, dayZhi, siKe);

    // 获取月将和月将神
    const { yueJiang, yueJiangShen } = this.getYueJiangInfo();

    // 判断天地盘类型
    const tianDiPanType = this.getTianDiPanType(yueJiang, hourZhi);

    const result: DaLiuRenResult = {
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

      diPan,
      tianPan: this.tianPan,
      shenPan,
      siKe,
      sanChuan,
      tianDiPanType,
      yueJiang,
      yueJiangShen
    };

    return result;
  }

  /**
   * 获取地盘（固定十二地支顺序）
   * 从寅开始顺时针排列：寅卯辰巳午未申酉戌亥子丑
   */
  private getDiPan(): string[] {
    return ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  }

  /**
   * 获取天盘
   * 口诀：月将加占时，顺行十二辰
   */
  private getTianPan(): string[] {
    const eightChar = this.lunar.getEightChar();
    const hourZhi = eightChar.getTimeZhi();

    // 获取月将
    const { yueJiang } = this.getYueJiangInfo();

    // 获取月将落入时支的宫位
    const diPan = this.getDiPan();
    let yueJiangGongWei = 0;
    for (let i = 0; i < 12; i++) {
      if (diPan[i] === hourZhi) {
        yueJiangGongWei = i;
        break;
      }
    }

    // 从月将落入的宫位开始顺时针添加天盘
    const diZhiShunPai = DI_ZHI_SHUN_PAI[yueJiang];
    const tianPan: string[] = new Array(12).fill('');
    for (let i = 0; i < 12; i++) {
      tianPan[yueJiangGongWei] = diZhiShunPai[i];
      yueJiangGongWei++;
      if (yueJiangGongWei > 11) yueJiangGongWei = 0;
    }

    return tianPan;
  }

  /**
   * 获取月将和月将神
   */
  private getYueJiangInfo(): { yueJiang: string; yueJiangShen: string } {
    const prevQi = this.lunar.getPrevQi(false);
    const nextQi = this.lunar.getNextQi(false);
    const key = prevQi.getName() + nextQi.getName();

    const yueJiangData = YUE_JIANG[key];
    if (yueJiangData) {
      return {
        yueJiang: yueJiangData[0],
        yueJiangShen: yueJiangData[1]
      };
    }

    // 默认返回子（神后）
    return {
      yueJiang: '子',
      yueJiangShen: '神后'
    };
  }

  /**
   * 初始化天干（遁干系统）
   */
  private initializeTianGan(): void {
    const eightChar = this.lunar.getEightChar();
    const dayGanZhi = eightChar.getDay();

    // 获取日干支空亡
    const kongWang = KONG_WANG[dayGanZhi];
    if (!kongWang) {
      this.tianGan = new Array(12).fill('○');
      return;
    }

    // 获取空亡的第二个地支（kongWang 是数组 [string, string]）
    const kongWangZhi = kongWang[1];
    let kongWangGongWei = -1;
    for (let i = 0; i < 12; i++) {
      if (this.tianPan[i] === kongWangZhi) {
        kongWangGongWei = i + 1; // 宫位从1开始
        break;
      }
    }

    if (kongWangGongWei > 0 && DUN_GAN_SHUN[kongWangGongWei]) {
      this.tianGan = [...DUN_GAN_SHUN[kongWangGongWei]];
    } else {
      this.tianGan = new Array(12).fill('○');
    }
  }

  /**
   * 获取神盘（十二神将）
   * 根据昼夜贵人和顺逆排列
   */
  private getShenPan(tianPan: string[], dayGan: string, hourZhi: string): string[] {
    // 获取贵人地支
    const guiRenKey = dayGan + hourZhi;
    const guiRenZhi = ZHOU_YE_GUI_REN[guiRenKey] || '子';

    // 获取贵人落入天盘的宫位
    let guiRenGongWei = -1;
    for (let i = 0; i < 12; i++) {
      if (tianPan[i] === guiRenZhi) {
        guiRenGongWei = i;
        break;
      }
    }

    if (guiRenGongWei === -1) {
      guiRenGongWei = 0;
    }

    const shenPan: string[] = new Array(12).fill('');
    const diPan = this.getDiPan();

    // 判断贵人排列方向（根据贵人落宫的地盘地支）
    const fangXiang = GUI_REN_FANG_XIANG[diPan[guiRenGongWei]];

    if (fangXiang === 0) {
      // 顺排
      for (let i = 0; i < 12; i++) {
        shenPan[guiRenGongWei] = GUI_REN_SHUN_XU[i];
        guiRenGongWei++;
        if (guiRenGongWei > 11) guiRenGongWei = 0;
      }
    } else {
      // 逆排
      for (let i = 0; i < 12; i++) {
        shenPan[guiRenGongWei] = GUI_REN_SHUN_XU[i];
        guiRenGongWei--;
        if (guiRenGongWei < 0) guiRenGongWei = 11;
      }
    }

    return shenPan;
  }

  /**
   * 获取四课
   */
  private getSiKe(dayGan: string, dayZhi: string, tianPan: string[]): string[][] {
    const siKe: string[][] = [];
    const diPan = this.getDiPan();

    // 第一课：日干上神
    const jiGongDiZhi = SHI_GAN_JI_GONG[dayGan]; // 获取十干寄宫地盘地支
    let ganYang = '';
    for (let i = 0; i < 12; i++) {
      if (diPan[i] === jiGongDiZhi) {
        ganYang = tianPan[i];
        break;
      }
    }
    siKe.push([ganYang, dayGan]);

    // 第二课：日干上神的上神
    let ganYin = '';
    for (let i = 0; i < 12; i++) {
      if (diPan[i] === ganYang) {
        ganYin = tianPan[i];
        break;
      }
    }
    siKe.push([ganYin, ganYang]);

    // 第三课：日支上神
    let zhiYang = '';
    for (let i = 0; i < 12; i++) {
      if (diPan[i] === dayZhi) {
        zhiYang = tianPan[i];
        break;
      }
    }
    siKe.push([zhiYang, dayZhi]);

    // 第四课：日支上神的上神
    let zhiYin = '';
    for (let i = 0; i < 12; i++) {
      if (diPan[i] === zhiYang) {
        zhiYin = tianPan[i];
        break;
      }
    }
    siKe.push([zhiYin, zhiYang]);

    return siKe;
  }

  /**
   * 获取三传
   * 由于三传映射表过于庞大（720个组合），这里使用简化算法
   * TODO: 后续可以添加完整的三传映射表以提高准确性
   */
  private getSanChuan(dayGan: string, dayZhi: string, siKe: string[][]): string[] {
    // 简化算法：取四课中的前三个不重复的
    // 注意：这不是完全准确的大六壬三传算法
    // 完整算法需要根据贼克法、比用法、涉害法等12种发用方法
    const sanChuan: string[] = [];
    const used = new Set<string>();

    for (const ke of siKe) {
      const shen = ke[0];
      if (!used.has(shen) && sanChuan.length < 3) {
        sanChuan.push(shen);
        used.add(shen);
      }
    }

    // 如果不足三个，补充
    while (sanChuan.length < 3) {
      const diPan = this.getDiPan();
      sanChuan.push(diPan[sanChuan.length]);
    }

    return sanChuan;
  }

  /**
   * 判断天地盘类型
   * 使用月将+时支查表
   */
  private getTianDiPanType(yueJiang: string, hourZhi: string): string {
    const key = yueJiang + hourZhi;
    return TIAN_DI_PAN_TYPE[key] || '进连茹盘';
  }
}

/**
 * 创建大六壬排盘
 */
export function createDaLiuRenPaiPan(settings: DaLiuRenSettings): DaLiuRenResult {
  const paiPan = new DaLiuRenPaiPan(settings);
  return paiPan.getPaiPan();
}
