// 基础设置类型
export interface BaseSettings {
  name?: string;
  occupy?: string;
  sex: 0 | 1; // 0:女, 1:男
  date: string; // yyyy-MM-dd HH:mm:ss
  dateType: 0 | 1; // 0:公历, 1:农历
}

// 八字排盘设置
export interface BaZiSettings extends BaseSettings {
  leapMonthType?: 0 | 1; // 0:不使用闰月, 1:使用闰月
  xuShiSuiType?: 0 | 1; // 0:虚岁, 1:实岁
  jieQiType?: 0 | 1; // 0:按天计算, 1:按分钟计算
  qiYunLiuPaiType?: 0 | 1; // 起运流派类型
  renYuanType?: 0 | 1 | 2 | 3 | 4 | 5; // 人元司令分野类型
  daYunLunShu?: number; // 大运轮数 10-16
  yearGanZhiType?: 0 | 1 | 2; // 年干支类型
  monthGanZhiType?: 0 | 1; // 月干支类型
  dayGanZhiType?: 0 | 1; // 日干支类型

  // 真太阳时配置
  useTrueSolarTime?: boolean; // 是否使用真太阳时
  longitude?: number; // 经度
  city?: string; // 城市

  // 显示配置
  showXiaoYun?: boolean; // 是否显示小运
  showLiuYue?: boolean; // 是否显示流月
  showLiuRi?: boolean; // 是否显示流日
  showLiuShi?: boolean; // 是否显示流时
  showJiuXing?: boolean; // 是否显示九星
  showGanZhiLiuYi?: boolean; // 是否显示干支留意
  showShenSha?: boolean; // 是否显示神煞
  showGeJu?: boolean; // 是否显示格局
  showDaYunShenSha?: boolean; // 是否显示大运神煞
  showLiuNianShenSha?: boolean; // 是否显示流年神煞

  // 神煞细粒度配置（60种）
  shenShaConfig?: BaZiShenShaConfig;

  // 干支留意单独开关配置（18种）
  ganZhiLiuYiConfig?: {
    [key: string]: boolean; // key为关系名称，value为是否启用
  };
}

// 八字神煞细粒度配置接口（60种神煞）
export interface BaZiShenShaConfig {
  // 贵人类（10种）
  taiJiGuiRen?: boolean;      // 太极贵人
  tianYiGuiRen?: boolean;     // 天乙贵人
  fuXingGuiRen?: boolean;     // 福星贵人
  wenChangGuiRen?: boolean;   // 文昌贵人
  tianChuGuiRen?: boolean;    // 天厨贵人
  yueDeGuiRen?: boolean;      // 月德贵人
  deXiuGuiRen?: boolean;      // 德秀贵人
  tianDeGuiRen?: boolean;     // 天德贵人
  tianGuanGuiRen?: boolean;   // 天官贵人
  sanQiGuiRen?: boolean;      // 三奇贵人

  // 凶煞类（13种）
  shiEDaBai?: boolean;        // 十恶大败
  yinZhuYangShou?: boolean;   // 阴注阳受
  yinChaYangCuo?: boolean;    // 阴差阳错
  guLuanSha?: boolean;        // 孤鸾煞
  hongYanSha?: boolean;       // 红艳煞
  gouJiaoSha?: boolean;       // 勾绞煞
  chongTianSha?: boolean;     // 冲天煞
  tongZiSha?: boolean;        // 童子煞
  jieSha?: boolean;           // 劫煞
  zaiSha?: boolean;           // 灾煞
  guChen?: boolean;           // 孤辰
  guaXiu?: boolean;           // 寡宿
  yuanChen?: boolean;         // 元辰

  // 吉神类（8种）
  tianDeHe?: boolean;         // 天德合
  yueDeHe?: boolean;          // 月德合
  huaGai?: boolean;           // 华盖
  guoYin?: boolean;           // 国印
  jinYu?: boolean;            // 金舆
  ciGuan?: boolean;           // 词馆
  xueTang?: boolean;          // 学堂
  tianShe?: boolean;          // 天赦

  // 特殊日类（7种）
  siFeiRi?: boolean;          // 四废日
  liuXiuRi?: boolean;         // 六秀日
  shiLingRi?: boolean;        // 十灵日
  kuiGangRi?: boolean;        // 魁罡日
  baZhuanRi?: boolean;        // 八专日
  jiuChouRi?: boolean;        // 九丑日
  tianZhuan?: boolean;        // 天转

  // 刃煞类（5种）
  yangRen?: boolean;          // 羊刃
  feiRen?: boolean;           // 飞刃
  xueRen?: boolean;           // 血刃
  liuXia?: boolean;           // 流霞
  diZhuan?: boolean;          // 地转

  // 禄马类（3种）
  luShen?: boolean;           // 禄神
  yiMa?: boolean;             // 驿马
  gongLu?: boolean;           // 拱禄

  // 空亡类（3种）
  tianLuoDiWang?: boolean;    // 天罗地网
  kongWang?: boolean;         // 空亡
  jieKong?: boolean;          // 截空

  // 星神类（4种）
  jiangXing?: boolean;        // 将星
  taoHua?: boolean;           // 桃花
  tianYi?: boolean;           // 天医
  jinShen?: boolean;          // 金神

  // 丧吊类（5种）
  wangShen?: boolean;         // 亡神
  diaoKe?: boolean;           // 吊客
  piMa?: boolean;             // 披麻
  sangMen?: boolean;          // 丧门
  liuE?: boolean;             // 六厄

  // 喜庆类（2种）
  tianXi?: boolean;           // 天喜
  hongLuan?: boolean;         // 红鸾
}

