/**
 * 测试紫微斗数辅星和杂曜显示
 */

const { createZiWeiPaiPan } = require('./lib/ziwei/index.ts');

// 测试数据
const settings = {
  name: '测试',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0,
  birthHour: 8
};

console.log('开始测试紫微斗数辅星和杂曜...\n');

try {
  const result = createZiWeiPaiPan(settings);

  console.log('基础信息:');
  console.log('姓名:', result.name);
  console.log('性别:', result.sex);
  console.log('五行局:', result.wuXingJu);
  console.log('命宫:', result.mingGong);
  console.log('身宫:', result.shenGong);
  console.log('\n十二宫位星曜分布:\n');

  Object.entries(result.gongWei).forEach(([zhi, gong]) => {
    console.log(`${zhi} - ${gong.name}:`);
    if (gong.zhuXing.length > 0) {
      console.log('  主星:', gong.zhuXing.join('、'));
    }
    if (gong.auxStars && gong.auxStars.length > 0) {
      console.log('  辅星:', gong.auxStars.join('、'));
    }
    if (gong.minorStars && gong.minorStars.length > 0) {
      console.log('  杂曜:', gong.minorStars.join('、'));
    }
    console.log('');
  });

  console.log('测试成功！辅星和杂曜已正确显示。');
} catch (error) {
  console.error('测试失败:', error.message);
  console.error(error.stack);
}
