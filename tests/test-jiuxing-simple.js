const { Solar } = require('lunar-javascript');

console.log('=== 测试lunar-javascript的九星功能（5种体系）===\n');

const solar = Solar.fromYmd(1990, 1, 1);
const lunar = solar.getLunar();

console.log('测试日期: 1990-01-01');
console.log('农历:', lunar.toString());
console.log('');

// 测试年九星
const yearNineStar = lunar.getYearNineStar();
console.log('年九星：');
console.log('  五行:', yearNineStar.getWuXing());
console.log('  方位:', yearNineStar.getPosition(), '-', yearNineStar.getPositionDesc());
console.log('  玄空九星:', yearNineStar.getNameInXuanKong());
console.log('  北斗九星:', yearNineStar.getNameInBeiDou());
console.log('  奇门九星:', yearNineStar.getNameInQiMen());
console.log('  太乙九星:', yearNineStar.getNameInTaiYi());
console.log('  奇门吉凶:', yearNineStar.getLuckInQiMen());
console.log('  玄空吉凶:', yearNineStar.getLuckInXuanKong());

// 测试月九星
const monthNineStar = lunar.getMonthNineStar();
console.log('\n月九星：');
console.log('  玄空九星:', monthNineStar.getNameInXuanKong());
console.log('  北斗九星:', monthNineStar.getNameInBeiDou());
console.log('  奇门九星:', monthNineStar.getNameInQiMen());
console.log('  太乙九星:', monthNineStar.getNameInTaiYi());

// 测试日九星
const dayNineStar = lunar.getDayNineStar();
console.log('\n日九星：');
console.log('  玄空九星:', dayNineStar.getNameInXuanKong());
console.log('  北斗九星:', dayNineStar.getNameInBeiDou());
console.log('  奇门九星:', dayNineStar.getNameInQiMen());
console.log('  太乙九星:', dayNineStar.getNameInTaiYi());

// 测试时九星
const hourNineStar = lunar.getTimeNineStar();
console.log('\n时九星：');
console.log('  玄空九星:', hourNineStar.getNameInXuanKong());
console.log('  北斗九星:', hourNineStar.getNameInBeiDou());
console.log('  奇门九星:', hourNineStar.getNameInQiMen());
console.log('  太乙九星:', hourNineStar.getNameInTaiYi());

console.log('\n✅ 九星系统测试成功！包含5种体系：');
console.log('  1. 五行体系（木、火、土、金、水）');
console.log('  2. 玄空九星体系（一白、二黑、三碧等）');
console.log('  3. 北斗九星体系（贪狼、巨门、禄存等）');
console.log('  4. 奇门九星体系（天蓬、天芮、天冲等）');
console.log('  5. 太乙九星体系（太乙、摄提、轩辕等）');
