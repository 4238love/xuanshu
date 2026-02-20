import { BaZiShenShaConfig, LiuYaoShenShaConfig } from '@/types';

/**
 * 八字神煞默认配置（全部启用）
 */
export const DEFAULT_BAZI_SHENSHA_CONFIG: BaZiShenShaConfig = {
  // 贵人类（10种）
  taiJiGuiRen: true,
  tianYiGuiRen: true,
  fuXingGuiRen: true,
  wenChangGuiRen: true,
  tianChuGuiRen: true,
  yueDeGuiRen: true,
  deXiuGuiRen: true,
  tianDeGuiRen: true,
  tianGuanGuiRen: true,
  sanQiGuiRen: true,

  // 凶煞类（13种）
  shiEDaBai: true,
  yinZhuYangShou: true,
  yinChaYangCuo: true,
  guLuanSha: true,
  hongYanSha: true,
  gouJiaoSha: true,
  chongTianSha: true,
  tongZiSha: true,
  jieSha: true,
  zaiSha: true,
  guChen: true,
  guaXiu: true,
  yuanChen: true,

  // 吉神类（8种）
  tianDeHe: true,
  yueDeHe: true,
  huaGai: true,
  guoYin: true,
  jinYu: true,
  ciGuan: true,
  xueTang: true,
  tianShe: true,

  // 特殊日类（7种）
  siFeiRi: true,
  liuXiuRi: true,
  shiLingRi: true,
  kuiGangRi: true,
  baZhuanRi: true,
  jiuChouRi: true,
  tianZhuan: true,

  // 刃煞类（5种）
  yangRen: true,
  feiRen: true,
  xueRen: true,
  liuXia: true,
  diZhuan: true,

  // 禄马类（3种）
  luShen: true,
  yiMa: true,
  gongLu: true,

  // 空亡类（3种）
  tianLuoDiWang: true,
  kongWang: true,
  jieKong: true,

  // 星神类（4种）
  jiangXing: true,
  taoHua: true,
  tianYi: true,
  jinShen: true,

  // 丧吊类（5种）
  wangShen: true,
  diaoKe: true,
  piMa: true,
  sangMen: true,
  liuE: true,

  // 喜庆类（2种）
  tianXi: true,
  hongLuan: true,
};

/**
 * 六爻神煞默认配置（全部启用）
 */
export const DEFAULT_LIUYAO_SHENSHA_CONFIG: LiuYaoShenShaConfig = {
  // 贵人类（7种）
  taiJiGuiRen: true,
  tianYiGuiRen: true,
  fuXingGuiRen: true,
  wenChangGuiRen: true,
  tianChuGuiRen: true,
  yueDeGuiRen: true,
  tianDeGuiRen: true,

  // 吉神类（4种）
  tangFuGuoYin: true,
  tianYuanLu: true,
  huaGai: true,
  tianYi: true,

  // 马星类（3种）
  yiMa: true,
  tianMa: true,
  luMa: true,

  // 凶煞类（5种）
  jieSha: true,
  xianChi: true,
  zaiSha: true,
  mouXing: true,
  huangEn: true,

  // 星神类（2种）
  jiangXing: true,
  tianXi: true,

  // 刃煞类（2种）
  yangRen: true,
  feiRen: true,
};

/**
 * 神煞名称映射（用于过滤）
 */