// 八字排盘结果
export interface BaZiResult {
  // 基础信息
  solar: string;
  lunar: string;
  name?: string;
  occupy?: string;
  sex: string;
  age: number;          // 当前口径年龄
  ageLabel?: '实岁' | '虚岁';
  xuSui?: number;       // 虚岁
  shiSui?: number;      // 实岁
  shengXiao: string;
  xingZuo: string;
  xingQi: string;
  jiJie: string;

  // 八字
  baZi: string[];
  baZiWuXing: string[];
  baZiNaYin: string[];
  baZiKongWang: string[];

  // 干支
  yearGan: string;
  monthGan: string;
  dayGan: string;
  hourGan: string;
  yearZhi: string;
  monthZhi: string;
  dayZhi: string;
  hourZhi: string;
  yearGanZhi?: string;
  monthGanZhi?: string;
  dayGanZhi?: string;
  hourGanZhi?: string;

  // 五行统计
  muCount: number;
  huoCount: number;
  tuCount: number;
  jinCount: number;
  shuiCount: number;

  // 其他
  wuXingWangShuai?: string;
  wuXingQueShi?: string[];
  xiYongShen?: string;

  // 神煞
  shenSha?: string[][];

  // 十神系统
  shiShen?: {
    year: string;      // 年柱天干十神
    month: string;     // 月柱天干十神
    day: string;       // 日柱天干十神（日主，通常标记为"日主"或"我"）
    hour: string;      // 时柱天干十神
  };
  shiShenZhi?: {
    year: string[];    // 年支藏干十神
    month: string[];   // 月支藏干十神
    day: string[];     // 日支藏干十神
    hour: string[];    // 时支藏干十神
  };
  shiShenAnalysis?: string;  // 十神格局分析

  // 大运流年系统
  qiYunSui?: number;         // 起运岁数
  qiYunDate?: string;        // 起运日期
  daYun?: {
    ganZhi: string;          // 大运干支
    startAge: number;        // 起始年龄
    endAge: number;          // 结束年龄
    shiShen: string;         // 大运十神
    shenSha?: string[];      // 大运神煞
  }[];
  liuNian?: {
    year: number;            // 年份
    ganZhi: string;          // 流年干支
    age: number;             // 虚岁
    shiShen: string;         // 流年十神
    shenSha?: string[];      // 流年神煞
  }[];
  currentDaYun?: {           // 当前大运
    ganZhi: string;
    startAge: number;
    endAge: number;
    shiShen: string;
    shenSha?: string[];      // 当前大运神煞
  };
  currentLiuNian?: {         // 当前流年
    year: number;
    ganZhi: string;
    age: number;
    shiShen: string;
    shenSha?: string[];      // 当前流年神煞
  };

  // 地支藏干系统
  diZhiCangGan?: {
    year: { gan: string[]; shiShen: string[] };    // 年支藏干及十神
    month: { gan: string[]; shiShen: string[] };   // 月支藏干及十神
    day: { gan: string[]; shiShen: string[] };     // 日支藏干及十神
    hour: { gan: string[]; shiShen: string[] };    // 时支藏干及十神
  };

  // 五行生克关系
  wuXingShengKe?: {
    tianGanWuHe?: Array<{                          // 天干五合
      gan1: string;
      gan2: string;
      position1: string;
      position2: string;
      heHua: string;
    }>;
    diZhiSanHe?: Array<{                           // 地支三合
      zhis: string[];
      positions: string[];
      wuXing: string;
      isComplete: boolean;
    }>;
    diZhiSanHui?: Array<{                          // 地支三会
      zhis: string[];
      positions: string[];
      wuXing: string;
      isComplete: boolean;
    }>;
    diZhiLiuHe?: Array<{                           // 地支六合
      zhi1: string;
      zhi2: string;
      position1: string;
      position2: string;
      heHua: string;
    }>;
    diZhiXiangChong?: Array<{                      // 地支相冲
      zhi1: string;
      zhi2: string;
      position1: string;
      position2: string;
    }>;
    diZhiXiangXing?: Array<{                       // 地支相刑
      zhis: string[];
      positions: string[];
      xingType: string;
    }>;
    diZhiXiangHai?: Array<{                        // 地支相害
      zhi1: string;
      zhi2: string;
      position1: string;
      position2: string;
    }>;
    diZhiXiangPo?: Array<{                         // 地支相破
      zhi1: string;
      zhi2: string;
      position1: string;
      position2: string;
    }>;
  };

  // 格局判断系统
  geJu?: {
    geJuType: string;           // 格局类型
    geJuName: string;           // 格局名称
    geJuMeaning: string;        // 格局含义
    geJuChengBai: string;       // 格局成败
    yongShen: string;           // 用神
    xiShen: string;             // 喜神
    jiShen: string;             // 忌神
    chouShen: string;           // 仇神
  };

  // 胎元、胎息、命宫、身宫
  taiYuan?: string;             // 胎元
  taiXi?: string;               // 胎息
  mingGong?: string;            // 命宫
  shenGong?: string;            // 身宫

  // 小运、流月、流日、流时
  xiaoYun?: {
    ganZhi: string;
    age: number;
  }[];
  liuYue?: {
    month: number;
    ganZhi: string;
    monthName: string;
    isCurrent?: boolean;
  }[];
  liuRi?: {
    day: number;
    ganZhi: string;
    isCurrent?: boolean;
  }[];
  liuShi?: {
    hour: number;
    ganZhi: string;
    hourName: string;
    isCurrent?: boolean;
  }[];

  // 干支留意系统
  ganZhiLiuYi?: {
    tianGanSheng: Array<{ gan1: string; gan2: string; position1: string; position2: string; relation: string }>;
    tianGanKe: Array<{ gan1: string; gan2: string; position1: string; position2: string; relation: string }>;
    tianGanChong: Array<{ gan1: string; gan2: string; position1: string; position2: string }>;
    diZhiBanHe: Array<{ zhi1: string; zhi2: string; position1: string; position2: string; wuXing: string }>;
    diZhiGongHe: Array<{ zhi1: string; zhi2: string; position1: string; position2: string; wuXing: string; missing: string }>;
    diZhiAnHe: Array<{ zhi1: string; zhi2: string; position1: string; position2: string; relation: string }>;
  };

