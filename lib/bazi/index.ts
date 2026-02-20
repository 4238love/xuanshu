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
  getYueJiang,
  getRiZhuLunMing,
  calculateZhengCai,
  calculatePianCai,
  calculateZhengTaoHua,
  calculatePianTaoHua,
  getJiuXingLuck
} from '../utils/common';
import { calculateTrueSolarTime, calculateTrueSolarTimeByCity } from '../utils/trueSolarTime';

/**
 * 八字排盘类
 */
export class BaZiPaiPan {
  private settings: BaZiSettings;
  private solar: Solar;
  private lunar: Lunar;
  private eightChar: EightChar;

  constructor(settings: BaZiSettings) {
    this.settings = {
      leapMonthType: 0,
      xuShiSuiType: 0,
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

    // 解析日期
    let date: Date;

    // 检查是否为农历格式 L:yyyy-m-d-hh-mm-ss-R
    const isLunarDate = this.settings.dateType === 1 || (this.settings.date && this.settings.date.startsWith('L:'));

    if (isLunarDate) {
      // 农历日期格式: L:2024-1-15-08-30:00-R
      const lunarDateStr = this.settings.date || '';
      const match = lunarDateStr.match(/L:(\d{1,4})-(\d{1,2})-(\d{1,2})-(\d{1,2}):(\d{1,2}):(\d{1,2})(-R)?/);

      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);
        const hour = parseInt(match[4]);
        const minute = parseInt(match[5]);
        const isLeapMonth = !!match[7];

        // 使用农历创建日期
        try {
          // lunar-javascript库: 使用Lunar.fromYmd创建农历日期
          this.lunar = Lunar.fromYmd(year, month, day);

          // 获取该农历日期对应的公历日期
          const baseSolar = this.lunar.getSolar();

          // 设置时间 - 如果时间不是00:00
          if (hour > 0 || minute > 0) {
            // 使用Solar.fromDate创建带时间的公历日期
            const solarWithTime = Solar.fromDate(new Date(
              baseSolar.getYear(),
              baseSolar.getMonth() - 1,
              baseSolar.getDay(),
              hour,
              minute,
              0
            ));
            // 从带时间的公历日期获取农历
            this.lunar = solarWithTime.getLunar();
            this.solar = solarWithTime;
          } else {
            this.solar = baseSolar;
          }

          this.eightChar = this.lunar.getEightChar();
          return; // 农历日期已设置完成
        } catch (e) {
          console.error('农历日期解析失败:', e);
          // 如果解析失败，尝试使用公历
          const solarDateStr = lunarDateStr.replace('L:', '');
          date = parseDate(solarDateStr);
          this.settings.dateType = 0; // 改为公历模式
        }
      } else {
        // 格式不正确，使用默认解析
        const solarDateStr = lunarDateStr.replace('L:', '');
        date = parseDate(solarDateStr);
        this.settings.dateType = 0;
      }
    } else {
      // 公历
      date = parseDate(this.settings.date || '2024-01-01 00:00:00');
    }

    // 如果启用真太阳时，调整时间
    if (this.settings.useTrueSolarTime) {
      if (this.settings.city) {
        // 使用城市名称计算
        date = calculateTrueSolarTimeByCity(date, this.settings.city);
      } else if (this.settings.longitude !== undefined) {
        // 使用经度计算
        date = calculateTrueSolarTime(date, this.settings.longitude);
      }
    }

    if (this.settings.dateType === 0) {
      // 公历
      this.solar = Solar.fromDate(date);
      this.lunar = this.solar.getLunar();
    } else {
      // 农历
      this.lunar = Lunar.fromDate(date);
      this.solar = this.lunar.getSolar();
    }