export const BAZI_SHENSHA_NAME_MAP: { [key: string]: keyof BaZiShenShaConfig } = {
  '太极贵人': 'taiJiGuiRen',
  '天乙贵人': 'tianYiGuiRen',
  '福星贵人': 'fuXingGuiRen',
  '文昌贵人': 'wenChangGuiRen',
  '天厨贵人': 'tianChuGuiRen',
  '月德贵人': 'yueDeGuiRen',
  '德秀贵人': 'deXiuGuiRen',
  '天德贵人': 'tianDeGuiRen',
  '天官贵人': 'tianGuanGuiRen',
  '三奇贵人': 'sanQiGuiRen',
  '十恶大败': 'shiEDaBai',
  '阴注阳受': 'yinZhuYangShou',
  '阴差阳错': 'yinChaYangCuo',
  '孤鸾煞': 'guLuanSha',
  '红艳煞': 'hongYanSha',
  '勾绞煞': 'gouJiaoSha',
  '冲天煞': 'chongTianSha',
  '童子煞': 'tongZiSha',
  '劫煞': 'jieSha',
  '灾煞': 'zaiSha',
  '孤辰': 'guChen',
  '寡宿': 'guaXiu',
  '元辰': 'yuanChen',
  '天德合': 'tianDeHe',
  '月德合': 'yueDeHe',
  '华盖': 'huaGai',
  '国印': 'guoYin',
  '金舆': 'jinYu',
  '词馆': 'ciGuan',
  '学堂': 'xueTang',
  '天赦': 'tianShe',
  '四废日': 'siFeiRi',
  '六秀日': 'liuXiuRi',
  '十灵日': 'shiLingRi',
  '魁罡日': 'kuiGangRi',
  '八专日': 'baZhuanRi',
  '九丑日': 'jiuChouRi',
  '天转': 'tianZhuan',
  '羊刃': 'yangRen',
  '飞刃': 'feiRen',
  '血刃': 'xueRen',
  '流霞': 'liuXia',
  '地转': 'diZhuan',
  '禄神': 'luShen',
  '驿马': 'yiMa',
  '拱禄': 'gongLu',
  '天罗地网': 'tianLuoDiWang',
  '空亡': 'kongWang',
  '截空': 'jieKong',
  '将星': 'jiangXing',
  '桃花': 'taoHua',
  '天医': 'tianYi',
  '金神': 'jinShen',
  '亡神': 'wangShen',
  '吊客': 'diaoKe',
  '披麻': 'piMa',
  '丧门': 'sangMen',
  '六厄': 'liuE',
  '天喜': 'tianXi',
  '红鸾': 'hongLuan',
};

/**
 * 六爻神煞名称映射（用于过滤）
 */
export const LIUYAO_SHENSHA_NAME_MAP: { [key: string]: keyof LiuYaoShenShaConfig } = {
  '太极贵人': 'taiJiGuiRen',
  '天乙贵人': 'tianYiGuiRen',
  '福星贵人': 'fuXingGuiRen',
  '文昌贵人': 'wenChangGuiRen',
  '天厨贵人': 'tianChuGuiRen',
  '月德贵人': 'yueDeGuiRen',
  '天德贵人': 'tianDeGuiRen',
  '唐符国印': 'tangFuGuoYin',
  '天元禄': 'tianYuanLu',
  '华盖': 'huaGai',
  '天医': 'tianYi',
  '驿马': 'yiMa',
  '天马': 'tianMa',
  '禄马': 'luMa',
  '劫煞': 'jieSha',
  '咸池': 'xianChi',
  '灾煞': 'zaiSha',
  '谋星': 'mouXing',
  '皇恩': 'huangEn',
  '将星': 'jiangXing',
  '天喜': 'tianXi',
  '阳刃': 'yangRen',
  '飞刃': 'feiRen',
  '天人': 'tianRen',
};

/**
 * 过滤神煞数组（根据配置）
 * @param shenShaList 神煞数组
 * @param config 神煞配置
 * @param nameMap 名称映射
 * @returns 过滤后的神煞数组
 */
export function filterShenSha<T extends BaZiShenShaConfig | LiuYaoShenShaConfig>(
  shenShaList: string[],
  config: T | undefined,
  nameMap: { [key: string]: keyof T }
): string[] {
  if (!config) {
    return shenShaList; // 没有配置，返回全部
  }

  return shenShaList.filter((shenSha) => {
    const configKey = nameMap[shenSha];
    if (!configKey) {
      return true; // 未知神煞，保留
    }
    return config[configKey] !== false; // 只过滤掉明确设置为 false 的
  });
}
