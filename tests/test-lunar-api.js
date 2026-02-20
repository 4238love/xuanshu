const {Solar, Lunar} = require('lunar-javascript');

console.log('=== 测试 Solar 类 ===');
const solar = Solar.fromYmd(2024, 1, 1);
console.log('Solar 对象:', solar);
console.log('\nSolar 方法列表:');
const solarMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(solar))
  .filter(m => !m.startsWith('_') && typeof solar[m] === 'function')
  .sort();
solarMethods.forEach(m => console.log('  -', m));

console.log('\n=== 测试 Solar.toDate() ===');
try {
  const date = solar.toDate();
  console.log('solar.toDate():', date);
  console.log('类型:', typeof date);
} catch (e) {
  console.log('错误:', e.message);
}

console.log('\n=== 测试 Lunar 类 ===');
const lunar = solar.getLunar();
console.log('Lunar 对象:', lunar);
console.log('\nLunar 方法列表:');
const lunarMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(lunar))
  .filter(m => !m.startsWith('_') && typeof lunar[m] === 'function')
  .sort();
lunarMethods.forEach(m => console.log('  -', m));

console.log('\n=== 测试 EightChar 类 ===');
const eightChar = lunar.getEightChar();
console.log('EightChar 对象:', eightChar);
console.log('\nEightChar 方法列表:');
const eightCharMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(eightChar))
  .filter(m => !m.startsWith('_') && typeof eightChar[m] === 'function')
  .sort();
eightCharMethods.forEach(m => console.log('  -', m));

console.log('\n=== 测试错误的方法 ===');
console.log('测试 eightChar.getDayGanZhi():');
try {
  const result = eightChar.getDayGanZhi();
  console.log('  结果:', result);
} catch (e) {
  console.log('  错误:', e.message);
}

console.log('\n测试 eightChar.getYearInGanZhi():');
try {
  const result = eightChar.getYearInGanZhi();
  console.log('  结果:', result);
} catch (e) {
  console.log('  错误:', e.message);
}

console.log('\n=== 测试正确的方法 ===');
console.log('eightChar.getYear():', eightChar.getYear());
console.log('eightChar.getMonth():', eightChar.getMonth());
console.log('eightChar.getDay():', eightChar.getDay());
console.log('eightChar.getTime():', eightChar.getTime());
console.log('eightChar.getYearGan():', eightChar.getYearGan());
console.log('eightChar.getYearZhi():', eightChar.getYearZhi());
console.log('eightChar.getDayGan():', eightChar.getDayGan());
console.log('eightChar.getDayZhi():', eightChar.getDayZhi());