    this.eightChar = this.lunar.getEightChar();
  }

  /**
   * 获取排盘结果
   */
  public getPaiPan(): BaZiResult {
    const yearGan = this.eightChar.getYearGan();
    const yearZhi = this.eightChar.getYearZhi();
    const monthGan = this.eightChar.getMonthGan();
    const monthZhi = this.eightChar.getMonthZhi();
    const dayGan = this.eightChar.getDayGan();
    const dayZhi = this.eightChar.getDayZhi();
    const hourGan = this.eightChar.getTimeGan();
    const hourZhi = this.eightChar.getTimeZhi();

    // 计算五行数量
    const wuXingCount = this.calculateWuXingCount();

    // 获取生肖
    const shengXiao = SHENG_XIAO[DI_ZHI.indexOf(yearZhi)];

    // 将Solar对象转换为Date对象
    const solarDate = new Date(
      this.solar.getYear(),
      this.solar.getMonth() - 1,
      this.solar.getDay(),
      this.solar.getHour(),
      this.solar.getMinute(),
      this.solar.getSecond()
    );

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

    // 预先计算大运流年数据（用于财运和桃花运计算）
    const daYunLiuNianData = this.getDaYunLiuNian(dayGan, monthGan + monthZhi, yearGan, age);
    const daYunList = daYunLiuNianData.daYun || [];
    const liuNianList = daYunLiuNianData.liuNian || [];

    // 获取当前节气
    const currentJieQi = this.getJieQiInfo().current;

    const result: BaZiResult = {
      // 基础信息
      solar: formatDate(solarDate),
      lunar: this.lunar.toString(),
      name: this.settings.name,
      occupy: this.settings.occupy,
      sex: this.settings.sex === 1 ? '男' : '女',
      age: shiSui,        // 实岁
      xuSui: xuSui,       // 虚岁
      shengXiao,
      xingZuo,
      xingQi,
      jiJie,

      // 八字
      baZi: [
        yearGan + yearZhi,
        monthGan + monthZhi,
        dayGan + dayZhi,
        hourGan + hourZhi
      ],
      baZiWuXing: [
        getWuXing(yearGan) + getWuXing(yearZhi),
        getWuXing(monthGan) + getWuXing(monthZhi),
        getWuXing(dayGan) + getWuXing(dayZhi),
        getWuXing(hourGan) + getWuXing(hourZhi)
      ],
      baZiNaYin: [
        getNaYin(yearGan + yearZhi),
        getNaYin(monthGan + monthZhi),
        getNaYin(dayGan + dayZhi),
        getNaYin(hourGan + hourZhi)
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

      // 五行统计
      muCount: wuXingCount.mu,
      huoCount: wuXingCount.huo,
      tuCount: wuXingCount.tu,
      jinCount: wuXingCount.jin,
      shuiCount: wuXingCount.shui,

      // 五行分析
      wuXingWangShuai: this.getWuXingWangShuai(wuXingCount),
      wuXingQueShi: this.getWuXingQueShi(wuXingCount),
      xiYongShen: this.getXiYongShen(wuXingCount),

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
      geJu: this.settings.showGeJu !== false ? this.getGeJu(dayGan, monthZhi, [yearGan, monthGan, dayGan, hourGan], [yearZhi, monthZhi, dayZhi, hourZhi]) : undefined,

      // 胎元、胎息、命宫、身宫
      taiYuan: getTaiYuan(monthGan, monthZhi),
      taiXi: getTaiXi(dayGan, dayZhi),
      mingGong: getMingGong(monthZhi, hourZhi),
      shenGong: getShenGong(monthZhi, hourZhi),

      // 小运、流月、流日、流时
      xiaoYun: this.settings.showXiaoYun !== false ? calculateXiaoYun(hourGan, hourZhi, this.settings.sex, yearGan, daYunLiuNianData.qiYunSui) : undefined,
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

      // 月将
      yueJiang: getYueJiang(currentJieQi),

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
    result.shenQiangShenRuo = calculateShenQiangShenRuo(
      dayGan,
      yearGan,
      monthGan,
      hourGan,
      yearZhi,
      monthZhi,
      dayZhi,
      hourZhi
    );

    // 判断五不遇时
    const hourGanZhi = hourGan + hourZhi;
    result.wuBuYuShi = WU_BU_YU_SHI[dayGan] === hourGanZhi;

    // 获取节气信息
    result.jieQiInfo = this.getJieQiInfo();

    return result;
  }

  /**
   * 计算五行数量
   */
  private calculateWuXingCount(): { mu: number; huo: number; tu: number; jin: number; shui: number } {
    const count = { mu: 0, huo: 0, tu: 0, jin: 0, shui: 0 };

    const gans = [
      this.eightChar.getYearGan(),
      this.eightChar.getMonthGan(),
      this.eightChar.getDayGan(),
      this.eightChar.getTimeGan()
    ];

    const zhis = [
      this.eightChar.getYearZhi(),
      this.eightChar.getMonthZhi(),
      this.eightChar.getDayZhi(),
      this.eightChar.getTimeZhi()
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
  private getXiYongShen(count: { mu: number; huo: number; tu: number; jin: number; shui: number }): string {
    // 简化算法：缺什么补什么
    const que = this.getWuXingQueShi(count);
    if (que.length > 0) {
      return que.join('、');
    }

    // 如果不缺，找最弱的
    const min = Math.min(count.mu, count.huo, count.tu, count.jin, count.shui);
    const xiYong: string[] = [];

    if (count.mu === min) xiYong.push('木');
    if (count.huo === min) xiYong.push('火');
    if (count.tu === min) xiYong.push('土');
    if (count.jin === min) xiYong.push('金');
    if (count.shui === min) xiYong.push('水');

    return xiYong.join('、');
  }

  /**
   * 获取空亡
   */
  private getKongWang(): string[] {
    // 空亡计算：根据日柱找到所在的旬，该旬缺少的两个地支就是空亡
    const dayGan = this.eightChar.getDayGan();
    const dayZhi = this.eightChar.getDayZhi();

    // 获取日柱在六十甲子中的索引
    const ganIndex = TIAN_GAN.indexOf(dayGan);
    const zhiIndex = DI_ZHI.indexOf(dayZhi);

    if (ganIndex === -1 || zhiIndex === -1) return [];

    // 计算六十甲子索引
    let ganZhiIndex = -1;
    for (let i = 0; i < 60; i++) {
      if (i % 10 === ganIndex && i % 12 === zhiIndex) {
        ganZhiIndex = i;
        break;
      }
    }

    if (ganZhiIndex === -1) return [];

    // 找到所在的旬（每10个为一旬）
    const xunStart = Math.floor(ganZhiIndex / 10) * 10;

    // 该旬最后一个地支的索引
    const lastZhiIndex = (xunStart + 9) % 12;

    // 空亡是该旬之后的两个地支
    const kongWang1 = DI_ZHI[(lastZhiIndex + 1) % 12];
    const kongWang2 = DI_ZHI[(lastZhiIndex + 2) % 12];

    return [kongWang1, kongWang2];
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
    const yearGan = this.eightChar.getYearGan();
    const yearZhi = this.eightChar.getYearZhi();
    const monthGan = this.eightChar.getMonthGan();
    const monthZhi = this.eightChar.getMonthZhi();
    const dayGan = this.eightChar.getDayGan();
    const dayZhi = this.eightChar.getDayZhi();
    const hourGan = this.eightChar.getTimeGan();
    const hourZhi = this.eightChar.getTimeZhi();

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

  private getDaYunLiuNian(dayGan: string, monthGanZhi: string, yearGan: string, currentAge: number): {
    qiYunSui: number;
    daYun: { ganZhi: string; startAge: number; endAge: number; shiShen: string }[];
    liuNian: { year: number; ganZhi: string; age: number; shiShen: string }[];
    currentDaYun?: { ganZhi: string; startAge: number; endAge: number; shiShen: string };
    currentLiuNian?: { year: number; ganZhi: string; age: number; shiShen: string };
  } {
    // 计算起运岁数（简化版，使用固定值）
    // 实际应该根据节气精确计算
    const yangGan = ['甲', '丙', '戊', '庚', '壬'];
    const isYangYear = yangGan.includes(yearGan);
    const isShunXing = (this.settings.sex === 1 && isYangYear) || (this.settings.sex === 0 && !isYangYear);

    // 简化计算：使用固定起运岁数
    const qiYunSui = this.settings.sex === 1 ? 3 : 4;

    // 计算大运
    const daYunLunShu = this.settings.daYunLunShu || 10;
    const daYunList = calculateDaYun(monthGanZhi, qiYunSui, daYunLunShu, isShunXing);

    // 为大运添加十神和神煞
    const daYunWithShiShen = daYunList.map(dy => {
      const result: any = {
        ...dy,
        shiShen: getShiShen(dayGan, dy.ganZhi[0])
      };

      // 如果配置显示大运神煞，则计算
      if (this.settings.showDaYunShenSha !== false) {
        const dayZhi = this.eightChar.getDayZhi();
        const monthZhi = this.eightChar.getMonthZhi();
        const yearZhi = this.eightChar.getYearZhi();
        result.shenSha = this.calculateGanZhiShenSha(dy.ganZhi, dayGan, dayZhi, monthZhi, yearZhi);
      }

      return result;
    });

    // 计算流年
    const birthYear = this.solar.getYear();
    const now = this.getChinaNow();
    const currentYear = now.getFullYear();
    const liuNianList = calculateLiuNian(birthYear, currentYear, 10);

    // 为流年添加十神和神煞
    const liuNianWithShiShen = liuNianList.map(ln => {
      const result: any = {
        ...ln,
        shiShen: getShiShen(dayGan, ln.ganZhi[0])
      };

      // 如果配置显示流年神煞，则计算
      if (this.settings.showLiuNianShenSha !== false) {
        const dayZhi = this.eightChar.getDayZhi();
        const monthZhi = this.eightChar.getMonthZhi();
        const yearZhi = this.eightChar.getYearZhi();
        result.shenSha = this.calculateGanZhiShenSha(ln.ganZhi, dayGan, dayZhi, monthZhi, yearZhi);
      }

      return result;
    });

    // 获取当前大运
    const currentDaYun = getCurrentDaYun(daYunWithShiShen, currentAge);

    // 获取当前流年
    const currentSolar = Solar.fromDate(now);
    const currentLunar = currentSolar.getLunar();
    const currentLiuNianGanZhi = currentLunar.getYearInGanZhi();
    const currentLiuNian = liuNianWithShiShen.find(ln => ln.ganZhi === currentLiuNianGanZhi)
      || getCurrentLiuNian(liuNianWithShiShen, currentYear);

    return {
      qiYunSui,
      daYun: daYunWithShiShen,
      liuNian: liuNianWithShiShen,
      currentDaYun: currentDaYun || undefined,
      currentLiuNian: currentLiuNian || undefined
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
    // 获取中国时区的当前时间
    const now = new Date();
    const chinaTimeStr = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return new Date(chinaTimeStr);
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