  // 九星系统（5种体系）
  jiuXing?: {
    year: {
      wuXing: string;              // 五行（木、火、土、金、水）
      position: string;            // 方位（震、离、坤、兑、乾、坎、艮、巽、中）
      positionDesc: string;        // 方位描述（正东、正南等）
      xuanKong: string;            // 玄空九星（一白、二黑、三碧等）
      beiDou: string;              // 北斗九星（贪狼、巨门、禄存等）
      qiMen: string;               // 奇门九星（天蓬、天芮、天冲等）
      taiYi: string;               // 太乙九星（太乙、摄提、轩辕等）
      qiMenLuck: string;           // 奇门吉凶
      xuanKongLuck: string;        // 玄空吉凶
    };
    month: {
      wuXing: string;
      position: string;
      positionDesc: string;
      xuanKong: string;
      beiDou: string;
      qiMen: string;
      taiYi: string;
      qiMenLuck: string;
      xuanKongLuck: string;
    };
    day: {
      wuXing: string;
      position: string;
      positionDesc: string;
      xuanKong: string;
      beiDou: string;
      qiMen: string;
      taiYi: string;
      qiMenLuck: string;
      xuanKongLuck: string;
    };
    hour: {
      wuXing: string;
      position: string;
      positionDesc: string;
      xuanKong: string;
      beiDou: string;
      qiMen: string;
      taiYi: string;
      qiMenLuck: string;
      xuanKongLuck: string;
    };
  };

  // 详细分析
  detailedAnalysis?: {
    xingGeAnalysis: string;      // 性格分析
    caiYunAnalysis: string;       // 财运分析
    shiYeAnalysis: string;        // 事业分析
    ganQingAnalysis: string;      // 感情分析
    jiankangAnalysis: string;     // 健康分析
  };

  // 骨重（称骨算命）
  guZhong?: {
    guZhong: number;              // 骨重数值
    guZhongText: string;          // 骨重文字（如"四两二钱"）
    piZhu: string;                // 命理批注
  };

  // 身强身弱判断
  shenQiangShenRuo?: {
    result: '身强' | '身弱' | '中和';  // 判断结果
    score: number;                      // 综合评分
    details: {                          // 详细分数
      yearGan: { relation: '身强' | '身弱'; score: number };
      monthGan: { relation: '身强' | '身弱'; score: number };
      hourGan: { relation: '身强' | '身弱'; score: number };
      yearZhi: { relation: '身强' | '身弱'; score: number };
      monthZhi: { relation: '身强' | '身弱'; score: number };
      dayZhi: { relation: '身强' | '身弱'; score: number };
      hourZhi: { relation: '身强' | '身弱'; score: number };
    };
    analysis: string;                   // 分析文本
  };

  // 五不遇时
  wuBuYuShi?: boolean;                  // 是否为五不遇时

  // 节气信息
  jieQiInfo?: {
    current: string;                    // 当前节气
    prev: string;                       // 上一个节气
    next: string;                       // 下一个节气
    currentTime?: string;               // 当前节气时间
    nextTime?: string;                  // 下一个节气时间
    daysToNext?: number;                // 距离下一个节气的天数
  };

  // 重冲生肖
  chongShengXiao?: {
    year: string;      // 年柱冲生肖
    month: string;    // 月柱冲生肖
    day: string;      // 日柱冲生肖
    hour: string;     // 时柱冲生肖
  };

  // 九星吉凶
  jiuXingLuck?: {
    year: {
      qiMenLuck: string;        // 奇门吉凶
      xuanKongLuck: string;     // 玄空吉凶
    };
    month: {
      qiMenLuck: string;
      xuanKongLuck: string;
    };
    day: {
      qiMenLuck: string;
      xuanKongLuck: string;
    };
    hour: {
      qiMenLuck: string;
      xuanKongLuck: string;
    };
  };

  // 财富运势
  caiYun?: {
    zhengCai: {
      ganZhi: string;
      year: number;
      age: number;
    }[];
    pianCai: {
      ganZhi: string;
      year: number;
      age: number;
    }[];
  };

  // 桃花运
  taoHuaYun?: {
    zhengTaoHua: {
      ganZhi: string;
      year: number;
      age: number;
    }[];
    pianTaoHua: {
      ganZhi: string;
      year: number;
      age: number;
    }[];
  };

  // 月象
  yueXiang?: string;

  // 月将
  yueJiang?: {
    yueJiang: string;       // 月将
    yueJiangShen: string;  // 月将神
  };

  // 彭祖百忌
  pengZuBaiJi?: {
    gan: string;   // 干百忌
    zhi: string;   // 支百忌
  };

  // 命卦
  mingGua?: string;

  // 日主论命
  riZhuLunMing?: string;

  // 人元司令分野
  renYuanSiLingFenYe?: string;
}

// 六爻排盘设置
export interface LiuYaoSettings extends BaseSettings {
  leapMonthType?: 0 | 1;
  xuShiSuiType?: 0 | 1;
  jieQiType?: 0 | 1;
  yearGanZhiType?: 0 | 1 | 2;
  monthGanZhiType?: 0 | 1;
  dayGanZhiType?: 0 | 1;
  paiPanType?: 0 | 1 | 2; // 排盘类型：0=日期起卦, 1=自动起卦(随机), 2=手动起卦
  yaoShu?: number[]; // 爻数，6个数字（自动起卦时使用，6/7/8/9）
  manualYaoShu?: number[]; // 手动爻数，6个数字（手动起卦时使用，0/1/2/3）

