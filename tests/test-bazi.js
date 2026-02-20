/**
 * 八字排盘模块测试文件
 * 用于验证所有功能是否正常工作
 */

const { createBaZiPaiPan } = require('./lib/bazi/index');

// 测试用例1：基础功能测试
console.log('=== 测试用例1：基础功能测试 ===');
const testCase1 = {
  name: '张三',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0
};

try {
  const result1 = createBaZiPaiPan(testCase1);
  console.log('✓ 基础排盘成功');
  console.log('八字:', result1.baZi);
  console.log('五行:', result1.baZiWuXing);
  console.log('纳音:', result1.baZiNaYin);
  console.log('胎元:', result1.taiYuan);
  console.log('胎息:', result1.taiXi);
  console.log('命宫:', result1.mingGong);
  console.log('身宫:', result1.shenGong);
  console.log('');
} catch (error) {
  console.error('✗ 基础排盘失败:', error.message);
}

// 测试用例2：真太阳时测试
console.log('=== 测试用例2：真太阳时测试 ===');
const testCase2 = {
  name: '李四',
  sex: 0,
  date: '1985-06-15 23:30:00',
  dateType: 0,
  useTrueSolarTime: true,
  city: '广州'
};

try {
  const result2 = createBaZiPaiPan(testCase2);
  console.log('✓ 真太阳时排盘成功');
  console.log('八字:', result2.baZi);
  console.log('使用城市:', testCase2.city);
  console.log('');
} catch (error) {
  console.error('✗ 真太阳时排盘失败:', error.message);
}

// 测试用例3：完整功能测试
console.log('=== 测试用例3：完整功能测试 ===');
const testCase3 = {
  name: '王五',
  sex: 1,
  date: '2000-12-25 12:00:00',
  dateType: 0,
  showXiaoYun: true,
  showLiuYue: true,
  showLiuRi: false,
  showLiuShi: true,
  showJiuXing: true,
  showGanZhiLiuYi: true,
  showShenSha: true,
  showGeJu: true
};

try {
  const result3 = createBaZiPaiPan(testCase3);
  console.log('✓ 完整功能排盘成功');
  console.log('八字:', result3.baZi);
  console.log('神煞数量:', result3.shenSha ? result3.shenSha.flat().length : 0);
  console.log('小运数量:', result3.xiaoYun ? result3.xiaoYun.length : 0);
  console.log('流月数量:', result3.liuYue ? result3.liuYue.length : 0);
  console.log('流时数量:', result3.liuShi ? result3.liuShi.length : 0);
  console.log('九星:', result3.jiuXing ? '已计算' : '未计算');
  console.log('干支留意:', result3.ganZhiLiuYi ? '已分析' : '未分析');
  console.log('格局:', result3.geJu ? result3.geJu.geJuName : '未判断');
  console.log('详细分析:', result3.detailedAnalysis ? '已生成' : '未生成');

  if (result3.detailedAnalysis) {
    console.log('\n--- 详细分析 ---');
    console.log('性格分析:', result3.detailedAnalysis.xingGeAnalysis.substring(0, 50) + '...');
    console.log('财运分析:', result3.detailedAnalysis.caiYunAnalysis.substring(0, 50) + '...');
    console.log('事业分析:', result3.detailedAnalysis.shiYeAnalysis.substring(0, 50) + '...');
    console.log('感情分析:', result3.detailedAnalysis.ganQingAnalysis.substring(0, 50) + '...');
    console.log('健康分析:', result3.detailedAnalysis.jiankangAnalysis.substring(0, 50) + '...');
  }

  console.log('');
} catch (error) {
  console.error('✗ 完整功能排盘失败:', error.message);
  console.error(error.stack);
}

// 测试用例4：配置选项测试
console.log('=== 测试用例4：配置选项测试 ===');
const testCase4 = {
  name: '赵六',
  sex: 0,
  date: '1995-03-20 15:00:00',
  dateType: 0,
  showXiaoYun: false,
  showLiuYue: false,
  showLiuRi: false,
  showLiuShi: false,
  showJiuXing: false,
  showGanZhiLiuYi: false,
  showShenSha: false,
  showGeJu: false
};

try {
  const result4 = createBaZiPaiPan(testCase4);
  console.log('✓ 配置选项测试成功');
  console.log('八字:', result4.baZi);
  console.log('小运:', result4.xiaoYun ? '显示' : '隐藏');
  console.log('流月:', result4.liuYue ? '显示' : '隐藏');
  console.log('九星:', result4.jiuXing ? '显示' : '隐藏');
  console.log('干支留意:', result4.ganZhiLiuYi ? '显示' : '隐藏');
  console.log('神煞:', result4.shenSha ? '显示' : '隐藏');
  console.log('格局:', result4.geJu ? '显示' : '隐藏');
  console.log('');
} catch (error) {
  console.error('✗ 配置选项测试失败:', error.message);
}

console.log('=== 测试完成 ===');
console.log('所有测试用例已执行完毕');
