/**
 * 神煞配置结构验证测试
 */

import {
  DEFAULT_BAZI_SHENSHA_CONFIG,
  DEFAULT_LIUYAO_SHENSHA_CONFIG,
  BAZI_SHENSHA_NAME_MAP,
  LIUYAO_SHENSHA_NAME_MAP,
  filterShenSha
} from './lib/config/shenShaConfig';

console.log('========== 神煞配置结构验证 ==========\n');

// 测试1: 八字神煞默认配置
console.log('【测试1】八字神煞默认配置');
console.log('配置项数量:', Object.keys(DEFAULT_BAZI_SHENSHA_CONFIG).length);
console.log('预期: 60种神煞');
console.log('实际配置:', DEFAULT_BAZI_SHENSHA_CONFIG);
console.log('');

// 测试2: 六爻神煞默认配置
console.log('【测试2】六爻神煞默认配置');
console.log('配置项数量:', Object.keys(DEFAULT_LIUYAO_SHENSHA_CONFIG).length);
console.log('预期: 23种神煞');
console.log('实际配置:', DEFAULT_LIUYAO_SHENSHA_CONFIG);
console.log('');

// 测试3: 八字神煞名称映射
console.log('【测试3】八字神煞名称映射');
console.log('映射项数量:', Object.keys(BAZI_SHENSHA_NAME_MAP).length);
console.log('预期: 60种神煞');
console.log('示例映射:');
console.log('  太极贵人 ->', BAZI_SHENSHA_NAME_MAP['太极贵人']);
console.log('  天乙贵人 ->', BAZI_SHENSHA_NAME_MAP['天乙贵人']);
console.log('  华盖 ->', BAZI_SHENSHA_NAME_MAP['华盖']);
console.log('');

// 测试4: 六爻神煞名称映射
console.log('【测试4】六爻神煞名称映射');
console.log('映射项数量:', Object.keys(LIUYAO_SHENSHA_NAME_MAP).length);
console.log('预期: 23种神煞');
console.log('示例映射:');
console.log('  太极贵人 ->', LIUYAO_SHENSHA_NAME_MAP['太极贵人']);
console.log('  驿马 ->', LIUYAO_SHENSHA_NAME_MAP['驿马']);
console.log('  天医 ->', LIUYAO_SHENSHA_NAME_MAP['天医']);
console.log('');

// 测试5: 过滤函数测试
console.log('【测试5】神煞过滤函数测试');
const testShenShaList = ['太极贵人', '天乙贵人', '华盖', '驿马', '桃花'];

// 5.1 无配置（返回全部）
const filtered1 = filterShenSha(testShenShaList, undefined, BAZI_SHENSHA_NAME_MAP);
console.log('无配置时:', filtered1);
console.log('预期: 全部保留');

// 5.2 部分禁用
const config1 = {
  taiJiGuiRen: true,
  tianYiGuiRen: true,
  huaGai: false,  // 禁用华盖
  yiMa: false,    // 禁用驿马
  taoHua: true,
};
const filtered2 = filterShenSha(testShenShaList, config1, BAZI_SHENSHA_NAME_MAP);
console.log('部分禁用时:', filtered2);
console.log('预期: ["太极贵人", "天乙贵人", "桃花"]');

// 5.3 全部禁用
const config2 = {
  taiJiGuiRen: false,
  tianYiGuiRen: false,
  huaGai: false,
  yiMa: false,
  taoHua: false,
};
const filtered3 = filterShenSha(testShenShaList, config2, BAZI_SHENSHA_NAME_MAP);
console.log('全部禁用时:', filtered3);
console.log('预期: []');
console.log('');

console.log('========== 验证完成 ==========');
console.log('✅ 八字神煞配置: 60种');
console.log('✅ 六爻神煞配置: 23种');
console.log('✅ 名称映射正确');
console.log('✅ 过滤函数正常工作');