  // 神煞细粒度配置（23种）
  shenShaConfig?: LiuYaoShenShaConfig;
}

// 六爻神煞细粒度配置接口（23种神煞）
export interface LiuYaoShenShaConfig {
  // 贵人类（7种）
  taiJiGuiRen?: boolean;      // 太极贵人
  tianYiGuiRen?: boolean;     // 天乙贵人
  fuXingGuiRen?: boolean;     // 福星贵人
  wenChangGuiRen?: boolean;   // 文昌贵人
  tianChuGuiRen?: boolean;    // 天厨贵人
  yueDeGuiRen?: boolean;      // 月德贵人
  tianDeGuiRen?: boolean;     // 天德贵人

  // 吉神类（4种）
  tangFuGuoYin?: boolean;     // 唐符国印
  tianYuanLu?: boolean;       // 天元禄
  huaGai?: boolean;           // 华盖
  tianYi?: boolean;           // 天医

  // 马星类（3种）
  yiMa?: boolean;             // 驿马
  tianMa?: boolean;           // 天马
  luMa?: boolean;             // 禄马

  // 凶煞类（5种）
  jieSha?: boolean;           // 劫煞
  xianChi?: boolean;          // 咸池
  zaiSha?: boolean;           // 灾煞
  mouXing?: boolean;          // 谋星
  huangEn?: boolean;          // 皇恩

  // 星神类（2种）
  jiangXing?: boolean;        // 将星
  tianXi?: boolean;           // 天喜

  // 刃煞类（2种）
  yangRen?: boolean;          // 阳刃
  feiRen?: boolean;           // 飞刃

  // 吉神类（1种）
  tianRen?: boolean;          // 天人
}

// 六爻排盘结果
export interface LiuYaoResult {
  solar: string;
  lunar: string;
  name?: string;
  occupy?: string;
  sex?: string;
  age?: number;
  ageLabel?: '周岁' | '虚岁';
  xuSui?: number;
  shiSui?: number;
  zao?: string;
  xingQi?: string;
  jiJie?: string;
  shengXiao?: string;
  xingZuo?: string;
  yueXiang?: string;
  yueJiang?: string;
  yueJiangShen?: string;
  wuBuYuShi?: boolean;

  // 卦象基本信息
  shangGua: string;      // 上卦（如：乾☰）
  xiaGua: string;        // 下卦（如：乾☰）
  benGua: string;        // 本卦（如：乾为天）
  benGuaAs: string;      // 本卦卦象（如：䷀）
  bianGua: string;       // 变卦
  bianGuaAs: string;     // 变卦卦象
  huGua: string;         // 互卦
  huGuaAs: string;       // 互卦卦象
  cuoGua: string;        // 错卦
  cuoGuaAs: string;      // 错卦卦象
  zongGua: string;       // 综卦
  zongGuaAs: string;     // 综卦卦象
  fuGua: string;         // 伏卦
  fuGuaAs: string;       // 伏卦卦象

  // 卦类型和卦身
  benGuaType: string;    // 本卦类型（八纯、一世、二世等）
  benGuaShen: string;    // 本卦卦身（地支）
  bianGuaType: string;   // 变卦类型
  bianGuaShen: string;   // 变卦卦身

  // 卦辞
  benGuaCi: string;      // 本卦卦辞
  bianGuaCi: string;     // 变卦卦辞
  huGuaCi: string;       // 互卦卦辞
  cuoGuaCi: string;      // 错卦卦辞
  zongGuaCi: string;     // 综卦卦辞
  fuGuaCi: string;       // 伏卦卦辞

  // 六爻详细信息（数组顺序：初爻、二爻、三爻、四爻、五爻、上爻）
  liuYao: {
    benGua: {
      yaoMing: string[];      // 爻名（如：初九、九二等）
      yaoAs: string[];        // 爻象（如：—、--）
      yaoAsMark: string[];    // 爻象标识（如：○、×）
      yaoAsMarkName: string[]; // 爻象标识名称（如：老阳、老阴等）
      shiYing: string[];      // 世应（如：世、应、空字符串）
      liuQin: string[];       // 六亲（如：子孙、妻财等）
      ganZhi: string[];       // 干支（如：甲子、甲寅等）
      wuXing: string[];       // 五行（如：水、木等）
      naYin: string[];        // 纳音（如：海中金等）
      liuShen: string[];      // 六神（如：青龙、朱雀等）
      yaoCi: string[];        // 爻辞
      fuShen: string[];       // 伏神标记（如：伏、空字符串）
    };
    bianGua: {
      yaoMing: string[];
      yaoAs: string[];
      shiYing: string[];
      liuQin: string[];
      ganZhi: string[];
      wuXing: string[];
      naYin: string[];
      liuShen: string[];
      yaoCi: string[];
    };
  };

  // 六亲缺失情况
  liuQinQueShi: string[] | null;  // 缺失的六亲（如：["妻财"]，null表示无缺失）

  // 四柱干支信息
  ganZhi: {
    year: string;    // 年干支
    month: string;   // 月干支
    day: string;     // 日干支
    hour: string;    // 时干支
  };
  yearGan?: string;
  monthGan?: string;
  dayGan?: string;
  hourGan?: string;
  yearZhi?: string;
  monthZhi?: string;
  dayZhi?: string;
  hourZhi?: string;
  yearGanZhi?: string;
  monthGanZhi?: string;
  dayGanZhi?: string;
  hourGanZhi?: string;
  yearGanWuXing?: string;
  monthGanWuXing?: string;
  dayGanWuXing?: string;
  hourGanWuXing?: string;
  yearZhiWuXing?: string;
  monthZhiWuXing?: string;
  dayZhiWuXing?: string;
  hourZhiWuXing?: string;
  yearGanZhiWuXing?: string;
  monthGanZhiWuXing?: string;
  dayGanZhiWuXing?: string;
  hourGanZhiWuXing?: string;
  yearGanZhiNaYin?: string;
  monthGanZhiNaYin?: string;
  dayGanZhiNaYin?: string;
  hourGanZhiNaYin?: string;
  yearGanZhiKongWang?: string;
  monthGanZhiKongWang?: string;
  dayGanZhiKongWang?: string;
  hourGanZhiKongWang?: string;

