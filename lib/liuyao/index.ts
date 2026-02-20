import { Solar, Lunar } from 'lunar-javascript';
import { LiuYaoSettings, LiuYaoResult } from '@/types';
import { parseDate, formatDate, generateYaoShu } from '../utils/common';
import {
  LIU_SHI_SI_GUA,
  LIU_SHI_SI_GUA_LIU_YAO_YAO_MING,
  LIU_SHI_SI_GUA_LIU_YAO_AS,
  LIU_SHI_SI_GUA_LIU_YAO_SHI_YING,
  LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN,
  LIU_SHI_SI_GUA_LIU_YAO_GAN_ZHI,
  LIU_SHI_SI_GUA_LIU_YAO_WU_XING,
  LIU_SHI_SI_GUA_LIU_YAO_NA_YIN,
  LIU_SHI_SI_GUA_LIU_YAO_LIU_SHEN,
  LIU_SHI_SI_GUA_LIU_YAO_YAO_CI,
  LIU_SHI_SI_GUA_SHEN_CI,
  LIU_SHI_SI_GUA_LIU_QIN_QUE_SHI,
  HU_CUO_ZONG_FU,
  GUA_NAME_AND_AS,
  DI_ZHI_SHU,
  XIAN_TIAN_BA_GUA,
  XIAN_TIAN_BA_GUA_YAO,
  KONG_WANG,
  YUE_JIANG,
  WU_BU_YU_SHI,
} from './liuyaoMaps';
import {
  TIAN_YI_GUI_REN,
  TAI_JI_GUI_REN,
  WEN_CHANG_GUI_REN,
  FU_XING_GUI_REN,
  TIAN_CHU_GUI_REN,
  YUE_DE_GUI_REN,
  TIAN_DE_GUI_REN,
  LU_MA,
  HUA_GAI,
  YI_MA,
  TIAN_MA,
  JIANG_XING,
  XIAN_CHI,
  TIAN_XI,
  TIAN_YI,
  MOU_XING,
  HUANG_EN,
  JIE_SHA,
  ZAI_SHA,
  YANG_REN,
  FEI_REN,
  TANG_FU_GUO_YIN,
  TIAN_REN,
  SHEN_SHA_INFO,
} from './shensha';

/**
 * 六爻排盘类
 */
export class LiuYaoPaiPan {
  private settings: LiuYaoSettings;
  private solar: Solar;
  private lunar: Lunar;
  private yaoShu: number[];

  // 干支信息
  private yearGanZhi: string;
  private monthGanZhi: string;
  private dayGanZhi: string;
  private hourGanZhi: string;
  private dayGan: string;

  // 卦象信息
  private liuYaoAs!: string[];           // 六爻爻象
  private liuYaoAsMark!: string[];       // 六爻爻象标识
  private liuYaoAsMarkName!: string[];   // 六爻爻象标识名称
  private bianGuaLiuYaoAs!: string[];    // 变卦六爻爻象

  constructor(settings: LiuYaoSettings) {
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

    // 获取干支信息
    this.yearGanZhi = this.lunar.getYearInGanZhiExact();
    this.monthGanZhi = this.lunar.getMonthInGanZhiExact();
    this.dayGanZhi = this.lunar.getDayInGanZhi();
    this.hourGanZhi = this.lunar.getTimeInGanZhi();
    this.dayGan = this.dayGanZhi.substring(0, 1);

    // 根据排盘类型初始化爻数
    const paiPanType = this.settings.paiPanType ?? 1; // 默认为自动起卦

    if (paiPanType === 0) {
      // 日期起卦模式
      this.yaoShu = this.generateYaoShuByDate();
    } else if (paiPanType === 2) {
      // 手动起卦模式
      this.yaoShu = this.convertManualYaoShu(this.settings.manualYaoShu || [0, 0, 0, 0, 0, 0]);
    } else {
      // 自动起卦模式（随机）
      this.yaoShu = this.settings.yaoShu || generateYaoShu();
    }

    // 初始化六爻数据
    this.initializeLiuYaoData();
  }

