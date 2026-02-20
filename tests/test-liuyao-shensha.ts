// 六爻神煞系统测试
import { createLiuYaoPaiPan } from './lib/liuyao';

console.log('=== 六爻神煞系统测试 ===\n');

// 测试1: 基础神煞计算
console.log('【测试1】基础神煞计算');
try {
  const result1 = createLiuYaoPaiPan({
    name: '张三',
    occupy: '测试',
    sex: 1,
    date: '1990-05-15 14:30:00',
    dateType: 0,
    paiPanType: 0,
  });

  console.log(`✅ 姓名: ${result1.name}`);
  console.log(`   四柱: ${result1.ganZhi.year} ${result1.ganZhi.month} ${result1.ganZhi.day} ${result1.ganZhi.hour}`);
  console.log(`   年柱神煞: ${result1.shenSha?.year.join('、') || '无'}`);
  console.log(`   月柱神煞: ${result1.shenSha?.month.join('、') || '无'}`);
  console.log(`   日柱神煞: ${result1.shenSha?.day.join('、') || '无'}`);
  console.log(`   时柱神煞: ${result1.shenSha?.hour.join('、') || '无'}`);
  console.log();
} catch (error) {
  console.error('❌ 测试1失败:', error);
}

// 测试2: 不同日期的神煞
console.log('【测试2】不同日期的神煞');
try {
  const testCases = [
    { date: '2024-01-01 12:00:00', name: '甲子日' },
    { date: '2024-01-15 08:00:00', name: '戊寅日' },
    { date: '2024-06-21 14:30:00', name: '丙申日' },
  ];

  for (const testCase of testCases) {
    const result = createLiuYaoPaiPan({
      name: testCase.name,
      occupy: '测试',
      sex: 1,
      date: testCase.date,
      dateType: 0,
      paiPanType: 0,
    });

    console.log(`✅ ${testCase.name} (${result.ganZhi.day})`);
    console.log(`   年柱: ${result.ganZhi.year} → ${result.shenSha?.year.join('、') || '无'}`);
    console.log(`   月柱: ${result.ganZhi.month} → ${result.shenSha?.month.join('、') || '无'}`);
    console.log(`   日柱: ${result.ganZhi.day} → ${result.shenSha?.day.join('、') || '无'}`);
    console.log(`   时柱: ${result.ganZhi.hour} → ${result.shenSha?.hour.join('、') || '无'}`);
    console.log();
  }
} catch (error) {
  console.error('❌ 测试2失败:', error);
}

// 测试3: 神煞统计
console.log('【测试3】神煞统计');
try {
  const result3 = createLiuYaoPaiPan({
    name: '李四',
    occupy: '测试',
    sex: 0,
    date: '1985-03-20 10:00:00',
    dateType: 0,
    paiPanType: 0,
  });

  // 统计所有神煞
  const allShenSha = [
    ...(result3.shenSha?.year || []),
    ...(result3.shenSha?.month || []),
    ...(result3.shenSha?.day || []),
    ...(result3.shenSha?.hour || []),
  ];

  // 去重
  const uniqueShenSha = Array.from(new Set(allShenSha));

  console.log(`✅ 四柱: ${result3.ganZhi.year} ${result3.ganZhi.month} ${result3.ganZhi.day} ${result3.ganZhi.hour}`);
  console.log(`   神煞总数: ${allShenSha.length}个`);
  console.log(`   不重复神煞: ${uniqueShenSha.length}个`);
  console.log(`   神煞列表: ${uniqueShenSha.join('、')}`);
  console.log();
} catch (error) {
  console.error('❌ 测试3失败:', error);
}

// 测试4: 特定神煞验证
console.log('【测试4】特定神煞验证');
try {
  // 测试天乙贵人（甲日见丑未）
  const result4a = createLiuYaoPaiPan({
    name: '测试天乙贵人',
    occupy: '测试',
    sex: 1,
    date: '2024-01-04 12:00:00', // 甲辰日
    dateType: 0,
    paiPanType: 0,
  });

  console.log(`✅ 甲日天乙贵人测试`);
  console.log(`   日柱: ${result4a.ganZhi.day}`);
  console.log(`   四柱地支: ${result4a.ganZhi.year.substring(1)} ${result4a.ganZhi.month.substring(1)} ${result4a.ganZhi.day.substring(1)} ${result4a.ganZhi.hour.substring(1)}`);

  // 检查是否有天乙贵人
  const hasTianYi = [
    ...(result4a.shenSha?.year || []),
    ...(result4a.shenSha?.month || []),
    ...(result4a.shenSha?.day || []),
    ...(result4a.shenSha?.hour || []),
  ].includes('天乙贵人');

  console.log(`   天乙贵人: ${hasTianYi ? '有' : '无'}`);
  console.log();
} catch (error) {
  console.error('❌ 测试4失败:', error);
}

// 测试5: 综合信息展示
console.log('【测试5】综合信息展示');
try {
  const result5 = createLiuYaoPaiPan({
    name: '王五',
    occupy: '求财运',
    sex: 1,
    date: '1990-05-15 14:30:00',
    dateType: 0,
    paiPanType: 0,
  });

  console.log('✅ 完整信息:');
  console.log(`   ${result5.zao} ${result5.name} ${result5.age}岁`);
  console.log(`   生肖${result5.shengXiao} ${result5.xingZuo}`);
  console.log(`   四柱: ${result5.ganZhi.year} ${result5.ganZhi.month} ${result5.ganZhi.day} ${result5.ganZhi.hour}`);
  console.log(`   空亡: ${result5.kongWang?.join('、')}`);
  console.log(`   月将: ${result5.yueJiang}（${result5.yueJiangShen}）`);
  console.log(`   五不遇时: ${result5.wuBuYuShi ? '是' : '否'}`);
  console.log(`   本卦: ${result5.benGua} → 变卦: ${result5.bianGua}`);
  console.log();
  console.log('   神煞详情:');
  console.log(`   年柱 ${result5.ganZhi.year}: ${result5.shenSha?.year.join('、') || '无'}`);
  console.log(`   月柱 ${result5.ganZhi.month}: ${result5.shenSha?.month.join('、') || '无'}`);
  console.log(`   日柱 ${result5.ganZhi.day}: ${result5.shenSha?.day.join('、') || '无'}`);
  console.log(`   时柱 ${result5.ganZhi.hour}: ${result5.shenSha?.hour.join('、') || '无'}`);
  console.log();
} catch (error) {
  console.error('❌ 测试5失败:', error);
}

console.log('🎉 神煞系统测试完成！');