  // 节气信息
  jieQi?: {
    prevJie: string;      // 上一节
    nextJie: string;      // 下一节
    prevQi: string;       // 上一气
    nextQi: string;       // 下一气
    prevJieDate?: string;
    prevJieDay?: number;
    nextJieDate?: string;
    nextJieDay?: number;
    prevQiDate?: string;
    prevQiDay?: number;
    nextQiDate?: string;
    nextQiDay?: number;
    chuShengJie?: string;
    chuShengQi?: string;
  };

  // 辅助信息
  kongWang?: string[];    // 空亡地支（两个）

  // 神煞系统
  shenSha?: {
    year: string[];       // 年柱神煞
    month: string[];      // 月柱神煞
    day: string[];        // 日柱神煞
    hour: string[];       // 时柱神煞
  };
}

// 大六壬排盘设置
// 大六壬排盘设置
export interface DaLiuRenSettings extends BaseSettings {
  leapMonthType?: 0 | 1; // 0:不使用闰月 1:使用闰月
  xuShiSuiType?: 0 | 1; // 0:虚岁 1:实岁
  jieQiType?: 0 | 1; // 0:按天计算 1:按分钟计算
  guiRenType?: 0 | 1 | 2; // 贵人类型：0=自动切换昼夜, 1=昼贵, 2=夜贵
  yearGanZhiType?: 0 | 1 | 2; // 年干支类型
  monthGanZhiType?: 0 | 1; // 月干支类型
  dayGanZhiType?: 0 | 1; // 日干支类型
}

// 大六壬排盘结果
export interface DaLiuRenResult {
  solar: string;
  lunar: string;
  name?: string;
  occupy?: string;
  sex?: string;
  age?: number;
  zao?: string;
  xingQi?: string;
  jiJie?: string;
  shengXiao?: string;
  xingZuo?: string;
  wuBuYuShi?: boolean;

  yearGan?: string;
  monthGan?: string;
  dayGan?: string;
  hourGan?: string;
  yearZhi?: string;
  monthZhi?: string;
  dayZhi?: string;
  hourZhi?: string;
  yearGanZhi?: string;
  monthGanZhi?: string;
  dayGanZhi?: string;
  hourGanZhi?: string;

  yearGanWuXing?: string;
  monthGanWuXing?: string;
  dayGanWuXing?: string;
  hourGanWuXing?: string;
  yearZhiWuXing?: string;
  monthZhiWuXing?: string;
  dayZhiWuXing?: string;
  hourZhiWuXing?: string;
  yearGanZhiWuXing?: string;
  monthGanZhiWuXing?: string;
  dayGanZhiWuXing?: string;
  hourGanZhiWuXing?: string;
  yearGanZhiNaYin?: string;
  monthGanZhiNaYin?: string;
  dayGanZhiNaYin?: string;
  hourGanZhiNaYin?: string;
  yearGanZhiKongWang?: string;
  monthGanZhiKongWang?: string;
  dayGanZhiKongWang?: string;
  hourGanZhiKongWang?: string;
  wuXingWangShuai?: string[];

  prevJie?: string;
  prevJieDate?: string;
  prevJieDay?: number;
  nextJie?: string;
  nextJieDate?: string;
  nextJieDay?: number;
  chuShengJie?: string;
  prevQi?: string;
  prevQiDate?: string;
  prevQiDay?: number;
  nextQi?: string;
  nextQiDate?: string;
  nextQiDay?: number;
  chuShengQi?: string;
  yueXiang?: string;
  yueJiang?: string;
  yueJiangShen?: string;

  // 盘式
  diPan: string[];        // 地盘（12个地支）
  tianPan: string[];      // 天盘（12个地支）
  shenPan: string[];      // 神盘（12个神将）
  tianGan?: string[];

  // 四课三传
  siKe: string[][];       // 四课（每课2个元素：[上神, 下神]）
  siKeDunGan?: string[][];
  siKeShenJiang?: string[][];
  sanChuan: string[];     // 三传（3个地支）
  sanChuanQuFa?: string;
  sanChuanDunGan?: string[];
  sanChuanShenJiang?: string[];
  sanChuanLiuQin?: string[];

  // 类型
  tianDiPanType: string;  // 天地盘类型（如：伏吟盘、返吟盘等）
}

// 奇门遁甲排盘设置
export interface QiMenSettings extends BaseSettings {
  panType?: 'zhuan' | 'fei'; // 盘类型（当前仅完成转盘重构，传 fei 会报错）

  // 虚实岁类型（0:虚岁, 1:实岁）
  xuShiSuiType?: 0 | 1;

  // 排盘类型（0:年家奇门, 1:月家奇门, 2:日家奇门, 3:时家奇门）
  paiPanType?: 0 | 1 | 2 | 3;

  // 值使类型（0:天禽星为值符时一律用死门, 1:根据阴阳遁判断, 2:根据节气判断）
  zhiShiType?: 0 | 1 | 2;

  // 月家奇门起局类型（0:使用年支起局, 1:使用年干支的符头地支起局）
  yueJiaQiJuType?: 0 | 1;

  // 节气类型（0:按天计算, 1:按分钟计算）
  jieQiType?: 0 | 1;

  // 年干支类型（0:以正月初一为新年, 1:以立春当天为新年, 2:以立春交接时刻为新年）
  yearGanZhiType?: 0 | 1 | 2;

  // 月干支类型（0:以节交接当天起算, 1:以节交接时刻起算）
  monthGanZhiType?: 0 | 1;

