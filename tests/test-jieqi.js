// 测试节气信息
const { createBaZiPaiPan } = require('./lib/bazi/index.ts');

const settings = {
  name: '测试',
  sex: 1,
  date: '2024-01-01 08:00:00',
  dateType: 0
};

try {
  const result = createBaZiPaiPan(settings);
  console.log('节气信息:', JSON.stringify(result.jieQiInfo, null, 2));
  console.log('八字:', result.baZi);
  console.log('农历:', result.lunar);
} catch (error) {
  console.error('错误:', error.message);
  console.error('堆栈:', error.stack);
}