  /**
   * 日期起卦：根据年月日时计算爻数
   */
  private generateYaoShuByDate(): number[] {
    // 获取年月日时的数字
    const yearZhi = this.yearGanZhi.substring(1, 2);
    const hourZhi = this.hourGanZhi.substring(1, 2);

    const yearNumber = DI_ZHI_SHU[yearZhi] || 1;
    const monthNumber = this.lunar.getMonth();
    const dayNumber = this.lunar.getDay();
    const hourNumber = DI_ZHI_SHU[hourZhi] || 1;

    // 计算上卦数：(年数 + 月数 + 日数) % 8
    let shangGuaNumber = (yearNumber + monthNumber + dayNumber) % 8;
    shangGuaNumber = shangGuaNumber === 0 ? 8 : shangGuaNumber;

    // 计算下卦数：(年数 + 月数 + 日数 + 时数) % 8
    let xiaGuaNumber = (yearNumber + monthNumber + dayNumber + hourNumber) % 8;
    xiaGuaNumber = xiaGuaNumber === 0 ? 8 : xiaGuaNumber;

    // 计算动爻数：(年数 + 月数 + 日数 + 时数) % 6
    let dongYaoNumber = (yearNumber + monthNumber + dayNumber + hourNumber) % 6;
    dongYaoNumber = dongYaoNumber === 0 ? 6 : dongYaoNumber;

    // 根据上下卦数获取八卦名称
    const shangGuaName = XIAN_TIAN_BA_GUA[shangGuaNumber];
    const xiaGuaName = XIAN_TIAN_BA_GUA[xiaGuaNumber];

    // 获取上下卦的爻象
    const shangGuaYao = XIAN_TIAN_BA_GUA_YAO[shangGuaName];
    const xiaGuaYao = XIAN_TIAN_BA_GUA_YAO[xiaGuaName];

    // 组合成六爻（下卦在下，上卦在上）
    const liuYaoAs = [...xiaGuaYao, ...shangGuaYao];

    // 生成爻数数组（根据爻象和动爻位置）
    const yaoShu: number[] = [];
    for (let i = 0; i < 6; i++) {
      const yaoAs = liuYaoAs[i];
      const isDongYao = (i + 1) === dongYaoNumber;

      if (yaoAs === '—') {
        // 阳爻
        yaoShu.push(isDongYao ? 9 : 7); // 动爻为老阳(9)，不动为少阳(7)
      } else {
        // 阴爻
        yaoShu.push(isDongYao ? 6 : 8); // 动爻为老阴(6)，不动为少阴(8)
      }
    }

    return yaoShu;
  }

  /**
   * 手动起卦：将手动输入的爻数(0-3)转换为标准爻数(6-9)
   */
  private convertManualYaoShu(manualYaoShu: number[]): number[] {
    // 手动输入映射：0=少阳(7), 1=少阴(8), 2=老阳(9), 3=老阴(6)
    const mapping: { [key: number]: number } = {
      0: 7, // 少阳
      1: 8, // 少阴
      2: 9, // 老阳
      3: 6, // 老阴
    };

    return manualYaoShu.map(yao => mapping[yao] || 7);
  }

  /**
   * 初始化六爻数据
   */
  private initializeLiuYaoData(): void {
    this.liuYaoAs = [];
    this.liuYaoAsMark = [];
    this.liuYaoAsMarkName = [];

    // 根据爻数计算六爻爻象、标识和标识名称
    for (let i = 0; i < 6; i++) {
      const yao = this.yaoShu[i];

      // 6(老阴)和8(少阴)为阴爻，7(少阳)和9(老阳)为阳爻
      if (yao === 6 || yao === 8) {
        this.liuYaoAs.push('--');
      } else {
        this.liuYaoAs.push('—');
      }

      // 老阴(6)和老阳(9)会变，需要标识
      if (yao === 6) {
        this.liuYaoAsMark.push('×');
        this.liuYaoAsMarkName.push('老阴');
      } else if (yao === 9) {
        this.liuYaoAsMark.push('○');
        this.liuYaoAsMarkName.push('老阳');
      } else if (yao === 7) {
        this.liuYaoAsMark.push('');
        this.liuYaoAsMarkName.push('少阳');
      } else {
        this.liuYaoAsMark.push('');
        this.liuYaoAsMarkName.push('少阴');
      }
    }

    // 计算变卦六爻爻象
    this.bianGuaLiuYaoAs = [];
    for (let i = 0; i < 6; i++) {
      if (this.liuYaoAsMark[i] !== '') {
        // 有标识的爻会变：阳变阴，阴变阳
        this.bianGuaLiuYaoAs.push(this.liuYaoAs[i] === '—' ? '--' : '—');
      } else {
        // 无标识的爻不变
        this.bianGuaLiuYaoAs.push(this.liuYaoAs[i]);
      }
    }
  }

