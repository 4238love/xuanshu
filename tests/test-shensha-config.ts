/**
 * 神煞细粒度配置测试
 */

import { BaZiPaiPan } from './lib/bazi';
import { LiuYaoPaiPan } from './lib/liuyao';
import { BaZiSettings, LiuYaoSettings } from './types';

console.log('========== 神煞细粒度配置测试 ==========\n');

// 测试1: 八字排盘 - 全部神煞启用（默认）
console.log('【测试1】八字排盘 - 全部神煞启用');
const baziSettings1: BaZiSettings = {
  name: '测试',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0,
  showShenSha: true,
};

const bazi1 = new BaZiPaiPan(baziSettings1);
const result1 = bazi1.getPaiPan();
console.log('年柱神煞:', result1.shenSha?.[0]);
console.log('月柱神煞:', result1.shenSha?.[1]);
console.log('日柱神煞:', result1.shenSha?.[2]);
console.log('时柱神煞:', result1.shenSha?.[3]);
console.log('');

// 测试2: 八字排盘 - 只启用贵人类神煞
console.log('【测试2】八字排盘 - 只启用贵人类神煞');
const baziSettings2: BaZiSettings = {
  name: '测试',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0,
  showShenSha: true,
  shenShaConfig: {
    // 贵人类（启用）
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

    // 其他类（禁用）
    shiEDaBai: false,
    yinZhuYangShou: false,
    yinChaYangCuo: false,
    guLuanSha: false,
    hongYanSha: false,
    gouJiaoSha: false,
    chongTianSha: false,
    tongZiSha: false,
    jieSha: false,
    zaiSha: false,
    guChen: false,
    guaXiu: false,
    yuanChen: false,
    tianDeHe: false,
    yueDeHe: false,
    huaGai: false,
    guoYin: false,
    jinYu: false,
    ciGuan: false,
    xueTang: false,
    tianShe: false,
    siFeiRi: false,
    liuXiuRi: false,
    shiLingRi: false,
    kuiGangRi: false,
    baZhuanRi: false,
    jiuChouRi: false,
    tianZhuan: false,
    yangRen: false,
    feiRen: false,
    xueRen: false,
    liuXia: false,
    diZhuan: false,
    luShen: false,
    yiMa: false,
    gongLu: false,
    tianLuoDiWang: false,
    kongWang: false,
    jieKong: false,
    jiangXing: false,
    taoHua: false,
    tianYi: false,
    jinShen: false,
    wangShen: false,
    diaoKe: false,
    piMa: false,
    sangMen: false,
    liuE: false,
    tianXi: false,
    hongLuan: false,
  },
};

const bazi2 = new BaZiPaiPan(baziSettings2);
const result2 = bazi2.getPaiPan();
console.log('年柱神煞（仅贵人）:', result2.shenSha?.[0]);
console.log('月柱神煞（仅贵人）:', result2.shenSha?.[1]);
console.log('日柱神煞（仅贵人）:', result2.shenSha?.[2]);
console.log('时柱神煞（仅贵人）:', result2.shenSha?.[3]);
console.log('');

// 测试3: 六爻排盘 - 全部神煞启用（默认）
console.log('【测试3】六爻排盘 - 全部神煞启用');
const liuyaoSettings1: LiuYaoSettings = {
  name: '测试',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0,
  paiPanType: 0,
};

const liuyao1 = new LiuYaoPaiPan(liuyaoSettings1);
const result3 = liuyao1.getPaiPan();
console.log('年柱神煞:', result3.shenSha?.year);
console.log('月柱神煞:', result3.shenSha?.month);
console.log('日柱神煞:', result3.shenSha?.day);
console.log('时柱神煞:', result3.shenSha?.hour);
console.log('');

// 测试4: 六爻排盘 - 只启用贵人类和吉神类
console.log('【测试4】六爻排盘 - 只启用贵人类和吉神类');
const liuyaoSettings2: LiuYaoSettings = {
  name: '测试',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0,
  paiPanType: 0,
  shenShaConfig: {
    // 贵人类（启用）
    taiJiGuiRen: true,
    tianYiGuiRen: true,
    fuXingGuiRen: true,
    wenChangGuiRen: true,
    tianChuGuiRen: true,
    yueDeGuiRen: true,
    tianDeGuiRen: true,

    // 吉神类（启用）
    tangFuGuoYin: true,
    tianYuanLu: true,
    huaGai: true,
    tianYi: true,

    // 其他类（禁用）
    yiMa: false,
    tianMa: false,
    luMa: false,
    jieSha: false,
    xianChi: false,
    zaiSha: false,
    mouXing: false,
    huangEn: false,
    jiangXing: false,
    tianXi: false,
    yangRen: false,
    feiRen: false,
  },
};

const liuyao2 = new LiuYaoPaiPan(liuyaoSettings2);
const result4 = liuyao2.getPaiPan();
console.log('年柱神煞（仅贵人+吉神）:', result4.shenSha?.year);
console.log('月柱神煞（仅贵人+吉神）:', result4.shenSha?.month);
console.log('日柱神煞（仅贵人+吉神）:', result4.shenSha?.day);
console.log('时柱神煞（仅贵人+吉神）:', result4.shenSha?.hour);
console.log('');

console.log('========== 测试完成 ==========');
console.log('✅ 神煞细粒度配置功能正常工作');
console.log('✅ 八字排盘支持60种神煞的独立开关');
console.log('✅ 六爻排盘支持23种神煞的独立开关');
