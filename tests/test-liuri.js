// 测试流日和流时是否正确
const { Solar, Lunar } = require('lunar-javascript');

// 测试今天的日期
const now = new Date();
console.log('当前时间:', now.toLocaleString('zh-CN'));

const solar = Solar.fromDate(now);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();

console.log('\n=== 当前八字信息 ===');
console.log('年柱:', eightChar.getYearGan() + eightChar.getYearZhi());
console.log('月柱:', eightChar.getMonthGan() + eightChar.getMonthZhi());
console.log('日柱:', eightChar.getDayGan() + eightChar.getDayZhi());
console.log('时柱:', eightChar.getTimeGan() + eightChar.getTimeZhi());

console.log('\n=== 验证信息 ===');
console.log('今天应该是:', eightChar.getDayGan() + eightChar.getDayZhi() + '日');
console.log('当前时辰应该是:', eightChar.getTimeGan() + eightChar.getTimeZhi() + '时');

// 测试本月所有日期的干支
console.log('\n=== 本月流日 ===');
const year = now.getFullYear();
const month = now.getMonth() + 1;
const daysInMonth = new Date(year, month, 0).getDate();

for (let day = 1; day <= daysInMonth; day++) {
  const date = new Date(year, month - 1, day);
  const s = Solar.fromDate(date);
  const l = s.getLunar();
  const ec = l.getEightChar();
  const ganZhi = ec.getDayGan() + ec.getDayZhi();
  const marker = day === now.getDate() ? ' ← 今天' : '';
  console.log(`${month}月${day}日: ${ganZhi}${marker}`);
}

// 测试今天的12个时辰
console.log('\n=== 今天的流时 ===');
const dayGan = eightChar.getDayGan();
const hourNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

// 日上起时法
const ziShiGanMap = {
  '甲': 0, '己': 0,  // 甲
  '乙': 2, '庚': 2,  // 丙
  '丙': 4, '辛': 4,  // 戊
  '丁': 6, '壬': 6,  // 庚
  '戊': 8, '癸': 8   // 壬
};

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const ziShiGanIndex = ziShiGanMap[dayGan] || 0;
const currentTimeZhi = eightChar.getTimeZhi();

for (let i = 0; i < 12; i++) {
  const ganIndex = (ziShiGanIndex + i) % 10;
  const zhiIndex = i;
  const gan = TIAN_GAN[ganIndex];
  const zhi = DI_ZHI[zhiIndex];
  const ganZhi = gan + zhi;
  const marker = zhi === currentTimeZhi ? ' ← 当前时辰' : '';
  console.log(`${hourNames[i]}: ${ganZhi}${marker}`);
}