  /**
   * 根据六爻爻象获取卦象符号
   */
  private getGuaAs(liuYaoAs: string[]): string {
    const key = liuYaoAs.join(',');
    const guaInfo = GUA_NAME_AND_AS[key];
    return guaInfo ? guaInfo[5] : '';
  }

  /**
   * 获取排盘结果
   */
  public getPaiPan(): LiuYaoResult {
    // 获取本卦卦象
    const benGuaAs = this.getGuaAs(this.liuYaoAs);
    const benGuaName = LIU_SHI_SI_GUA[benGuaAs] || '未知卦';

    // 获取变卦卦象
    const bianGuaAs = this.getGuaAs(this.bianGuaLiuYaoAs);
    const bianGuaName = LIU_SHI_SI_GUA[bianGuaAs] || '未知卦';

    // 获取互错综伏卦
    const huCuoZongFu = HU_CUO_ZONG_FU[benGuaAs] || ['', '', '', ''];
    const huGuaAs = huCuoZongFu[0];
    const cuoGuaAs = huCuoZongFu[1];
    const zongGuaAs = huCuoZongFu[2];
    const fuGuaAs = huCuoZongFu[3];

    const huGuaName = LIU_SHI_SI_GUA[huGuaAs] || '未知卦';
    const cuoGuaName = LIU_SHI_SI_GUA[cuoGuaAs] || '未知卦';
    const zongGuaName = LIU_SHI_SI_GUA[zongGuaAs] || '未知卦';
    const fuGuaName = LIU_SHI_SI_GUA[fuGuaAs] || '未知卦';

    // 获取上下卦信息
    const guaInfo = GUA_NAME_AND_AS[this.liuYaoAs.join(',')];
    const shangGuaName = guaInfo ? guaInfo[0] : '';
    const shangGuaSymbol = guaInfo ? guaInfo[1] : '';
    const xiaGuaName = guaInfo ? guaInfo[2] : '';
    const xiaGuaSymbol = guaInfo ? guaInfo[3] : '';

    // 获取卦类型、卦身、卦辞
    const benGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[benGuaName] || ['', '', ''];
    const bianGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[bianGuaName] || ['', '', ''];
    const huGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[huGuaName] || ['', '', ''];
    const cuoGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[cuoGuaName] || ['', '', ''];
    const zongGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[zongGuaName] || ['', '', ''];
    const fuGuaShenCi = LIU_SHI_SI_GUA_SHEN_CI[fuGuaName] || ['', '', ''];

    // 获取本卦六爻详细信息
    const benGuaYaoMing = LIU_SHI_SI_GUA_LIU_YAO_YAO_MING[benGuaAs] || ['', '', '', '', '', ''];
    const benGuaShiYing = LIU_SHI_SI_GUA_LIU_YAO_SHI_YING[benGuaAs] || ['', '', '', '', '', ''];
    const benGuaLiuQin = LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN[benGuaAs] || ['', '', '', '', '', ''];
    const benGuaGanZhi = LIU_SHI_SI_GUA_LIU_YAO_GAN_ZHI[benGuaAs] || ['', '', '', '', '', ''];
    const benGuaWuXing = LIU_SHI_SI_GUA_LIU_YAO_WU_XING[benGuaAs] || ['', '', '', '', '', ''];
    const benGuaNaYin = LIU_SHI_SI_GUA_LIU_YAO_NA_YIN[benGuaAs] || ['', '', '', '', '', ''];
    const benGuaLiuShen = LIU_SHI_SI_GUA_LIU_YAO_LIU_SHEN[this.dayGan] || ['', '', '', '', '', ''];
    const benGuaYaoCi = LIU_SHI_SI_GUA_LIU_YAO_YAO_CI[benGuaAs] || ['', '', '', '', '', ''];

    // 获取变卦六爻详细信息
    const bianGuaYaoMing = LIU_SHI_SI_GUA_LIU_YAO_YAO_MING[bianGuaAs] || ['', '', '', '', '', ''];
    const bianGuaShiYing = LIU_SHI_SI_GUA_LIU_YAO_SHI_YING[bianGuaAs] || ['', '', '', '', '', ''];
    const bianGuaLiuQin = LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN[bianGuaAs] || ['', '', '', '', '', ''];
    const bianGuaGanZhi = LIU_SHI_SI_GUA_LIU_YAO_GAN_ZHI[bianGuaAs] || ['', '', '', '', '', ''];
    const bianGuaWuXing = LIU_SHI_SI_GUA_LIU_YAO_WU_XING[bianGuaAs] || ['', '', '', '', '', ''];
    const bianGuaNaYin = LIU_SHI_SI_GUA_LIU_YAO_NA_YIN[bianGuaAs] || ['', '', '', '', '', ''];
    const bianGuaLiuShen = LIU_SHI_SI_GUA_LIU_YAO_LIU_SHEN[this.dayGan] || ['', '', '', '', '', ''];
    const bianGuaYaoCi = LIU_SHI_SI_GUA_LIU_YAO_YAO_CI[bianGuaAs] || ['', '', '', '', '', ''];

    // 计算伏神
    const fuShen = this.calculateFuShen(benGuaName, benGuaLiuQin);

    // 获取六亲缺失情况
    const liuQinQueShi = LIU_SHI_SI_GUA_LIU_QIN_QUE_SHI[benGuaName] || null;

    // 获取节气信息
    const prevJie = this.lunar.getPrevJie();
    const nextJie = this.lunar.getNextJie();
    const prevQi = this.lunar.getPrevQi();
    const nextQi = this.lunar.getNextQi();

    const result: LiuYaoResult = {
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

      // 卦象基本信息
      shangGua: `${shangGuaName}(${shangGuaSymbol})`,
      xiaGua: `${xiaGuaName}(${xiaGuaSymbol})`,
      benGua: benGuaName,
      benGuaAs: benGuaAs,
      bianGua: bianGuaName,
      bianGuaAs: bianGuaAs,
      huGua: huGuaName,
      huGuaAs: huGuaAs,
      cuoGua: cuoGuaName,
      cuoGuaAs: cuoGuaAs,
      zongGua: zongGuaName,
      zongGuaAs: zongGuaAs,
      fuGua: fuGuaName,
      fuGuaAs: fuGuaAs,

      // 卦类型和卦身
      benGuaType: benGuaShenCi[0],
      benGuaShen: benGuaShenCi[1],
      bianGuaType: bianGuaShenCi[0],
      bianGuaShen: bianGuaShenCi[1],

      // 卦辞
      benGuaCi: benGuaShenCi[2],
      bianGuaCi: bianGuaShenCi[2],
      huGuaCi: huGuaShenCi[2],
      cuoGuaCi: cuoGuaShenCi[2],
      zongGuaCi: zongGuaShenCi[2],
      fuGuaCi: fuGuaShenCi[2],

      // 六爻详细信息
      liuYao: {
        benGua: {
          yaoMing: benGuaYaoMing,
          yaoAs: this.liuYaoAs,
          yaoAsMark: this.liuYaoAsMark,
          yaoAsMarkName: this.liuYaoAsMarkName,
          shiYing: benGuaShiYing,
          liuQin: benGuaLiuQin,
          ganZhi: benGuaGanZhi,
          wuXing: benGuaWuXing,
          naYin: benGuaNaYin,
          liuShen: benGuaLiuShen,
          yaoCi: benGuaYaoCi,
          fuShen: fuShen,
        },
        bianGua: {
          yaoMing: bianGuaYaoMing,
          yaoAs: this.bianGuaLiuYaoAs,
          shiYing: bianGuaShiYing,
          liuQin: bianGuaLiuQin,
          ganZhi: bianGuaGanZhi,
          wuXing: bianGuaWuXing,
          naYin: bianGuaNaYin,
          liuShen: bianGuaLiuShen,
          yaoCi: bianGuaYaoCi,
        },
      },

      // 六亲缺失情况
      liuQinQueShi: liuQinQueShi,

      // 四柱干支信息
      ganZhi: {
        year: this.yearGanZhi,
        month: this.monthGanZhi,
        day: this.dayGanZhi,
        hour: this.hourGanZhi,
      },

      // 节气信息
      jieQi: {
        prevJie: prevJie.getName(),
        nextJie: nextJie.getName(),
        prevQi: prevQi.getName(),
        nextQi: nextQi.getName(),
      },

      // 辅助信息
      xingQi: '周' + this.lunar.getWeekInChinese(),
      jiJie: this.lunar.getSeason(),
      shengXiao: this.lunar.getYearShengXiaoExact(),
      xingZuo: this.solar.getXingZuo() + '座',
      yueXiang: this.lunar.getYueXiang(),

      // 月将和月将神
      yueJiang: this.calculateYueJiang()[0],
      yueJiangShen: this.calculateYueJiang()[1],

      // 五不遇时
      wuBuYuShi: this.calculateWuBuYuShi(),

      // 空亡
      kongWang: this.calculateKongWang(),

      // 年龄和造
      age: this.calculateAge(),
      zao: this.settings.sex === 1 ? '乾造' : '坤造',

      // 神煞
      shenSha: this.calculateShenSha(),
    };

    return result;
  }

