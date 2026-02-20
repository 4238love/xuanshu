// 直接测试 createBaZiPaiPan 函数
import { createBaZiPaiPan } from './lib/bazi/index.ts';

const settings = {
  name: '测试',
  sex: 1,
  date: '2024-01-01 00:00:00',
  dateType: 0
};

console.log('当前系统时间:', new Date().toLocaleString());
console.log('出生日期:', settings.date);

const result = createBaZiPaiPan(settings);
console.log('计算结果 - 年龄:', result.age);
console.log('计算结果 - 性别:', result.sex);
console.log('计算结果 - 生肖:', result.shengXiao);
