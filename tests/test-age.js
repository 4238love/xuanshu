// 测试年龄计算
function getRealAge(birthDate, currentDate = new Date()) {
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  let age = currentYear - birthYear;

  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }

  return age;
}

// 测试：2024-01-01 出生
const birthDate = new Date(2024, 0, 1); // 月份从0开始，0表示1月
const currentDate = new Date(2026, 0, 30); // 2026-01-30

console.log('出生日期:', birthDate.toLocaleDateString());
console.log('当前日期:', currentDate.toLocaleDateString());
console.log('birthYear:', birthDate.getFullYear());
console.log('birthMonth:', birthDate.getMonth());
console.log('birthDay:', birthDate.getDate());
console.log('currentYear:', currentDate.getFullYear());
console.log('currentMonth:', currentDate.getMonth());
console.log('currentDay:', currentDate.getDate());
console.log('实岁:', getRealAge(birthDate, currentDate));