  // 日干支类型（0:晚子时日柱按当天, 1:晚子时日柱按明天）
  dayGanZhiType?: 0 | 1;

  // 闰月类型（0:不使用闰月, 1:使用闰月）
  leapMonthType?: 0 | 1;
}

// 奇门遁甲排盘结果
export interface QiMenResult {
  solar: string;
  lunar: string;
  name?: string;
  occupy?: string;
  sex?: string;
  age?: number;
  zao?: string;
  xingQi?: string;
  jiJie?: string;
  shengXiao?: string;
  xingZuo?: string;
  yueXiang?: string;
  yueJiang?: string;
  yueJiangShen?: string;
  wuBuYuShi?: boolean;

  // 四柱干支
  yearGan?: string;
  monthGan?: string;
  dayGan?: string;
  hourGan?: string;
  yearZhi?: string;
  monthZhi?: string;
  dayZhi?: string;
  hourZhi?: string;
  yearGanZhi?: string;
  monthGanZhi?: string;
  dayGanZhi?: string;
  hourGanZhi?: string;
  yearGanWuXing?: string;
  monthGanWuXing?: string;
  dayGanWuXing?: string;
  hourGanWuXing?: string;
  yearZhiWuXing?: string;
  monthZhiWuXing?: string;
  dayZhiWuXing?: string;
  hourZhiWuXing?: string;
  yearGanZhiWuXing?: string;
  monthGanZhiWuXing?: string;
  dayGanZhiWuXing?: string;
  hourGanZhiWuXing?: string;
  yearGanZhiNaYin?: string;
  monthGanZhiNaYin?: string;
  dayGanZhiNaYin?: string;
  hourGanZhiNaYin?: string;
  yearGanZhiKongWang?: string;
  monthGanZhiKongWang?: string;
  dayGanZhiKongWang?: string;
  hourGanZhiKongWang?: string;

  // 节气信息
  prevJie?: string;
  prevJieDate?: string;
  prevJieDay?: number;
  nextJie?: string;
  nextJieDate?: string;
  nextJieDay?: number;
  chuShengJie?: string;
  prevQi?: string;
  prevQiDate?: string;
  prevQiDay?: number;
  nextQi?: string;
  nextQiDate?: string;
  nextQiDay?: number;
  chuShengQi?: string;

  // 基础信息
  fuTou: string;           // 符头
  jieQi: string;           // 节气
  sanYuan?: string;        // 三元（上元、中元、下元）
  yinYangDun: string;      // 阴阳遁
  juShu: string;           // 局数（如：阳遁1局）
  xunShou: string;         // 旬首
  xunShouYiZhang?: string; // 旬首仪仗
  zhiFu: string;           // 值符
  zhiShi: string;          // 值使
  tianYi?: string;         // 天乙
  diYi?: string;           // 地乙
  taiYi?: string;          // 太乙
  liuJiaXunKong?: string[];
  liuJiaXunKongGongWei?: number[];
  yiMa?: string;
  yiMaGongWei?: number;

  // 值符值使宫位
  oldZhiFuGongWei?: number;   // 值符旋转前宫位
  newZhiFuGongWei?: number;   // 值符旋转后宫位
  oldZhiShiGongWei?: number;  // 值使旋转前宫位
  newZhiShiGongWei?: number;  // 值使旋转后宫位

  // 九宫（1-9宫，索引0-8）
  diPan: string[];         // 地盘（奇仪）
  tianPan: string[];       // 天盘（九星）
  renPan: string[];        // 人盘（八门）
  shenPan: string[];       // 神盘（八神）

  // 地盘六甲
  diLiuJia?: string[];     // 地盘六甲（1-9宫）

  // 天盘携带的奇仪
  tianPanQiYiTianQinYes?: string[];  // 天禽星携带的奇仪
  tianPanQiYiTianQinNo?: string[];   // 其他九星携带的奇仪
  liuYiJiXing?: string[];            // 六仪击刑

  // 特殊标记
  jiXing?: string[];       // 吉星标记
  xiongXing?: string[];    // 凶星标记
  qiYiRuMu?: string[];     // 奇仪入墓标记

  // 动应克应系统
  dongYing?: {
    type: string;          // 动应类型
    gongWei: number;       // 宫位
    description: string;   // 描述
  }[];
  keYing?: {
    type: string;          // 克应类型
    gongWei: number;       // 宫位
    description: string;   // 描述
  }[];
}

// 梅花易数排盘设置
export interface MeiHuaSettings extends BaseSettings {
  leapMonthType?: 0 | 1;
  xuShiSuiType?: 0 | 1;
  jieQiType?: 0 | 1;
  yearGanZhiType?: 0 | 1 | 2;
  monthGanZhiType?: 0 | 1;
  dayGanZhiType?: 0 | 1;
  guaMa?: number; // 卦码
  paiPanType?: 0 | 1 | 2 | 3 | 4; // 排盘类型：0=时间起卦, 1=随机起卦, 2=数字起卦, 3=单数起卦, 4=双数起卦
  shu?: number; // 数字起卦的数字（三位数）
  danShu?: number; // 单数起卦的数字（任意位数）
  shuangShuOne?: number; // 双数起卦的第一个数字
  shuangShuTwo?: number; // 双数起卦的第二个数字
  shangXiaGuaType?: 0 | 1; // 上下卦类型：0=求和, 1=直接使用
  dongYaoType?: 0 | 1; // 动爻类型：0=不加时辰, 1=加时辰
}

// 梅花易数排盘结果
export interface MeiHuaResult {
  sex?: string;
  age?: number;
  zao?: string;
  xingQi?: string;
  jiJie?: string;
  solar: string;
  lunar: string;
  name?: string;
  occupy?: string;

