const { BaZiPaiPan } = require('./lib/bazi/index.ts');

console.log('=== 测试扩展的九星系统（5种体系）===\n');

const settings = {
  name: '测试',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0,
  showJiuXing: true
};

try {
  const bazi = new BaZiPaiPan(settings);
  const result = bazi.getPaiPan();

  if (result.jiuXing) {
    console.log('年柱九星：');
    console.log('  五行:', result.jiuXing.year.wuXing);
    console.log('  方位:', result.jiuXing.year.position, '-', result.jiuXing.year.positionDesc);
    console.log('  玄空九星:', result.jiuXing.year.xuanKong);
    console.log('  北斗九星:', result.jiuXing.year.beiDou);
    console.log('  奇门九星:', result.jiuXing.year.qiMen);
    console.log('  太乙九星:', result.jiuXing.year.taiYi);
    console.log('  奇门吉凶:', result.jiuXing.year.qiMenLuck);
    console.log('  玄空吉凶:', result.jiuXing.year.xuanKongLuck);

    console.log('\n月柱九星：');
    console.log('  五行:', result.jiuXing.month.wuXing);
    console.log('  方位:', result.jiuXing.month.position, '-', result.jiuXing.month.positionDesc);
    console.log('  玄空九星:', result.jiuXing.month.xuanKong);
    console.log('  北斗九星:', result.jiuXing.month.beiDou);
    console.log('  奇门九星:', result.jiuXing.month.qiMen);
    console.log('  太乙九星:', result.jiuXing.month.taiYi);

    console.log('\n日柱九星：');
    console.log('  五行:', result.jiuXing.day.wuXing);
    console.log('  方位:', result.jiuXing.day.position, '-', result.jiuXing.day.positionDesc);
    console.log('  玄空九星:', result.jiuXing.day.xuanKong);
    console.log('  北斗九星:', result.jiuXing.day.beiDou);
    console.log('  奇门九星:', result.jiuXing.day.qiMen);
    console.log('  太乙九星:', result.jiuXing.day.taiYi);

    console.log('\n时柱九星：');
    console.log('  五行:', result.jiuXing.hour.wuXing);
    console.log('  方位:', result.jiuXing.hour.position, '-', result.jiuXing.hour.positionDesc);
    console.log('  玄空九星:', result.jiuXing.hour.xuanKong);
    console.log('  北斗九星:', result.jiuXing.hour.beiDou);
    console.log('  奇门九星:', result.jiuXing.hour.qiMen);
    console.log('  太乙九星:', result.jiuXing.hour.taiYi);

    console.log('\n✅ 九星系统扩展成功！');
  } else {
    console.log('❌ 九星数据为空');
  }
} catch (e) {
  console.log('❌ 错误:', e.message);
  console.log(e.stack);
}