  /**
   * 计算月将和月将神
   */
  private calculateYueJiang(): [string, string] {
    const prevQi = this.lunar.getPrevQi().getName();
    const nextQi = this.lunar.getNextQi().getName();
    const key = prevQi + nextQi;

    return YUE_JIANG[key] || ['', ''];
  }

  /**
   * 计算五不遇时
   */
  private calculateWuBuYuShi(): boolean {
    const dayGan = this.dayGanZhi.substring(0, 1);
    const wuBuYuShiGanZhi = WU_BU_YU_SHI[dayGan];

    return wuBuYuShiGanZhi === this.hourGanZhi;
  }

  /**
   * 计算空亡
   */
  private calculateKongWang(): string[] {
    return KONG_WANG[this.dayGanZhi] || [];
  }

  /**
   * 计算年龄（虚岁）
   */
  private calculateAge(): number {
    const currentYear = new Date().getFullYear();
    const birthYear = this.solar.getYear();
    return currentYear - birthYear + 1;
  }

  /**
   * 计算神煞
   */
  private calculateShenSha(): { year: string[]; month: string[]; day: string[]; hour: string[] } {
    const result = {
      year: [] as string[],
      month: [] as string[],
      day: [] as string[],
      hour: [] as string[],
    };

    // 获取四柱的天干和地支
    const yearGan = this.yearGanZhi.substring(0, 1);
    const yearZhi = this.yearGanZhi.substring(1);
    const monthGan = this.monthGanZhi.substring(0, 1);
    const monthZhi = this.monthGanZhi.substring(1);
    const dayGan = this.dayGanZhi.substring(0, 1);
    const dayZhi = this.dayGanZhi.substring(1);
    const hourGan = this.hourGanZhi.substring(0, 1);
    const hourZhi = this.hourGanZhi.substring(1);

    // 定义神煞检查函数
    const checkShenSha = (
      shenShaMap: Record<string, string>,
      baseGanOrZhi: string,
      targetZhi: string,
      shenShaName: string,
      targetArray: string[]
    ) => {
      const shenShaZhis = shenShaMap[baseGanOrZhi];
      if (shenShaZhis && shenShaZhis.includes(targetZhi)) {
        targetArray.push(shenShaName);
      }
    };

    // 遍历四柱，检查每个神煞
    const zhis = [yearZhi, monthZhi, dayZhi, hourZhi];
    const arrays = [result.year, result.month, result.day, result.hour];

    for (let i = 0; i < 4; i++) {
      const zhi = zhis[i];
      const arr = arrays[i];

      // 基于日干的神煞
      checkShenSha(TIAN_YI_GUI_REN, dayGan, zhi, '天乙贵人', arr);
      checkShenSha(TAI_JI_GUI_REN, dayGan, zhi, '太极贵人', arr);
      checkShenSha(WEN_CHANG_GUI_REN, dayGan, zhi, '文昌贵人', arr);
      checkShenSha(FU_XING_GUI_REN, dayGan, zhi, '福星贵人', arr);
      checkShenSha(TIAN_CHU_GUI_REN, dayGan, zhi, '天厨贵人', arr);
      checkShenSha(YANG_REN, dayGan, zhi, '阳刃', arr);
      checkShenSha(FEI_REN, dayGan, zhi, '飞刃', arr);
      checkShenSha(TIAN_REN, dayGan, zhi, '天人', arr);

      // 基于年支的神煞
      checkShenSha(HUA_GAI, yearZhi, zhi, '华盖', arr);
      checkShenSha(YI_MA, yearZhi, zhi, '驿马', arr);
      checkShenSha(JIANG_XING, yearZhi, zhi, '将星', arr);
      checkShenSha(TANG_FU_GUO_YIN, yearZhi, zhi, '唐符国印', arr);

      // 基于月支的神煞
      checkShenSha(YUE_DE_GUI_REN, monthZhi, zhi, '月德贵人', arr);
      checkShenSha(TIAN_DE_GUI_REN, monthZhi, zhi, '天德贵人', arr);
      checkShenSha(TIAN_MA, monthZhi, zhi, '天马', arr);
      checkShenSha(TIAN_XI, monthZhi, zhi, '天喜', arr);
      checkShenSha(TIAN_YI, monthZhi, zhi, '天医', arr);
      checkShenSha(HUANG_EN, monthZhi, zhi, '皇恩', arr);

      // 基于日支的神煞
      checkShenSha(XIAN_CHI, dayZhi, zhi, '咸池', arr);
      checkShenSha(JIE_SHA, dayZhi, zhi, '劫煞', arr);
      checkShenSha(ZAI_SHA, dayZhi, zhi, '灾煞', arr);
      checkShenSha(MOU_XING, dayZhi, zhi, '谋星', arr);

      // 天元禄（基于日干）
      const luMaZhi = LU_MA[dayGan];
      if (luMaZhi && luMaZhi.includes(zhi)) {
        arr.push('天元禄');
      }
    }

    // 应用神煞过滤配置
    if (this.settings.shenShaConfig) {
      const { filterShenSha, LIUYAO_SHENSHA_NAME_MAP } = require('@/lib/config/shenShaConfig');
      result.year = filterShenSha(result.year, this.settings.shenShaConfig, LIUYAO_SHENSHA_NAME_MAP);
      result.month = filterShenSha(result.month, this.settings.shenShaConfig, LIUYAO_SHENSHA_NAME_MAP);
      result.day = filterShenSha(result.day, this.settings.shenShaConfig, LIUYAO_SHENSHA_NAME_MAP);
      result.hour = filterShenSha(result.hour, this.settings.shenShaConfig, LIUYAO_SHENSHA_NAME_MAP);
    }

    return result;
  }