  // 卦象
  guaMa: number;
  shangGua: string;
  xiaGua: string;
  dongYao: number;
  benGua: string;
  bianGua: string;
  huGua: string;
  cuoGua: string;
  zongGua: string;

  // 体用关系
  tiGua: string;           // 体卦名称
  yongGua: string;         // 用卦名称
  tiGuaWuXing: string;     // 体卦五行
  yongGuaWuXing: string;   // 用卦五行
  tiYongGuanXi: string;    // 体用生克关系

  // 卦象五行和方位
  benGuaWuXing?: string;   // 本卦五行
  benGuaFangWei?: string;  // 本卦方位

  // ========== 高优先级字段 ==========

  // 1. 干支系统
  yearGan?: string;        // 年天干
  monthGan?: string;       // 月天干
  dayGan?: string;         // 日天干
  hourGan?: string;        // 时天干
  yearZhi?: string;        // 年地支
  monthZhi?: string;       // 月地支
  dayZhi?: string;         // 日地支
  hourZhi?: string;        // 时地支
  yearGanZhi?: string;     // 年干支
  monthGanZhi?: string;    // 月干支
  dayGanZhi?: string;      // 日干支
  hourGanZhi?: string;     // 时干支

  // 干支五行
  yearGanWuXing?: string;  // 年天干五行
  monthGanWuXing?: string; // 月天干五行
  dayGanWuXing?: string;   // 日天干五行
  hourGanWuXing?: string;  // 时天干五行
  yearZhiWuXing?: string;  // 年地支五行
  monthZhiWuXing?: string; // 月地支五行
  dayZhiWuXing?: string;   // 日地支五行
  hourZhiWuXing?: string;  // 时地支五行

  // 干支纳音
  yearNaYin?: string;      // 年柱纳音
  monthNaYin?: string;     // 月柱纳音
  dayNaYin?: string;       // 日柱纳音
  hourNaYin?: string;      // 时柱纳音

  // 干支空亡
  yearKongWang?: string;   // 年柱空亡
  monthKongWang?: string;  // 月柱空亡
  dayKongWang?: string;    // 日柱空亡
  hourKongWang?: string;   // 时柱空亡

  // 2. 节气信息
  prevJie?: string;        // 上一节名称
  prevJieDate?: string;    // 上一节日期
  prevJieDay?: number;     // 距上一节天数
  nextJie?: string;        // 下一节名称
  nextJieDate?: string;    // 下一节日期
  nextJieDay?: number;     // 距下一节天数
  prevQi?: string;         // 上一气名称
  prevQiDate?: string;     // 上一气日期
  prevQiDay?: number;      // 距上一气天数
  nextQi?: string;         // 下一气名称
  nextQiDate?: string;     // 下一气日期
  nextQiDay?: number;      // 距下一气天数
  chuShengJie?: string;    // 出生节描述
  chuShengQi?: string;     // 出生气描述

  // 3. 卦辞
  benGuaGuaCi?: string;    // 本卦卦辞
  bianGuaGuaCi?: string;   // 变卦卦辞
  huGuaGuaCi?: string;     // 互卦卦辞
  cuoGuaGuaCi?: string;    // 错卦卦辞
  zongGuaGuaCi?: string;   // 综卦卦辞

  // 4. 六爻详细信息
  benGuaLiuYao?: {
    yaoMing: string[];     // 爻名（初九、九二等）
    yaoXiang: string[];    // 爻象（阴爻、阳爻）
    yaoCi: string[];       // 爻辞
  };
  bianGuaLiuYao?: {
    yaoMing: string[];
    yaoXiang: string[];
    yaoCi: string[];
  };
  huGuaLiuYao?: {
    yaoMing: string[];
    yaoXiang: string[];
    yaoCi: string[];
  };
  cuoGuaLiuYao?: {
    yaoMing: string[];
    yaoXiang: string[];
    yaoCi: string[];
  };
  zongGuaLiuYao?: {
    yaoMing: string[];
    yaoXiang: string[];
    yaoCi: string[];
  };

  // ========== 中优先级字段 ==========

  // 5. 卦象分解
  benGuaShangGuaName?: string;   // 本卦上卦名称
  benGuaXiaGuaName?: string;     // 本卦下卦名称
  benGuaShangGuaAs?: string;     // 本卦上卦卦象符号
  benGuaXiaGuaAs?: string;       // 本卦下卦卦象符号

  bianGuaShangGuaName?: string;  // 变卦上卦名称
  bianGuaXiaGuaName?: string;    // 变卦下卦名称
  bianGuaShangGuaAs?: string;    // 变卦上卦卦象符号
  bianGuaXiaGuaAs?: string;      // 变卦下卦卦象符号

  huGuaShangGuaName?: string;    // 互卦上卦名称
  huGuaXiaGuaName?: string;      // 互卦下卦名称
  huGuaShangGuaAs?: string;      // 互卦上卦卦象符号
  huGuaXiaGuaAs?: string;        // 互卦下卦卦象符号

  cuoGuaShangGuaName?: string;   // 错卦上卦名称
  cuoGuaXiaGuaName?: string;     // 错卦下卦名称
  cuoGuaShangGuaAs?: string;     // 错卦上卦卦象符号
  cuoGuaXiaGuaAs?: string;       // 错卦下卦卦象符号

  zongGuaShangGuaName?: string;  // 综卦上卦名称
  zongGuaXiaGuaName?: string;    // 综卦下卦名称
  zongGuaShangGuaAs?: string;    // 综卦上卦卦象符号
  zongGuaXiaGuaAs?: string;      // 综卦下卦卦象符号

  // 6. 辅助信息
  shengXiao?: string;      // 生肖
  xingZuo?: string;        // 星座
  yueXiang?: string;       // 月相（朔、上弦、望、下弦等）
  yueJiang?: string;       // 月将（地支）
  yueJiangShen?: string;   // 月将神（神后、大吉等）
  wuBuYuShi?: boolean;     // 是否为五不遇时
}

