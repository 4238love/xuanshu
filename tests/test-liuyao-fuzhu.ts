// 六爻辅助信息测试
import { createLiuYaoPaiPan } from './lib/liuyao';

console.log('=== 六爻辅助信息测试 ===\n');

// 测试1: 基础辅助信息
console.log('【测试1】基础辅助信息');
try {
  const result1 = createLiuYaoPaiPan({
    name: '张三',
    occupy: '测试',
    sex: 1,
    date: '2024-01-01 12:00:00',
    dateType: 0,
    paiPanType: 0,
  });

  console.log(`✅ 姓名: ${result1.name}`);
  console.log(`   性别: ${result1.zao}`);
  console.log(`   年龄: ${result1.age}岁（虚岁）`);
  console.log(`   生肖: ${result1.shengXiao}`);
  console.log(`   星座: ${result1.xingZuo}`);
  console.log(`   星期: ${result1.xingQi}`);
  console.log(`   季节: ${result1.jiJie}`);
  console.log(`   月相: ${result1.yueXiang}`);
  console.log();
} catch (error) {
  console.error('❌ 测试1失败:', error);
}

// 测试2: 月将和月将神
console.log('【测试2】月将和月将神');
try {
  const result2 = createLiuYaoPaiPan({
    name: '李四',
    occupy: '测试',
    sex: 0,
    date: '2024-01-15 08:00:00',
    dateType: 0,
    paiPanType: 0,
  });

  console.log(`✅ 上一气: ${result2.jieQi?.prevQi}`);
  console.log(`   下一气: ${result2.jieQi?.nextQi}`);
  console.log(`   月将: ${result2.yueJiang || '未知'}`);
  console.log(`   月将神: ${result2.yueJiangShen || '未知'}`);
  console.log();
} catch (error) {
  console.error('❌ 测试2失败:', error);
}

// 测试3: 空亡
console.log('【测试3】空亡');
try {
  const testCases = [
    { date: '2024-01-01 12:00:00', desc: '甲子日' },
    { date: '2024-01-15 08:00:00', desc: '戊寅日' },
    { date: '2024-06-21 14:30:00', desc: '丙申日' },
  ];

  for (const testCase of testCases) {
    const result = createLiuYaoPaiPan({
      name: '测试',
      occupy: '测试',
      sex: 1,
      date: testCase.date,
      dateType: 0,
      paiPanType: 0,
    });

    console.log(`✅ ${testCase.desc} (${result.ganZhi.day})`);
    console.log(`   空亡: ${result.kongWang?.join('、') || '无'}`);
  }
  console.log();
} catch (error) {
  console.error('❌ 测试3失败:', error);
}

// 测试4: 五不遇时
console.log('【测试4】五不遇时');
try {
  // 测试甲日庚午时（应该是五不遇时）
  const result4a = createLiuYaoPaiPan({
    name: '测试',
    occupy: '测试',
    sex: 1,
    date: '2024-01-04 12:00:00', // 甲辰日午时
    dateType: 0,
    paiPanType: 0,
  });

  console.log(`✅ 日柱: ${result4a.ganZhi.day}`);
  console.log(`   时柱: ${result4a.ganZhi.hour}`);
  console.log(`   五不遇时: ${result4a.wuBuYuShi ? '是' : '否'}`);
  console.log();

  // 测试普通时辰
  const result4b = createLiuYaoPaiPan({
    name: '测试',
    occupy: '测试',
    sex: 1,
    date: '2024-01-01 08:00:00',
    dateType: 0,
    paiPanType: 0,
  });

  console.log(`✅ 日柱: ${result4b.ganZhi.day}`);
  console.log(`   时柱: ${result4b.ganZhi.hour}`);
  console.log(`   五不遇时: ${result4b.wuBuYuShi ? '是' : '否'}`);
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
  console.log(`   公历: ${result5.solar}`);
  console.log(`   农历: ${result5.lunar}`);
  console.log(`   ${result5.xingQi} ${result5.jiJie} ${result5.yueXiang}`);
  console.log(`   四柱: ${result5.ganZhi.year} ${result5.ganZhi.month} ${result5.ganZhi.day} ${result5.ganZhi.hour}`);
  console.log(`   空亡: ${result5.kongWang?.join('、')}`);
  console.log(`   月将: ${result5.yueJiang}（${result5.yueJiangShen}）`);
  console.log(`   五不遇时: ${result5.wuBuYuShi ? '是' : '否'}`);
  console.log(`   本卦: ${result5.benGua} → 变卦: ${result5.bianGua}`);
  console.log();
} catch (error) {
  console.error('❌ 测试5失败:', error);
}

console.log('🎉 辅助信息测试完成！');
