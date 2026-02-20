const { Solar } = require('lunar-javascript');

// 测试九星功能
const solar = Solar.fromYmd(2024, 1, 1);
const lunar = solar.getLunar();

console.log('=== 测试lunar-javascript的九星功能 ===\n');

// 检查lunar对象的所有方法
const lunarMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(lunar));
console.log('Lunar对象的方法数量:', lunarMethods.length);
console.log('包含Nine或Star的方法:', lunarMethods.filter(m =>
  m.toLowerCase().includes('nine') || m.toLowerCase().includes('star')
));

// 尝试获取九星
try {
  if (typeof lunar.getYearNineStar === 'function') {
    const yearNineStar = lunar.getYearNineStar();
    console.log('\n年九星对象:', yearNineStar);

    if (yearNineStar) {
      const nineStarMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(yearNineStar));
      console.log('NineStar对象的方法:', nineStarMethods);
    }
  } else {
    console.log('\ngetYearNineStar方法不存在');
  }
} catch (e) {
  console.log('\n获取年九星出错:', e.message);
}

// 检查EightChar对象
const eightChar = lunar.getEightChar();
console.log('\n=== EightChar对象 ===');
const eightCharMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(eightChar));
console.log('EightChar方法数量:', eightCharMethods.length);
console.log('包含Nine或Star的方法:', eightCharMethods.filter(m =>
  m.toLowerCase().includes('nine') || m.toLowerCase().includes('star')
));