// 紫微斗数排盘设置
export interface ZiWeiSettings extends BaseSettings {
  birthHour?: number; // 兼容旧版单独时辰输入
  leapMonthType?: 0 | 1; // 0:不使用闰月, 1:使用闰月
  xuShiSuiType?: 0 | 1; // 0:虚岁, 1:实岁
  jieQiType?: 0 | 1; // 0:按天计算, 1:按分钟计算
  wuXingJuType?: 0 | 1; // 0:按年干+命宫地支, 1:按命宫天干+命宫地支
  yearGanZhiType?: 0 | 1 | 2; // 年干支类型
  monthGanZhiType?: 0 | 1; // 月干支类型
  dayGanZhiType?: 0 | 1; // 日干支类型
}

export interface ZiWeiGongWei {
  name: string;
  tianGan?: string;
  diZhi?: string;
  isMingGong?: boolean;
  isShenGong?: boolean;
  zhuXing: string[];
  zhuXingGuanXi?: string[];
  auxStars?: string[];
  minorStars?: string[];
  siHua?: string[];
  siHuaGuanXi?: string[];
  allStars?: string[];
  allStarMarks?: string[];
  allStarRelations?: string[];
  zhangSheng?: string;
  boShi?: string;
  liuNianSuiQian?: string;
  liuNianJiangQian?: string;
}

// 紫微斗数排盘结果
export interface ZiWeiResult {
  solar: string;
  lunar: string;
  name?: string;
  occupy?: string;
  sex: string;
  age?: number;
  zao?: string;
  xingQi?: string;
  jiJie?: string;
  shengXiao?: string;
  xingZuo?: string;
  yueXiang?: string;
  yueJiang?: string;
  yueJiangShen?: string;
  wuBuYuShi?: boolean;

  yearGan?: string;
  monthGan?: string;
  dayGan?: string;
  hourGan?: string;
  yearZhi?: string;
  monthZhi?: string;
  dayZhi?: string;
  hourZhi?: string;
  yearGanZhi?: string;
  monthGanZhi?: string;
  dayGanZhi?: string;
  hourGanZhi?: string;
  yearGanWuXing?: string;
  monthGanWuXing?: string;
  dayGanWuXing?: string;
  hourGanWuXing?: string;
  yearZhiWuXing?: string;
  monthZhiWuXing?: string;
  dayZhiWuXing?: string;
  hourZhiWuXing?: string;
  yearGanZhiWuXing?: string;
  monthGanZhiWuXing?: string;
  dayGanZhiWuXing?: string;
  hourGanZhiWuXing?: string;
  yearGanZhiNaYin?: string;
  monthGanZhiNaYin?: string;
  dayGanZhiNaYin?: string;
  hourGanZhiNaYin?: string;
  yearGanZhiKongWang?: string;
  monthGanZhiKongWang?: string;
  dayGanZhiKongWang?: string;
  hourGanZhiKongWang?: string;
  prevJie?: string;
  prevJieDate?: string;
  prevJieDay?: number;
  nextJie?: string;
  nextJieDate?: string;
  nextJieDay?: number;
  chuShengJie?: string;
  prevQi?: string;
  prevQiDate?: string;
  prevQiDay?: number;
  nextQi?: string;
  nextQiDate?: string;
  nextQiDay?: number;
  chuShengQi?: string;

  // 命盘信息
  wuXingJu: string;
  mingGong: string;
  shenGong: string;
  mingGongGongWei?: number;
  shenGongGongWei?: number;
  ziWeiXingGongWei?: number;
  tianFuXingGongWei?: number;
  ziWeiXingGongDiZhi?: string;
  tianFuXingGongDiZhi?: string;
  shiErGongDiZhi?: string[];
  shiErGongTianGan?: string[];
  shiErMingGong?: string[];
  shiErShenGong?: string[];
  ziWeiXingXiZhuXing?: string[];
  tianFuXingXiZhuXing?: string[];
  shiZhiZhuXing?: string[];
  yueZhiZhuXing?: string[];
  nianGanZhuXing?: string[];
  nianZhiZhuXing?: string[];
  dayZhuXing?: string[];
  shiErZhangSheng?: string[];
  jieLuKongWang?: string[];
  xunZhongKongWang?: string[];
  tianShangTianShiXing?: string[];
  shiErGongBoShi?: string[];
  liuNianSuiQianZhuXing?: string[];
  liuNianJiangQianZhuXing?: string[];
  shiErGongZhuXing?: string[][];
  shiErGongZhuXingMark?: string[][];
  shiErGongZhuXingGuanXi?: string[][];

  // 十二宫
  gongWei: {
    [key: string]: ZiWeiGongWei;
  };

  // 四化
  huaLu: string;
  huaQuan: string;
  huaKe: string;
  huaJi: string;
  shiErGongSiHuaXing?: string[][];
  shiErGongSiHuaXingGuanXi?: string[][];

  // 解读
  huaLuJieDu?: string;
  huaQuanJieDu?: string;
  huaKeJieDu?: string;
  huaJiJieDu?: string;

  // 大限小限
  daXian?: string[];      // 大限数组（12个宫位的大限年龄段）
  xiaoXian?: string[];    // 小限数组（12个宫位的小限年龄）

  // 命主身主
  mingZhu?: string;       // 命主星
  shenZhu?: string;       // 身主星
  ziDou?: string;
  liuDou?: string;
}

// 通用排盘类型
export type PaiPanType = 'bazi' | 'liuyao' | 'daliuren' | 'qimen' | 'meihua' | 'ziwei';

// 排盘结果联合类型
export type PaiPanResult = BaZiResult | LiuYaoResult | DaLiuRenResult | QiMenResult | MeiHuaResult | ZiWeiResult;
