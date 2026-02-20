// 六爻起卦模式测试
import { createLiuYaoPaiPan } from './lib/liuyao';

console.log('=== 六爻起卦模式测试 ===\n');

// 测试1: 自动起卦（随机）
console.log('【测试1】自动起卦（随机生成）');
try {
  const result1 = createLiuYaoPaiPan({
    name: '测试',
    occupy: '测试占事',
    sex: 1,
    date: '2024-01-01 12:00:00',
    dateType: 0,
    paiPanType: 1, // 自动起卦
  });

  console.log(`✅ 本卦: ${result1.benGua} (${result1.benGuaAs})`);
  console.log(`   变卦: ${result1.bianGua} (${result1.bianGuaAs})`);
  console.log(`   六爻: ${result1.liuYao.benGua.yaoAsMarkName.join(', ')}`);
  console.log();
} catch (error) {
  console.error('❌ 自动起卦失败:', error);
}

// 测试2: 日期起卦
console.log('【测试2】日期起卦（根据年月日时）');
try {
  const result2 = createLiuYaoPaiPan({
    name: '张三',
    occupy: '求财运',
    sex: 1,
    date: '2024-01-01 12:00:00',
    dateType: 0,
    paiPanType: 0, // 日期起卦
  });

  console.log(`✅ 日期: ${result2.solar}`);
  console.log(`   农历: ${result2.lunar}`);
  console.log(`   本卦: ${result2.benGua} (${result2.benGuaAs})`);
  console.log(`   变卦: ${result2.bianGua} (${result2.bianGuaAs})`);
  console.log(`   六爻: ${result2.liuYao.benGua.yaoAsMarkName.join(', ')}`);
  console.log(`   世应: ${result2.liuYao.benGua.shiYing.map((s, i) => s || '-').join(', ')}`);
  console.log();
} catch (error) {
  console.error('❌ 日期起卦失败:', error);
}

// 测试3: 手动起卦
console.log('【测试3】手动起卦（手动输入爻数）');
try {
  const result3 = createLiuYaoPaiPan({
    name: '李四',
    occupy: '问婚姻',
    sex: 0,
    date: '2024-01-01 12:00:00',
    dateType: 0,
    paiPanType: 2, // 手动起卦
    manualYaoShu: [0, 1, 2, 3, 0, 1], // 少阳、少阴、老阳、老阴、少阳、少阴
  });

  console.log(`✅ 本卦: ${result3.benGua} (${result3.benGuaAs})`);
  console.log(`   变卦: ${result3.bianGua} (${result3.bianGuaAs})`);
  console.log(`   六爻: ${result3.liuYao.benGua.yaoAsMarkName.join(', ')}`);
  console.log(`   手动输入: [0=少阳, 1=少阴, 2=老阳, 3=老阴, 0=少阳, 1=少阴]`);
  console.log();
} catch (error) {
  console.error('❌ 手动起卦失败:', error);
}

// 测试4: 不同日期的日期起卦
console.log('【测试4】不同日期的日期起卦');
const testDates = [
  '2024-01-15 08:00:00',
  '2024-06-21 14:30:00',
  '2024-12-31 23:59:59',
];

for (const date of testDates) {
  try {
    const result = createLiuYaoPaiPan({
      name: '测试',
      occupy: '测试',
      sex: 1,
      date: date,
      dateType: 0,
      paiPanType: 0,
    });

    console.log(`✅ ${date}`);
    console.log(`   本卦: ${result.benGua} → 变卦: ${result.bianGua}`);
  } catch (error) {
    console.error(`❌ ${date} 失败:`, error);
  }
}

console.log('\n🎉 起卦模式测试完成！');