  /**
   * 计算伏神
   */
  private calculateFuShen(benGuaName: string, benGuaLiuQin: string[]): string[] {
    const fuShen: string[] = ['', '', '', '', '', ''];
    const liuQinQueShi = LIU_SHI_SI_GUA_LIU_QIN_QUE_SHI[benGuaName];

    if (!liuQinQueShi) {
      // 无缺失，无伏神
      return fuShen;
    }

    // 获取伏卦的六亲
    const benGuaAs = this.getGuaAs(this.liuYaoAs);
    const huCuoZongFu = HU_CUO_ZONG_FU[benGuaAs];
    if (!huCuoZongFu) return fuShen;

    const fuGuaAs = huCuoZongFu[3];
    const fuGuaLiuQin = LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN[fuGuaAs];
    if (!fuGuaLiuQin) return fuShen;

    // 标记伏神位置
    for (let i = 0; i < 6; i++) {
      if (liuQinQueShi.includes(fuGuaLiuQin[i])) {
        fuShen[i] = '伏';
      }
    }

    return fuShen;
  }
}

/**
 * 创建六爻排盘
 */
export function createLiuYaoPaiPan(settings: LiuYaoSettings): LiuYaoResult {
  const paiPan = new LiuYaoPaiPan(settings);
  return paiPan.getPaiPan();
}
