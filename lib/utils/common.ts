import { TIAN_GAN, DI_ZHI, WU_XING_MAP, NA_YIN, SHI_SHEN_MAP, DI_ZHI_CANG_GAN, TIAN_GAN_XIANG_HE, TIAN_GAN_WU_HE_HUA, DI_ZHI_SAN_HE, DI_ZHI_SAN_HUI, DI_ZHI_LIU_HE, DI_ZHI_LIU_HE_HUA, DI_ZHI_XIANG_CHONG, DI_ZHI_XIANG_XING, DI_ZHI_XIANG_HAI, DI_ZHI_XIANG_PO, GE_JU_CHENG_BAI, GE_JU_MEANING, TIAN_GAN_XIANG_SHENG, TIAN_GAN_XIANG_KE, TIAN_GAN_XIANG_CHONG, DI_ZHI_BAN_HE, DI_ZHI_GONG_HE, DI_ZHI_AN_HE, JIU_XING_YEAR_ZHI, JIU_XING_WU_XING, JIU_XING_JI_XIONG, JIU_XING_MEANING, YEAR_GU_ZHONG, MONTH_GU_ZHONG, DAY_GU_ZHONG, HOUR_GU_ZHONG, GU_ZHONG_PI_ZHU_MAN, GU_ZHONG_PI_ZHU_WOMAN, SHENG_XIAO, YUE_JIANG, JIE_QI_YUE_JIANG, PENG_ZU_BAI_JI_GAN, PENG_ZU_BAI_JI_ZHI, MING_GUA_MAP, RI_ZHU_ZHENG_CAI, RI_ZHU_PIAN_CAI, NV_RI_ZHU_ZHENG_TAO_HUA, NV_RI_ZHU_PIAN_TAO_HUA, RI_ZHU_LUN_MING, JIU_XING_QI_MEN_JI_XIONG, JIU_XING_XUAN_KONG_JI_XIONG } from '../constants';
import { parseSolarDateTimeString, solarPartsToDate } from './dateTime';

/**
 * 获取干支索引
 */
export function getGanZhiIndex(gan: string, zhi: string): number {
  const ganIndex = TIAN_GAN.indexOf(gan);
  const zhiIndex = DI_ZHI.indexOf(zhi);
  if (ganIndex === -1 || zhiIndex === -1) return -1;

  // 计算六十甲子索引
  for (let i = 0; i < 60; i++) {
    if (i % 10 === ganIndex && i % 12 === zhiIndex) {
      return i;
    }
  }
  return -1;
}

/**
 * 根据索引获取干支
 */
export function getGanZhiByIndex(index: number): { gan: string; zhi: string } {
  const gan = TIAN_GAN[index % 10];
  const zhi = DI_ZHI[index % 12];
  return { gan, zhi };
}

/**
 * 获取干支组合
 */
export function getGanZhi(index: number): string {
  const { gan, zhi } = getGanZhiByIndex(index);
  return gan + zhi;
}

/**
 * 获取五行
 */
export function getWuXing(ganOrZhi: string): string {
  return WU_XING_MAP[ganOrZhi] || '';
}

/**
 * 获取纳音
 */
export function getNaYin(ganZhi: string): string {
  return NA_YIN[ganZhi] || '';
}

/**
 * 计算两个干支之间的距离
 */
export function getGanZhiDistance(ganZhi1: string, ganZhi2: string): number {
  const index1 = getGanZhiIndex(ganZhi1[0], ganZhi1[1]);
  const index2 = getGanZhiIndex(ganZhi2[0], ganZhi2[1]);
  if (index1 === -1 || index2 === -1) return 0;

  let distance = index2 - index1;
  if (distance < 0) distance += 60;
  return distance;
}

/**
 * 数字转中文
 */
export function numberToChinese(num: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const units = ['', '十', '百', '千', '万'];

  if (num === 0) return '零';
  if (num < 10) return digits[num];
  if (num === 10) return '十';
  if (num < 20) return '十' + digits[num % 10];
  if (num < 100) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return digits[tens] + '十' + (ones > 0 ? digits[ones] : '');
  }

  // 处理更大的数字
  let result = '';
  let unitIndex = 0;

  while (num > 0) {
    const digit = num % 10;
    if (digit !== 0) {
      result = digits[digit] + units[unitIndex] + result;
    } else if (result && result[0] !== '零') {
      result = '零' + result;
    }
    num = Math.floor(num / 10);
    unitIndex++;
  }

  return result;
}

/**
 * 格式化日期
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/**
 * 解析日期字符串
 */
export function parseDate(dateStr: string): Date {
  const parts = parseSolarDateTimeString(dateStr);
  if (!parts) {
    throw new Error('日期格式无效，请使用 yyyy-MM-dd HH:mm:ss');
  }
  return solarPartsToDate(parts);
}

/**
 * 获取星期
 */
export function getWeekDay(date: Date): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[date.getDay()];
}

/**
 * 获取季节
 */
export function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return '春';
  if (month >= 5 && month <= 7) return '夏';
  if (month >= 8 && month <= 10) return '秋';
  return '冬';
}

/**
 * 获取星座
 */
export function getXingZuo(month: number, day: number): string {
  const xingZuo = [
    '摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座',
    '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座'
  ];
  const days = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];

  if (day < days[month - 1]) {
    return xingZuo[month - 1];
  }
  return xingZuo[month];
}

/**
 * 计算年龄（虚岁）
 */
export function getAge(birthDate: Date, currentDate: Date = new Date()): number {
  const birthYear = birthDate.getFullYear();
  const currentYear = currentDate.getFullYear();
  return currentYear - birthYear + 1;
}

/**
 * 计算年龄（实岁）
 */
export function getRealAge(birthDate: Date, currentDate: Date = new Date()): number {
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

/**
 * 随机生成卦数
 */
export function randomGuaShu(): number {
  return Math.floor(Math.random() * 8) + 1;
}

/**
 * 生成六个爻数
 */
export function generateYaoShu(): number[] {
  const yaoShu: number[] = [];
  for (let i = 0; i < 6; i++) {
    // 每爻可能是6(老阴)、7(少阳)、8(少阴)、9(老阳)
    const num = Math.floor(Math.random() * 4);
    yaoShu.push([6, 7, 8, 9][num]);
  }
  return yaoShu;
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;

  const clonedObj = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

/**
 * 计算十神
 * @param dayGan 日干（日主）
 * @param targetGan 目标天干
 * @returns 十神名称
 */
export function getShiShen(dayGan: string, targetGan: string): string {
  if (!SHI_SHEN_MAP[dayGan] || !SHI_SHEN_MAP[dayGan][targetGan]) {
    return '';
  }
  return SHI_SHEN_MAP[dayGan][targetGan];
}

/**
 * 计算地支藏干的十神
 * @param dayGan 日干（日主）
 * @param zhi 地支
 * @returns 藏干对应的十神数组
 */
export function getZhiShiShen(dayGan: string, zhi: string): string[] {
  const cangGan = DI_ZHI_CANG_GAN[zhi];
  if (!cangGan) return [];

  return cangGan.map(gan => getShiShen(dayGan, gan));
}

/**
 * 分析十神格局
 * @param shiShenCount 十神数量统计
 * @returns 格局分析文本
 */
export function analyzeShiShenPattern(shiShenCount: { [key: string]: number }): string {
  const analysis: string[] = [];

  // 统计各类十神
  const biJianCount = (shiShenCount['比肩'] || 0) + (shiShenCount['劫财'] || 0);
  const shiShangCount = (shiShenCount['食神'] || 0) + (shiShenCount['伤官'] || 0);
  const caiCount = (shiShenCount['偏财'] || 0) + (shiShenCount['正财'] || 0);
  const guanCount = (shiShenCount['七杀'] || 0) + (shiShenCount['正官'] || 0);
  const yinCount = (shiShenCount['偏印'] || 0) + (shiShenCount['正印'] || 0);

  // 判断格局特点
  if (biJianCount >= 3) {
    analysis.push('比劫旺盛，性格独立自主，竞争意识强，适合合伙创业');
  }

  if (shiShangCount >= 3) {
    analysis.push('食伤旺盛，才华横溢，表达能力强，适合艺术创作或技术工作');
  }

  if (caiCount >= 3) {
    analysis.push('财星旺盛，财运较好，善于理财，适合经商或金融行业');
  }

  if (guanCount >= 3) {
    analysis.push('官杀旺盛，责任心强，有领导才能，适合从政或管理工作');
  }

  if (yinCount >= 3) {
    analysis.push('印星旺盛，学习能力强，重视文化修养，适合教育或研究工作');
  }

  // 特殊格局判断
  if (shiShenCount['食神'] >= 2 && caiCount >= 2) {
    analysis.push('食神生财格，能将才华转化为财富');
  }

  if (shiShenCount['正官'] >= 1 && shiShenCount['正印'] >= 1) {
    analysis.push('官印相生格，事业发展顺利，名利双收');
  }

  if (shiShenCount['伤官'] >= 2 && shiShenCount['正官'] >= 1) {
    analysis.push('伤官见官格，需注意与上级关系，容易有口舌是非');
  }

  if (analysis.length === 0) {
    analysis.push('八字平和，各方面发展较为均衡');
  }

  return analysis.join('；');
}

/**
 * 计算起运岁数
 * @param sex 性别（0:女, 1:男）
 * @param yearGan 年干
 * @param birthDate 出生日期
 * @param solarTermDate 节气日期
 * @returns 起运岁数
 */
export function calculateQiYunSui(sex: number, yearGan: string, birthDate: Date, solarTermDate: Date): number {
  // 判断年干阴阳：甲丙戊庚壬为阳，乙丁己辛癸为阴
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  const isYangYear = yangGan.includes(yearGan);

  // 阳年男命、阴年女命顺行，阴年男命、阳年女命逆行
  const isShunXing = (sex === 1 && isYangYear) || (sex === 0 && !isYangYear);

  // 计算出生日期与节气的天数差
  const timeDiff = Math.abs(birthDate.getTime() - solarTermDate.getTime());
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // 3天为1年，不足3天按1年计算
  const qiYunSui = Math.ceil(daysDiff / 3);

  return qiYunSui;
}

/**
 * 计算大运
 * @param monthGanZhi 月柱干支
 * @param qiYunSui 起运岁数
 * @param daYunLunShu 大运轮数（默认10轮，每轮10年）
 * @param isShunXing 是否顺行
 * @returns 大运数组
 */
export function calculateDaYun(
  monthGanZhi: string,
  qiYunSui: number,
  daYunLunShu: number = 10,
  isShunXing: boolean = true
): { ganZhi: string; startAge: number; endAge: number }[] {
  const monthGan = monthGanZhi[0];
  const monthZhi = monthGanZhi[1];

  // 获取月柱在六十甲子中的索引
  let currentIndex = getGanZhiIndex(monthGan, monthZhi);
  if (currentIndex === -1) return [];

  const daYunList: { ganZhi: string; startAge: number; endAge: number }[] = [];

  for (let i = 0; i < daYunLunShu; i++) {
    // 顺行加1，逆行减1
    currentIndex = isShunXing ? (currentIndex + 1) % 60 : (currentIndex - 1 + 60) % 60;

    const ganZhi = getGanZhi(currentIndex);
    const startAge = qiYunSui + i * 10;
    const endAge = startAge + 9;

    daYunList.push({
      ganZhi,
      startAge,
      endAge
    });
  }

  return daYunList;
}

/**
 * 计算流年
 * @param birthYear 出生年份
 * @param currentYear 当前年份（默认为今年）
 * @param count 计算流年数量（默认10年）
 * @returns 流年数组
 */
export function calculateLiuNian(
  birthYear: number,
  currentYear: number = new Date().getFullYear(),
  count: number = 10
): { year: number; ganZhi: string; age: number }[] {
  const { Lunar } = require('lunar-javascript');
  const liuNianList: { year: number; ganZhi: string; age: number }[] = [];

  // 从当前年份往前推5年，往后推5年
  const startYear = currentYear - Math.floor(count / 2);

  for (let i = 0; i < count; i++) {
    const year = startYear + i;
    const age = year - birthYear + 1; // 虚岁

    // 按春节（农历正月初一）切换流年
    const liChun = Lunar.fromYmd(year, 1, 1).getJieQiTable()['立春'];
    const ganZhi = liChun.getLunar().getYearInGanZhiExact();

    liuNianList.push({
      year,
      ganZhi,
      age
    });
  }

  return liuNianList;
}

/**
 * 获取当前大运
 * @param daYunList 大运列表
 * @param currentAge 当前年龄
 * @returns 当前大运
 */
export function getCurrentDaYun<T extends { startAge: number; endAge: number }>(
  daYunList: T[],
  currentAge: number
): T | null {
  for (const daYun of daYunList) {
    if (currentAge >= daYun.startAge && currentAge <= daYun.endAge) {
      return daYun;
    }
  }
  return null;
}

/**
 * 获取当前流年
 * @param liuNianList 流年列表
 * @param currentYear 当前年份
 * @returns 当前流年
 */
export function getCurrentLiuNian<T extends { year: number }>(
  liuNianList: T[],
  currentYear: number = new Date().getFullYear()
): T | null {
  for (const liuNian of liuNianList) {
    if (liuNian.year === currentYear) {
      return liuNian;
    }
  }
  return null;
}

/**
 * 分析天干五合关系
 * @param gans 天干数组（年月日时）
 * @returns 五合关系数组
 */
export function analyzeTianGanWuHe(gans: string[]): Array<{
  gan1: string;
  gan2: string;
  position1: string;
  position2: string;
  heHua: string;
}> {
  const result: Array<{
    gan1: string;
    gan2: string;
    position1: string;
    position2: string;
    heHua: string;
  }> = [];

  const positions = ['年干', '月干', '日干', '时干'];

  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      const gan1 = gans[i];
      const gan2 = gans[j];

      if (TIAN_GAN_XIANG_HE[gan1] === gan2) {
        const heHuaKey = gan1 < gan2 ? gan1 + gan2 : gan2 + gan1;
        const heHua = TIAN_GAN_WU_HE_HUA[heHuaKey] || '';

        result.push({
          gan1,
          gan2,
          position1: positions[i],
          position2: positions[j],
          heHua
        });
      }
    }
  }

  return result;
}

/**
 * 分析地支三合关系
 * @param zhis 地支数组（年月日时）
 * @returns 三合关系数组
 */
export function analyzeDiZhiSanHe(zhis: string[]): Array<{
  zhis: string[];
  positions: string[];
  wuXing: string;
  isComplete: boolean;
}> {
  const result: Array<{
    zhis: string[];
    positions: string[];
    wuXing: string;
    isComplete: boolean;
  }> = [];

  const positions = ['年支', '月支', '日支', '时支'];

  // 检查每个三合局
  for (const key in DI_ZHI_SAN_HE) {
    const sanHe = DI_ZHI_SAN_HE[key];
    const foundZhis: string[] = [];
    const foundPositions: string[] = [];

    for (let i = 0; i < zhis.length; i++) {
      if (sanHe.zhis.includes(zhis[i])) {
        foundZhis.push(zhis[i]);
        foundPositions.push(positions[i]);
      }
    }

    // 至少有2个地支才算有三合关系
    if (foundZhis.length >= 2) {
      result.push({
        zhis: foundZhis,
        positions: foundPositions,
        wuXing: sanHe.wuXing,
        isComplete: foundZhis.length === 3
      });
    }
  }

  return result;
}

/**
 * 分析地支三会关系
 * @param zhis 地支数组（年月日时）
 * @returns 三会关系数组
 */
export function analyzeDiZhiSanHui(zhis: string[]): Array<{
  zhis: string[];
  positions: string[];
  wuXing: string;
  isComplete: boolean;
}> {
  const result: Array<{
    zhis: string[];
    positions: string[];
    wuXing: string;
    isComplete: boolean;
  }> = [];

  const positions = ['年支', '月支', '日支', '时支'];

  // 检查每个三会局
  for (const key in DI_ZHI_SAN_HUI) {
    const sanHui = DI_ZHI_SAN_HUI[key];
    const foundZhis: string[] = [];
    const foundPositions: string[] = [];

    for (let i = 0; i < zhis.length; i++) {
      if (sanHui.zhis.includes(zhis[i])) {
        foundZhis.push(zhis[i]);
        foundPositions.push(positions[i]);
      }
    }

    // 至少有2个地支才算有三会关系
    if (foundZhis.length >= 2) {
      result.push({
        zhis: foundZhis,
        positions: foundPositions,
        wuXing: sanHui.wuXing,
        isComplete: foundZhis.length === 3
      });
    }
  }

  return result;
}

/**
 * 分析地支六合关系
 * @param zhis 地支数组（年月日时）
 * @returns 六合关系数组
 */
export function analyzeDiZhiLiuHe(zhis: string[]): Array<{
  zhi1: string;
  zhi2: string;
  position1: string;
  position2: string;
  heHua: string;
}> {
  const result: Array<{
    zhi1: string;
    zhi2: string;
    position1: string;
    position2: string;
    heHua: string;
  }> = [];

  const positions = ['年支', '月支', '日支', '时支'];

  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const zhi1 = zhis[i];
      const zhi2 = zhis[j];

      if (DI_ZHI_LIU_HE[zhi1] === zhi2) {
        const heHuaKey = zhi1 < zhi2 ? zhi1 + zhi2 : zhi2 + zhi1;
        const heHua = DI_ZHI_LIU_HE_HUA[heHuaKey] || '';

        result.push({
          zhi1,
          zhi2,
          position1: positions[i],
          position2: positions[j],
          heHua
        });
      }
    }
  }

  return result;
}

/**
 * 分析地支相冲关系
 * @param zhis 地支数组（年月日时）
 * @returns 相冲关系数组
 */
export function analyzeDiZhiXiangChong(zhis: string[]): Array<{
  zhi1: string;
  zhi2: string;
  position1: string;
  position2: string;
}> {
  const result: Array<{
    zhi1: string;
    zhi2: string;
    position1: string;
    position2: string;
  }> = [];

  const positions = ['年支', '月支', '日支', '时支'];

  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const zhi1 = zhis[i];
      const zhi2 = zhis[j];

      if (DI_ZHI_XIANG_CHONG[zhi1] === zhi2) {
        result.push({
          zhi1,
          zhi2,
          position1: positions[i],
          position2: positions[j]
        });
      }
    }
  }

  return result;
}

/**
 * 分析地支相刑关系
 * @param zhis 地支数组（年月日时）
 * @returns 相刑关系数组
 */
export function analyzeDiZhiXiangXing(zhis: string[]): Array<{
  zhis: string[];
  positions: string[];
  xingType: string;
}> {
  const result: Array<{
    zhis: string[];
    positions: string[];
    xingType: string;
  }> = [];

  const positions = ['年支', '月支', '日支', '时支'];

  // 检查三刑
  const sanXingGroups = [
    { zhis: ['寅', '巳', '申'], name: '寅巳申三刑' },
    { zhis: ['丑', '戌', '未'], name: '丑戌未三刑' }
  ];

  for (const group of sanXingGroups) {
    const foundZhis: string[] = [];
    const foundPositions: string[] = [];

    for (let i = 0; i < zhis.length; i++) {
      if (group.zhis.includes(zhis[i])) {
        foundZhis.push(zhis[i]);
        foundPositions.push(positions[i]);
      }
    }

    if (foundZhis.length >= 2) {
      result.push({
        zhis: foundZhis,
        positions: foundPositions,
        xingType: group.name
      });
    }
  }

  // 检查子卯相刑
  const ziIndex = zhis.indexOf('子');
  const maoIndex = zhis.indexOf('卯');
  if (ziIndex !== -1 && maoIndex !== -1) {
    result.push({
      zhis: ['子', '卯'],
      positions: [positions[ziIndex], positions[maoIndex]],
      xingType: '子卯相刑'
    });
  }

  // 检查自刑
  const ziXingZhis = ['辰', '午', '酉', '亥'];
  for (const zhi of ziXingZhis) {
    const indices = zhis.map((z, i) => z === zhi ? i : -1).filter(i => i !== -1);
    if (indices.length >= 2) {
      result.push({
        zhis: [zhi, zhi],
        positions: indices.map(i => positions[i]),
        xingType: `${zhi}自刑`
      });
    }
  }

  return result;
}

/**
 * 分析地支相害关系
 * @param zhis 地支数组（年月日时）
 * @returns 相害关系数组
 */
export function analyzeDiZhiXiangHai(zhis: string[]): Array<{
  zhi1: string;
  zhi2: string;
  position1: string;
  position2: string;
}> {
  const result: Array<{
    zhi1: string;
    zhi2: string;
    position1: string;
    position2: string;
  }> = [];

  const positions = ['年支', '月支', '日支', '时支'];

  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const zhi1 = zhis[i];
      const zhi2 = zhis[j];

      if (DI_ZHI_XIANG_HAI[zhi1] === zhi2) {
        result.push({
          zhi1,
          zhi2,
          position1: positions[i],
          position2: positions[j]
        });
      }
    }
  }

  return result;
}

/**
 * 分析地支相破关系
 * @param zhis 地支数组（年月日时）
 * @returns 相破关系数组
 */
export function analyzeDiZhiXiangPo(zhis: string[]): Array<{
  zhi1: string;
  zhi2: string;
  position1: string;
  position2: string;
}> {
  const result: Array<{
    zhi1: string;
    zhi2: string;
    position1: string;
    position2: string;
  }> = [];

  const positions = ['年支', '月支', '日支', '时支'];

  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const zhi1 = zhis[i];
      const zhi2 = zhis[j];

      if (DI_ZHI_XIANG_PO[zhi1] === zhi2) {
        result.push({
          zhi1,
          zhi2,
          position1: positions[i],
          position2: positions[j]
        });
      }
    }
  }

  return result;
}

/**
 * 判断八字格局
 * @param dayGan 日干
 * @param monthZhi 月支
 * @param gans 四柱天干
 * @param zhis 四柱地支
 * @param shiShenCount 十神数量统计
 * @returns 格局信息
 */
export function analyzeGeJu(
  dayGan: string,
  monthZhi: string,
  gans: string[],
  zhis: string[],
  shiShenCount: { [key: string]: number }
): {
  geJuType: string;
  geJuName: string;
  geJuMeaning: string;
  geJuChengBai: string;
  yongShen: string;
  xiShen: string;
  jiShen: string;
  chouShen: string;
} {
  // 获取月支藏干
  const monthCangGan = DI_ZHI_CANG_GAN[monthZhi] || [];
  const monthZhuGan = monthCangGan[0]; // 月支本气

  // 计算月令十神
  const monthShiShen = getShiShen(dayGan, monthZhuGan);

  // 判断月令十神是否透干
  const isTouGan = gans.some(gan => getShiShen(dayGan, gan) === monthShiShen);

  // 判断正格
  let geJuType = 'UNKNOWN';
  let geJuName = '普通格局';

  if (isTouGan) {
    switch (monthShiShen) {
      case '正官':
        geJuType = 'ZHENG_GUAN';
        geJuName = '正官格';
        break;
      case '七杀':
        geJuType = 'QI_SHA';
        geJuName = '七杀格';
        break;
      case '正印':
        geJuType = 'ZHENG_YIN';
        geJuName = '正印格';
        break;
      case '偏印':
        geJuType = 'PIAN_YIN';
        geJuName = '偏印格';
        break;
      case '正财':
        geJuType = 'ZHENG_CAI';
        geJuName = '正财格';
        break;
      case '偏财':
        geJuType = 'PIAN_CAI';
        geJuName = '偏财格';
        break;
      case '食神':
        geJuType = 'SHI_SHEN';
        geJuName = '食神格';
        break;
      case '伤官':
        geJuType = 'SHANG_GUAN';
        geJuName = '伤官格';
        break;
    }
  }

  // 判断特殊格局，优先参考日主强弱与月令扶抑
  const biJianCount = (shiShenCount['比肩'] || 0) + (shiShenCount['劫财'] || 0);
  const shiShangCount = (shiShenCount['食神'] || 0) + (shiShenCount['伤官'] || 0);
  const caiCount = (shiShenCount['偏财'] || 0) + (shiShenCount['正财'] || 0);
  const guanCount = (shiShenCount['七杀'] || 0) + (shiShenCount['正官'] || 0);
  const yinCount = (shiShenCount['偏印'] || 0) + (shiShenCount['正印'] || 0);
  const dayElement = getWuXing(dayGan);
  const monthElement = getWuXing(monthZhi);
  const supportScore =
    biJianCount +
    yinCount +
    (monthElement === dayElement || getGeneratedElement(monthElement) === dayElement ? 1.5 : 0);
  const consumeScore = shiShangCount + caiCount + guanCount;
  const strengthDelta = supportScore - consumeScore;

  if (strengthDelta <= -2 && biJianCount + yinCount <= 2) {
    if (caiCount >= 4) {
      geJuType = 'CONG_CAI';
      geJuName = '从财格';
    } else if (guanCount >= 4) {
      geJuType = 'CONG_SHA';
      geJuName = '从杀格';
    } else if (shiShangCount >= 4) {
      geJuType = 'CONG_ER';
      geJuName = '从儿格';
    }
  }

  if (strengthDelta >= 3 && biJianCount + yinCount >= 4) {
    geJuType = 'ZHUAN_WANG';
    geJuName = '专旺格';
  }

  // 获取格局说明
  const geJuMeaning = GE_JU_MEANING[geJuName] || '需综合分析八字五行生克关系';

  // 判断格局成败
  const geJuChengBai = analyzeGeJuChengBai(geJuName, shiShenCount, gans, zhis);

  // 用神优先基于日主强弱、月令与格局协同关系选取
  const { yongShen, xiShen, jiShen, chouShen } = selectYongShen(
    dayGan,
    geJuName,
    shiShenCount,
    monthZhi
  );

  return {
    geJuType,
    geJuName,
    geJuMeaning,
    geJuChengBai,
    yongShen,
    xiShen,
    jiShen,
    chouShen
  };
}

/**
 * 分析格局成败
 */
function analyzeGeJuChengBai(
  geJuName: string,
  shiShenCount: { [key: string]: number },
  gans: string[],
  zhis: string[]
): string {
  const chengBaiInfo = GE_JU_CHENG_BAI[geJuName];
  if (!chengBaiInfo) {
    return '格局成败需综合分析';
  }

  const analysis: string[] = [];

  // 简化判断：根据十神数量判断
  const biJianCount = (shiShenCount['比肩'] || 0) + (shiShenCount['劫财'] || 0);
  const shiShangCount = (shiShenCount['食神'] || 0) + (shiShenCount['伤官'] || 0);
  const caiCount = (shiShenCount['偏财'] || 0) + (shiShenCount['正财'] || 0);
  const guanCount = (shiShenCount['七杀'] || 0) + (shiShenCount['正官'] || 0);
  const yinCount = (shiShenCount['偏印'] || 0) + (shiShenCount['正印'] || 0);

  // 根据格局类型判断
  switch (geJuName) {
    case '正官格':
    case '七杀格':
      if (caiCount >= 2) analysis.push('财星生官，格局成');
      if (yinCount >= 2) analysis.push('印星护身，格局成');
      if (shiShenCount['伤官'] >= 2) analysis.push('伤官见官，格局败');
      break;

    case '正印格':
    case '偏印格':
      if (guanCount >= 2) analysis.push('官星生印，格局成');
      if (caiCount >= 2) analysis.push('财星破印，格局败');
      break;

    case '正财格':
    case '偏财格':
      if (shiShangCount >= 2) analysis.push('食伤生财，格局成');
      if (biJianCount >= 3) analysis.push('比劫夺财，格局败');
      break;

    case '食神格':
      if (caiCount >= 2) analysis.push('食神生财，格局成');
      if (shiShenCount['偏印'] >= 2) analysis.push('枭神夺食，格局败');
      break;

    case '伤官格':
      if (caiCount >= 2) analysis.push('伤官生财，格局成');
      if (shiShenCount['正官'] >= 1) analysis.push('伤官见官，格局败');
      break;
  }

  if (analysis.length === 0) {
    return '格局中和，需综合分析';
  }

  return analysis.join('；');
}

/**
 * 选取用神
 */
function selectYongShen(
  dayGan: string,
  geJuName: string,
  shiShenCount: { [key: string]: number },
  monthZhi: string
): {
  yongShen: string;
  xiShen: string;
  jiShen: string;
  chouShen: string;
} {
  const biJianCount = (shiShenCount['比肩'] || 0) + (shiShenCount['劫财'] || 0);
  const shiShangCount = (shiShenCount['食神'] || 0) + (shiShenCount['伤官'] || 0);
  const caiCount = (shiShenCount['偏财'] || 0) + (shiShenCount['正财'] || 0);
  const guanCount = (shiShenCount['七杀'] || 0) + (shiShenCount['正官'] || 0);
  const yinCount = (shiShenCount['偏印'] || 0) + (shiShenCount['正印'] || 0);
  const dayElement = getWuXing(dayGan);
  const monthElement = getWuXing(monthZhi);
  const resourceElement = getGeneratingElement(dayElement);
  const peerElement = dayElement;
  const outputElement = getGeneratedElement(dayElement);
  const wealthElement = getControlledElement(dayElement);
  const officialElement = getControllingElement(dayElement);

  const monthSupportsDayMaster =
    monthElement === dayElement || getGeneratedElement(monthElement) === dayElement;
  const supportScore = biJianCount + yinCount + (monthSupportsDayMaster ? 1.5 : 0);
  const consumeScore = shiShangCount + caiCount + guanCount;
  const isStrong = supportScore - consumeScore >= 1.5;
  const isWeak = supportScore - consumeScore <= -1.5;

  let yongElements: string[] = [];
  let xiElements: string[] = [];
  let jiElements: string[] = [];
  let chouElements: string[] = [];
  let yongTenGods: string[] = [];
  let xiTenGods: string[] = [];
  let jiTenGods: string[] = [];
  let chouTenGods: string[] = [];

  if (isWeak) {
    yongElements = [resourceElement, peerElement];
    xiElements = [peerElement, officialElement];
    jiElements = [wealthElement, outputElement];
    chouElements = [wealthElement, outputElement, officialElement];
    yongTenGods = ['印星', '比劫'];
    xiTenGods = ['比劫', '官杀'];
    jiTenGods = ['财星', '食伤'];
    chouTenGods = ['财星', '食伤', '官杀'];
  } else if (isStrong) {
    yongElements = [outputElement, wealthElement];
    xiElements = [officialElement];
    jiElements = [peerElement, resourceElement];
    chouElements = [peerElement, resourceElement];
    yongTenGods = ['食伤', '财星'];
    xiTenGods = ['官杀'];
    jiTenGods = ['比劫', '印星'];
    chouTenGods = ['比劫', '印星'];
  } else {
    yongElements = [wealthElement, officialElement];
    xiElements = [outputElement];
    jiElements = [peerElement];
    chouElements = [resourceElement];
    yongTenGods = ['财星', '官杀'];
    xiTenGods = ['食伤'];
    jiTenGods = ['比劫'];
    chouTenGods = ['印星'];
  }

  switch (geJuName) {
    case '正官格':
    case '七杀格':
      yongElements = isWeak ? [resourceElement, officialElement] : [officialElement, wealthElement];
      xiElements = isWeak ? [peerElement] : [outputElement];
      jiElements = isWeak ? [wealthElement, outputElement] : [peerElement, resourceElement];
      chouElements = [outputElement];
      yongTenGods = isWeak ? ['印星', '官杀'] : ['官杀', '财星'];
      xiTenGods = isWeak ? ['比劫'] : ['食伤'];
      jiTenGods = isWeak ? ['财星', '食伤'] : ['比劫', '印星'];
      chouTenGods = ['食伤'];
      break;
    case '正印格':
    case '偏印格':
      yongElements = isStrong ? [wealthElement, outputElement] : [resourceElement, peerElement];
      xiElements = [officialElement];
      jiElements = isStrong ? [resourceElement, peerElement] : [wealthElement];
      chouElements = [wealthElement];
      yongTenGods = isStrong ? ['财星', '食伤'] : ['印星', '比劫'];
      xiTenGods = ['官杀'];
      jiTenGods = isStrong ? ['印星', '比劫'] : ['财星'];
      chouTenGods = ['财星'];
      break;
    case '正财格':
    case '偏财格':
      yongElements = isWeak ? [resourceElement, peerElement] : [wealthElement, outputElement];
      xiElements = [officialElement];
      jiElements = isWeak ? [outputElement, wealthElement] : [peerElement, resourceElement];
      chouElements = isWeak ? [outputElement] : [peerElement];
      yongTenGods = isWeak ? ['印星', '比劫'] : ['财星', '食伤'];
      xiTenGods = ['官杀'];
      jiTenGods = isWeak ? ['食伤', '财星'] : ['比劫', '印星'];
      chouTenGods = isWeak ? ['食伤'] : ['比劫'];
      break;
    case '食神格':
    case '伤官格':
      yongElements = isWeak ? [resourceElement, peerElement] : [outputElement, wealthElement];
      xiElements = isWeak ? [peerElement] : [officialElement];
      jiElements = isWeak ? [wealthElement, officialElement] : [resourceElement, peerElement];
      chouElements = isWeak ? [officialElement] : [resourceElement];
      yongTenGods = isWeak ? ['印星', '比劫'] : ['食伤', '财星'];
      xiTenGods = isWeak ? ['比劫'] : ['官杀'];
      jiTenGods = isWeak ? ['财星', '官杀'] : ['印星', '比劫'];
      chouTenGods = isWeak ? ['官杀'] : ['印星'];
      break;
    case '从财格':
      yongElements = [wealthElement, outputElement];
      xiElements = [officialElement];
      jiElements = [peerElement, resourceElement];
      chouElements = [peerElement, resourceElement];
      yongTenGods = ['财星', '食伤'];
      xiTenGods = ['官杀'];
      jiTenGods = ['比劫', '印星'];
      chouTenGods = ['比劫', '印星'];
      break;
    case '从杀格':
      yongElements = [officialElement, wealthElement];
      xiElements = [resourceElement];
      jiElements = [peerElement, outputElement];
      chouElements = [peerElement];
      yongTenGods = ['官杀', '财星'];
      xiTenGods = ['印星'];
      jiTenGods = ['比劫', '食伤'];
      chouTenGods = ['比劫'];
      break;
    case '从儿格':
      yongElements = [outputElement, wealthElement];
      xiElements = [officialElement];
      jiElements = [resourceElement, peerElement];
      chouElements = [resourceElement];
      yongTenGods = ['食伤', '财星'];
      xiTenGods = ['官杀'];
      jiTenGods = ['印星', '比劫'];
      chouTenGods = ['印星'];
      break;
    case '专旺格':
      yongElements = [officialElement, wealthElement, outputElement];
      xiElements = [wealthElement, outputElement];
      jiElements = [peerElement, resourceElement];
      chouElements = [peerElement, resourceElement];
      yongTenGods = ['官杀', '财星', '食伤'];
      xiTenGods = ['财星', '食伤'];
      jiTenGods = ['比劫', '印星'];
      chouTenGods = ['比劫', '印星'];
      break;
  }

  return {
    yongShen: formatElementPreference(yongElements, yongTenGods),
    xiShen: formatElementPreference(xiElements, xiTenGods),
    jiShen: formatElementPreference(jiElements, jiTenGods),
    chouShen: formatElementPreference(chouElements, chouTenGods),
  };
}

function getGeneratedElement(element: string): string {
  const map: { [key: string]: string } = {
    木: '火',
    火: '土',
    土: '金',
    金: '水',
    水: '木'
  };
  return map[element] || '';
}

function getGeneratingElement(element: string): string {
  const map: { [key: string]: string } = {
    木: '水',
    火: '木',
    土: '火',
    金: '土',
    水: '金'
  };
  return map[element] || '';
}

function getControlledElement(element: string): string {
  const map: { [key: string]: string } = {
    木: '土',
    火: '金',
    土: '水',
    金: '木',
    水: '火'
  };
  return map[element] || '';
}

function getControllingElement(element: string): string {
  const map: { [key: string]: string } = {
    木: '金',
    火: '水',
    土: '木',
    金: '火',
    水: '土'
  };
  return map[element] || '';
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function formatElementPreference(elements: string[], tenGods: string[]): string {
  const elementText = uniqueValues(elements).join('、');
  const tenGodText = uniqueValues(tenGods).join('、');

  if (elementText && tenGodText) {
    return `${elementText}（${tenGodText}）`;
  }

  return elementText || tenGodText || '需结合全局再定';
}

/**
 * 计算胎元
 * 胎元：月柱后一位（月干进一位，月支进一位）
 * @param monthGan 月干
 * @param monthZhi 月支
 * @returns 胎元干支
 */
export function getTaiYuan(monthGan: string, monthZhi: string): string {
  const ganIndex = TIAN_GAN.indexOf(monthGan);
  const zhiIndex = DI_ZHI.indexOf(monthZhi);

  if (ganIndex === -1 || zhiIndex === -1) return '';

  // 月干进一位，月支进一位
  const taiYuanGan = TIAN_GAN[(ganIndex + 1) % 10];
  const taiYuanZhi = DI_ZHI[(zhiIndex + 1) % 12];

  return taiYuanGan + taiYuanZhi;
}

/**
 * 计算胎息
 * 胎息：日柱对冲（日干相差5位，日支相冲）
 * @param dayGan 日干
 * @param dayZhi 日支
 * @returns 胎息干支
 */
export function getTaiXi(dayGan: string, dayZhi: string): string {
  const ganIndex = TIAN_GAN.indexOf(dayGan);
  const zhiIndex = DI_ZHI.indexOf(dayZhi);

  if (ganIndex === -1 || zhiIndex === -1) return '';

  // 日干相差5位（阴阳相对）
  const taiXiGan = TIAN_GAN[(ganIndex + 5) % 10];

  // 日支相冲
  const taiXiZhi = DI_ZHI_XIANG_CHONG[dayZhi] || '';

  return taiXiGan + taiXiZhi;
}

/**
 * 计算命宫
 * 命宫：14 - (月支序号 + 时支序号) % 12
 * @param monthZhi 月支
 * @param hourZhi 时支
 * @returns 命宫干支
 */
export function getMingGong(monthZhi: string, hourZhi: string): string {
  const monthZhiIndex = DI_ZHI.indexOf(monthZhi);
  const hourZhiIndex = DI_ZHI.indexOf(hourZhi);

  if (monthZhiIndex === -1 || hourZhiIndex === -1) return '';

  // 计算命宫地支：14 - (月支序号 + 时支序号)，结果对12取模
  let mingGongZhiIndex = (14 - (monthZhiIndex + hourZhiIndex)) % 12;
  if (mingGongZhiIndex < 0) mingGongZhiIndex += 12;

  const mingGongZhi = DI_ZHI[mingGongZhiIndex];

  // 命宫天干需要根据年干推算（简化：使用寅月起正月的方法）
  // 这里使用简化算法：假设从甲子开始推算
  const mingGongGanIndex = mingGongZhiIndex % 10;
  const mingGongGan = TIAN_GAN[mingGongGanIndex];

  return mingGongGan + mingGongZhi;
}

/**
 * 计算身宫
 * 身宫：(月支序号 + 时支序号) % 12
 * @param monthZhi 月支
 * @param hourZhi 时支
 * @returns 身宫干支
 */
export function getShenGong(monthZhi: string, hourZhi: string): string {
  const monthZhiIndex = DI_ZHI.indexOf(monthZhi);
  const hourZhiIndex = DI_ZHI.indexOf(hourZhi);

  if (monthZhiIndex === -1 || hourZhiIndex === -1) return '';

  // 计算身宫地支：(月支序号 + 时支序号) % 12
  const shenGongZhiIndex = (monthZhiIndex + hourZhiIndex) % 12;
  const shenGongZhi = DI_ZHI[shenGongZhiIndex];

  // 身宫天干需要根据年干推算（简化：使用寅月起正月的方法）
  // 这里使用简化算法：假设从甲子开始推算
  const shenGongGanIndex = shenGongZhiIndex % 10;
  const shenGongGan = TIAN_GAN[shenGongGanIndex];

  return shenGongGan + shenGongZhi;
}

/**
 * 计算小运
 * 小运：男命阳年、女命阴年从时柱顺行；男命阴年、女命阳年从时柱逆行
 * @param hourGan 时干
 * @param hourZhi 时支
 * @param sex 性别（0:女, 1:男）
 * @param yearGan 年干
 * @param qiYunSui 起运岁数
 * @param count 计算小运数量（默认为起运岁数）
 * @returns 小运数组
 */
export function calculateXiaoYun(
  hourGan: string,
  hourZhi: string,
  sex: number,
  yearGan: string,
  qiYunSui: number,
  count?: number
): { ganZhi: string; age: number }[] {
  const xiaoYunList: { ganZhi: string; age: number }[] = [];

  // 判断年干阴阳
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  const isYangYear = yangGan.includes(yearGan);

  // 阳年男命、阴年女命顺行，阴年男命、阳年女命逆行
  const isShunXing = (sex === 1 && isYangYear) || (sex === 0 && !isYangYear);

  // 获取时柱在六十甲子中的索引
  let currentIndex = getGanZhiIndex(hourGan, hourZhi);
  if (currentIndex === -1) return [];

  // 小运从1岁开始，到起运岁数前一年
  const xiaoYunCount = count || qiYunSui - 1;

  for (let i = 0; i < xiaoYunCount; i++) {
    // 顺行加1，逆行减1
    currentIndex = isShunXing ? (currentIndex + 1) % 60 : (currentIndex - 1 + 60) % 60;

    const ganZhi = getGanZhi(currentIndex);
    const age = i + 1;

    xiaoYunList.push({
      ganZhi,
      age
    });
  }

  return xiaoYunList;
}

/**
 * 计算流月
 * 流月：从该年正月开始，按六十甲子顺推12个月
 * @param year 年份
 * @returns 流月数组
 */
export function calculateLiuYue(year: number): { month: number; ganZhi: string; monthName: string }[] {
  const { Solar } = require('lunar-javascript');
  const liuYueList: { month: number; ganZhi: string; monthName: string }[] = [];

  const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

  // 使用lunar-javascript库获取每个月的干支
  // 农历月份从正月（寅月）开始
  for (let i = 0; i < 12; i++) {
    // 使用该年的中旬日期来获取月干支（避免月初月末的边界问题）
    const month = i + 1;
    const solar = Solar.fromYmd(year, month, 15);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();
    const monthGan = eightChar.getMonthGan();
    const monthZhi = eightChar.getMonthZhi();
    const ganZhi = monthGan + monthZhi; // 拼接月柱干支

    liuYueList.push({
      month: i + 1,
      ganZhi,
      monthName: monthNames[i]
    });
  }

  return liuYueList;
}

/**
 * 计算流日
 * 流日：使用lunar-javascript库获取指定月份的每一天
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 流日数组
 */
export function calculateLiuRi(year: number, month: number): { day: number; ganZhi: string }[] {
  const liuRiList: { day: number; ganZhi: string }[] = [];

  // 获取该月的天数
  const daysInMonth = new Date(year, month, 0).getDate();

  // 计算该月每一天的干支
  // 使用简化算法：从1900年1月1日（庚戌日）开始推算
  const baseDate = new Date(1900, 0, 1); // 1900年1月1日是庚戌日
  const baseGanZhiIndex = getGanZhiIndex('庚', '戌'); // 46

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((currentDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

    const ganZhiIndex = (baseGanZhiIndex + daysDiff) % 60;
    const ganZhi = getGanZhi(ganZhiIndex);

    liuRiList.push({
      day,
      ganZhi
    });
  }

  return liuRiList;
}

/**
 * 计算流时
 * 流时：从子时开始，按六十甲子顺推12个时辰
 * @param dayGan 日干
 * @returns 流时数组
 */
export function calculateLiuShi(dayGan: string): { hour: number; ganZhi: string; hourName: string }[] {
  const liuShiList: { hour: number; ganZhi: string; hourName: string }[] = [];

  const hourNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

  // 日上起时法：甲己还加甲（甲日、己日子时起甲子）
  const ziShiGanMap: { [key: string]: number } = {
    '甲': 0, '己': 0,  // 甲
    '乙': 2, '庚': 2,  // 丙
    '丙': 4, '辛': 4,  // 戊
    '丁': 6, '壬': 6,  // 庚
    '戊': 8, '癸': 8   // 壬
  };

  const ziShiGanIndex = ziShiGanMap[dayGan] || 0;

  for (let i = 0; i < 12; i++) {
    const ganIndex = (ziShiGanIndex + i) % 10;
    const zhiIndex = i; // 子时从0开始

    const gan = TIAN_GAN[ganIndex];
    const zhi = DI_ZHI[zhiIndex];

    liuShiList.push({
      hour: i,
      ganZhi: gan + zhi,
      hourName: hourNames[i]
    });
  }

  return liuShiList;
}

/**
 * 分析干支留意关系
 * @param gans 天干数组（年月日时）
 * @param zhis 地支数组（年月日时）
 * @returns 干支留意分析结果
 */
export function analyzeGanZhiLiuYi(
  gans: string[],
  zhis: string[]
): {
  tianGanSheng: Array<{ gan1: string; gan2: string; position1: string; position2: string; relation: string }>;
  tianGanKe: Array<{ gan1: string; gan2: string; position1: string; position2: string; relation: string }>;
  tianGanChong: Array<{ gan1: string; gan2: string; position1: string; position2: string }>;
  diZhiBanHe: Array<{ zhi1: string; zhi2: string; position1: string; position2: string; wuXing: string }>;
  diZhiGongHe: Array<{ zhi1: string; zhi2: string; position1: string; position2: string; wuXing: string; missing: string }>;
  diZhiAnHe: Array<{ zhi1: string; zhi2: string; position1: string; position2: string; relation: string }>;
} {
  const positions = ['年', '月', '日', '时'];

  // 分析天干相生
  const tianGanSheng: Array<{ gan1: string; gan2: string; position1: string; position2: string; relation: string }> = [];
  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      const shengRelation = TIAN_GAN_XIANG_SHENG.find(
        r => (r.gan1 === gans[i] && r.gan2 === gans[j]) || (r.gan1 === gans[j] && r.gan2 === gans[i])
      );
      if (shengRelation) {
        tianGanSheng.push({
          gan1: gans[i],
          gan2: gans[j],
          position1: positions[i],
          position2: positions[j],
          relation: shengRelation.relation
        });
      }
    }
  }

  // 分析天干相克
  const tianGanKe: Array<{ gan1: string; gan2: string; position1: string; position2: string; relation: string }> = [];
  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      const keRelation = TIAN_GAN_XIANG_KE.find(
        r => (r.gan1 === gans[i] && r.gan2 === gans[j]) || (r.gan1 === gans[j] && r.gan2 === gans[i])
      );
      if (keRelation) {
        tianGanKe.push({
          gan1: gans[i],
          gan2: gans[j],
          position1: positions[i],
          position2: positions[j],
          relation: keRelation.relation
        });
      }
    }
  }

  // 分析天干相冲
  const tianGanChong: Array<{ gan1: string; gan2: string; position1: string; position2: string }> = [];
  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      if (TIAN_GAN_XIANG_CHONG[gans[i]] === gans[j]) {
        tianGanChong.push({
          gan1: gans[i],
          gan2: gans[j],
          position1: positions[i],
          position2: positions[j]
        });
      }
    }
  }

  // 分析地支半合
  const diZhiBanHe: Array<{ zhi1: string; zhi2: string; position1: string; position2: string; wuXing: string }> = [];
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const banHeRelation = DI_ZHI_BAN_HE.find(
        r => (r.zhi1 === zhis[i] && r.zhi2 === zhis[j]) || (r.zhi1 === zhis[j] && r.zhi2 === zhis[i])
      );
      if (banHeRelation) {
        diZhiBanHe.push({
          zhi1: zhis[i],
          zhi2: zhis[j],
          position1: positions[i],
          position2: positions[j],
          wuXing: banHeRelation.wuXing
        });
      }
    }
  }

  // 分析地支拱合
  const diZhiGongHe: Array<{ zhi1: string; zhi2: string; position1: string; position2: string; wuXing: string; missing: string }> = [];
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const gongHeRelation = DI_ZHI_GONG_HE.find(
        r => (r.zhi1 === zhis[i] && r.zhi2 === zhis[j]) || (r.zhi1 === zhis[j] && r.zhi2 === zhis[i])
      );
      if (gongHeRelation) {
        diZhiGongHe.push({
          zhi1: zhis[i],
          zhi2: zhis[j],
          position1: positions[i],
          position2: positions[j],
          wuXing: gongHeRelation.wuXing,
          missing: gongHeRelation.missing
        });
      }
    }
  }

  // 分析地支暗合
  const diZhiAnHe: Array<{ zhi1: string; zhi2: string; position1: string; position2: string; relation: string }> = [];
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const anHeRelation = DI_ZHI_AN_HE.find(
        r => (r.zhi1 === zhis[i] && r.zhi2 === zhis[j]) || (r.zhi1 === zhis[j] && r.zhi2 === zhis[i])
      );
      if (anHeRelation) {
        diZhiAnHe.push({
          zhi1: zhis[i],
          zhi2: zhis[j],
          position1: positions[i],
          position2: positions[j],
          relation: anHeRelation.relation
        });
      }
    }
  }

  return {
    tianGanSheng,
    tianGanKe,
    tianGanChong,
    diZhiBanHe,
    diZhiGongHe,
    diZhiAnHe
  };
}

/**
 * 计算九星（5种体系）
 * 使用lunar-javascript库的NineStar对象
 * @param lunar Lunar对象
 * @param yearGanZhiType 年干支类型
 * @param monthGanZhiType 月干支类型
 * @returns 九星信息（包含5种体系）
 */
export function calculateJiuXing(
  lunar: any,
  yearGanZhiType: number = 0,
  monthGanZhiType: number = 0
): {
  year: {
    wuXing: string;
    position: string;
    positionDesc: string;
    xuanKong: string;
    beiDou: string;
    qiMen: string;
    taiYi: string;
    qiMenLuck: string;
    xuanKongLuck: string;
  };
  month: {
    wuXing: string;
    position: string;
    positionDesc: string;
    xuanKong: string;
    beiDou: string;
    qiMen: string;
    taiYi: string;
    qiMenLuck: string;
    xuanKongLuck: string;
  };
  day: {
    wuXing: string;
    position: string;
    positionDesc: string;
    xuanKong: string;
    beiDou: string;
    qiMen: string;
    taiYi: string;
    qiMenLuck: string;
    xuanKongLuck: string;
  };
  hour: {
    wuXing: string;
    position: string;
    positionDesc: string;
    xuanKong: string;
    beiDou: string;
    qiMen: string;
    taiYi: string;
    qiMenLuck: string;
    xuanKongLuck: string;
  };
} {
  // 获取年九星
  const yearNineStar = lunar.getYearNineStar(yearGanZhiType + 1);
  // 获取月九星
  const monthNineStar = lunar.getMonthNineStar(monthGanZhiType + 2);
  // 获取日九星
  const dayNineStar = lunar.getDayNineStar();
  // 获取时九星
  const hourNineStar = lunar.getTimeNineStar();

  const getNineStarInfo = (nineStar: any) => {
    return {
      wuXing: nineStar.getWuXing() || '',
      position: nineStar.getPosition() || '',
      positionDesc: nineStar.getPositionDesc() || '',
      xuanKong: nineStar.getNameInXuanKong() || '',
      beiDou: nineStar.getNameInBeiDou() || '',
      qiMen: nineStar.getNameInQiMen() || '',
      taiYi: nineStar.getNameInTaiYi() || '',
      qiMenLuck: nineStar.getLuckInQiMen() || '',
      xuanKongLuck: nineStar.getLuckInXuanKong() || ''
    };
  };

  return {
    year: getNineStarInfo(yearNineStar),
    month: getNineStarInfo(monthNineStar),
    day: getNineStarInfo(dayNineStar),
    hour: getNineStarInfo(hourNineStar)
  };
}

/**
 * 生成详细分析文本
 * @param baziResult 八字排盘结果
 * @returns 详细分析文本
 */
export function generateDetailedAnalysis(
  dayGan: string,
  dayZhi: string,
  shiShenCount: { [key: string]: number },
  wuXingCount: { mu: number; huo: number; tu: number; jin: number; shui: number },
  geJuName: string,
  shenSha: string[][]
): {
  xingGeAnalysis: string;
  caiYunAnalysis: string;
  shiYeAnalysis: string;
  ganQingAnalysis: string;
  jiankangAnalysis: string;
} {
  // 性格分析
  const xingGeAnalysis = analyzeXingGe(dayGan, dayZhi, shiShenCount, wuXingCount);

  // 财运分析
  const caiYunAnalysis = analyzeCaiYun(shiShenCount, geJuName, wuXingCount);

  // 事业分析
  const shiYeAnalysis = analyzeShiYe(shiShenCount, geJuName, dayGan);

  // 感情分析
  const ganQingAnalysis = analyzeGanQing(dayGan, dayZhi, shiShenCount, shenSha);

  // 健康分析
  const jiankangAnalysis = analyzeJiankang(wuXingCount, dayGan);

  return {
    xingGeAnalysis,
    caiYunAnalysis,
    shiYeAnalysis,
    ganQingAnalysis,
    jiankangAnalysis
  };
}

/**
 * 性格分析
 */
function analyzeXingGe(
  dayGan: string,
  dayZhi: string,
  shiShenCount: { [key: string]: number },
  wuXingCount: { mu: number; huo: number; tu: number; jin: number; shui: number }
): string {
  const analysis: string[] = [];

  // 根据日干分析
  const ganWuXing = WU_XING_MAP[dayGan];
  switch (ganWuXing) {
    case '木':
      analysis.push('日主属木，性格仁慈宽厚，有同情心，喜欢帮助他人。');
      break;
    case '火':
      analysis.push('日主属火，性格热情开朗，积极向上，富有激情和创造力。');
      break;
    case '土':
      analysis.push('日主属土，性格稳重踏实，诚实守信，做事认真负责。');
      break;
    case '金':
      analysis.push('日主属金，性格刚毅果断，有原则性，做事干脆利落。');
      break;
    case '水':
      analysis.push('日主属水，性格聪明灵活，善于变通，思维敏捷。');
      break;
  }

  // 根据十神分析
  const biJianCount = (shiShenCount['比肩'] || 0) + (shiShenCount['劫财'] || 0);
  const shiShangCount = (shiShenCount['食神'] || 0) + (shiShenCount['伤官'] || 0);
  const yinCount = (shiShenCount['偏印'] || 0) + (shiShenCount['正印'] || 0);

  if (biJianCount >= 2) {
    analysis.push('比劫较多，性格独立自主，有主见，但有时过于固执。');
  }
  if (shiShangCount >= 2) {
    analysis.push('食伤较多，才华横溢，表达能力强，喜欢创新和表现自己。');
  }
  if (yinCount >= 2) {
    analysis.push('印星较多，学习能力强，重视精神生活，有文化修养。');
  }

  // 根据五行平衡分析
  const max = Math.max(wuXingCount.mu, wuXingCount.huo, wuXingCount.tu, wuXingCount.jin, wuXingCount.shui);
  const min = Math.min(wuXingCount.mu, wuXingCount.huo, wuXingCount.tu, wuXingCount.jin, wuXingCount.shui);

  if (max - min >= 4) {
    analysis.push('五行不平衡，性格可能有些极端，需要注意调和。');
  } else {
    analysis.push('五行较为平衡，性格温和，适应能力强。');
  }

  return analysis.join('');
}

/**
 * 财运分析
 */
function analyzeCaiYun(
  shiShenCount: { [key: string]: number },
  geJuName: string,
  wuXingCount: { mu: number; huo: number; tu: number; jin: number; shui: number }
): string {
  const analysis: string[] = [];

  const caiCount = (shiShenCount['偏财'] || 0) + (shiShenCount['正财'] || 0);
  const shiShangCount = (shiShenCount['食神'] || 0) + (shiShenCount['伤官'] || 0);
  const biJianCount = (shiShenCount['比肩'] || 0) + (shiShenCount['劫财'] || 0);

  if (caiCount >= 2) {
    analysis.push('财星较旺，财运较好，有赚钱的机会和能力。');
    if (shiShangCount >= 2) {
      analysis.push('食伤生财，能将才华转化为财富，适合自主创业。');
    }
  } else if (caiCount === 0) {
    analysis.push('八字无财星，对金钱不太敏感，需要培养理财意识。');
  } else {
    analysis.push('财星适中，财运平稳，需要通过努力获得财富。');
  }

  if (biJianCount >= 3 && caiCount >= 1) {
    analysis.push('比劫夺财，容易破财，需注意理财和防范小人。');
  }

  // 根据格局分析
  if (geJuName.includes('财格')) {
    analysis.push('财格之命，财运亨通，适合经商或从事金融行业。');
  } else if (geJuName.includes('从财')) {
    analysis.push('从财格，财运极佳，但需顺势而为，不可强求。');
  }

  return analysis.join('');
}

/**
 * 事业分析
 */
function analyzeShiYe(
  shiShenCount: { [key: string]: number },
  geJuName: string,
  dayGan: string
): string {
  const analysis: string[] = [];

  const guanCount = (shiShenCount['七杀'] || 0) + (shiShenCount['正官'] || 0);
  const yinCount = (shiShenCount['偏印'] || 0) + (shiShenCount['正印'] || 0);
  const shiShangCount = (shiShenCount['食神'] || 0) + (shiShenCount['伤官'] || 0);

  if (guanCount >= 2) {
    analysis.push('官杀较旺，有领导才能和责任心，适合从政或管理工作。');
    if (yinCount >= 1) {
      analysis.push('官印相生，事业发展顺利，名利双收。');
    }
  }

  if (shiShangCount >= 2) {
    analysis.push('食伤较旺，才华出众，适合技术、艺术或创意类工作。');
  }

  if (yinCount >= 2) {
    analysis.push('印星较旺，适合教育、文化、研究等行业。');
  }

  // 根据格局分析
  if (geJuName.includes('官格') || geJuName.includes('杀格')) {
    analysis.push('官杀格局，事业运强，有晋升机会，适合体制内发展。');
  } else if (geJuName.includes('食神格') || geJuName.includes('伤官格')) {
    analysis.push('食伤格局，适合自由职业或创业，发挥个人才华。');
  }

  return analysis.join('');
}

/**
 * 感情分析
 */
function analyzeGanQing(
  dayGan: string,
  dayZhi: string,
  shiShenCount: { [key: string]: number },
  shenSha: string[][]
): string {
  const analysis: string[] = [];

  // 检查桃花
  const allShenSha = shenSha.flat();
  const hasTaoHua = allShenSha.includes('桃花');
  const hasHongLuan = allShenSha.includes('红鸾');
  const hasHongYan = allShenSha.includes('红艳');

  if (hasTaoHua || hasHongLuan || hasHongYan) {
    analysis.push('命带桃花，异性缘佳，感情丰富，容易吸引异性。');
  }

  // 检查孤辰寡宿
  const hasGuChen = allShenSha.includes('孤辰');
  const hasGuaSu = allShenSha.includes('寡宿');

  if (hasGuChen || hasGuaSu) {
    analysis.push('命带孤辰寡宿，感情路上可能有波折，需要主动经营。');
  }

  // 根据财官分析（男女有别）
  const caiCount = (shiShenCount['偏财'] || 0) + (shiShenCount['正财'] || 0);
  const guanCount = (shiShenCount['七杀'] || 0) + (shiShenCount['正官'] || 0);

  if (caiCount >= 2) {
    analysis.push('财星较多，感情选择机会多，但需专一。');
  }

  if (guanCount >= 2) {
    analysis.push('官杀较多，感情中有责任感，重视承诺。');
  }

  if (analysis.length === 0) {
    analysis.push('感情运势平稳，需要主动把握机会，真诚对待感情。');
  }

  return analysis.join('');
}

/**
 * 健康分析
 */
function analyzeJiankang(
  wuXingCount: { mu: number; huo: number; tu: number; jin: number; shui: number },
  dayGan: string
): string {
  const analysis: string[] = [];

  // 检查五行缺失
  const queShi: string[] = [];
  if (wuXingCount.mu === 0) queShi.push('木');
  if (wuXingCount.huo === 0) queShi.push('火');
  if (wuXingCount.tu === 0) queShi.push('土');
  if (wuXingCount.jin === 0) queShi.push('金');
  if (wuXingCount.shui === 0) queShi.push('水');

  if (queShi.length > 0) {
    analysis.push(`五行缺${queShi.join('、')}，需注意相关脏腑的保养。`);

    queShi.forEach(wx => {
      switch (wx) {
        case '木':
          analysis.push('木主肝胆，需注意肝胆和神经系统健康。');
          break;
        case '火':
          analysis.push('火主心脏，需注意心血管和血液循环。');
          break;
        case '土':
          analysis.push('土主脾胃，需注意消化系统健康。');
          break;
        case '金':
          analysis.push('金主肺，需注意呼吸系统和皮肤健康。');
          break;
        case '水':
          analysis.push('水主肾，需注意泌尿系统和生殖系统。');
          break;
      }
    });
  }

  // 检查五行过旺
  const max = Math.max(wuXingCount.mu, wuXingCount.huo, wuXingCount.tu, wuXingCount.jin, wuXingCount.shui);
  if (max >= 5) {
    if (wuXingCount.mu === max) {
      analysis.push('木过旺，需注意肝火旺盛，保持心情舒畅。');
    } else if (wuXingCount.huo === max) {
      analysis.push('火过旺，需注意上火和心血管问题，保持冷静。');
    } else if (wuXingCount.tu === max) {
      analysis.push('土过旺，需注意脾胃负担，饮食要清淡。');
    } else if (wuXingCount.jin === max) {
      analysis.push('金过旺，需注意呼吸系统，避免燥热。');
    } else if (wuXingCount.shui === max) {
      analysis.push('水过旺，需注意寒湿，保持身体温暖。');
    }
  }

  if (analysis.length === 0) {
    analysis.push('五行较为平衡，身体健康状况良好，注意日常保养即可。');
  }

  return analysis.join('');
}

/**
 * 计算骨重（称骨算命）
 * @param yearGanZhi 年干支
 * @param monthZhi 月支
 * @param dayInChinese 农历日期（中文，如"初一"、"十五"）
 * @param hourZhi 时支
 * @param sex 性别（0:女, 1:男）
 * @returns 骨重信息
 */
export function calculateGuZhong(
  yearGanZhi: string,
  monthZhi: string,
  dayInChinese: string,
  hourZhi: string,
  sex: number
): {
  guZhong: number;
  guZhongText: string;
  piZhu: string;
} {
  // 获取各部分骨重
  const yearGuZhong = YEAR_GU_ZHONG[yearGanZhi] || 0;
  const monthGuZhong = MONTH_GU_ZHONG[monthZhi] || 0;
  const dayGuZhong = DAY_GU_ZHONG[dayInChinese] || 0;
  const hourGuZhong = HOUR_GU_ZHONG[hourZhi] || 0;

  // 计算总骨重
  let guZhong = yearGuZhong + monthGuZhong + dayGuZhong + hourGuZhong;

  // 限制范围
  guZhong = Math.max(guZhong, 21); // 最轻骨重为21（二两一钱）

  if (sex === 1) {
    // 男命最重骨重为72（七两二钱）
    guZhong = Math.min(guZhong, 72);
  } else {
    // 女命最重骨重为71（七两一钱）
    guZhong = Math.min(guZhong, 71);
  }

  // 转换为文字
  const guZhongText = guZhongToText(guZhong);

  // 获取批注
  const piZhu = sex === 1
    ? (GU_ZHONG_PI_ZHU_MAN[guZhong] || '命理解释暂缺')
    : (GU_ZHONG_PI_ZHU_WOMAN[guZhong] || '命理解释暂缺');

  return {
    guZhong,
    guZhongText,
    piZhu
  };
}

/**
 * 将骨重数字转换为中文
 * @param guZhong 骨重数字（如21、72）
 * @returns 中文表示（如"二两一钱"、"七两二钱"）
 */
export function guZhongToText(guZhong: number): string {
  const guZhongStr = guZhong.toString().padStart(2, '0');
  const liang = parseInt(guZhongStr[0]);
  const qian = parseInt(guZhongStr[1]);

  const numbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  let result = numbers[liang] + '两';
  if (qian !== 0) {
    result += numbers[qian] + '钱';
  }

  return result;
}

/**
 * 计算身强身弱
 * @param dayGan 日干
 * @param yearGan 年干
 * @param monthGan 月干
 * @param hourGan 时干
 * @param yearZhi 年支
 * @param monthZhi 月支
 * @param dayZhi 日支
 * @param hourZhi 时支
 * @returns 身强身弱判断结果
 */
export function calculateShenQiangShenRuo(
  dayGan: string,
  yearGan: string,
  monthGan: string,
  hourGan: string,
  yearZhi: string,
  monthZhi: string,
  dayZhi: string,
  hourZhi: string
): {
  result: '身强' | '身弱' | '中和';
  score: number;
  details: {
    yearGan: { relation: '身强' | '身弱'; score: number };
    monthGan: { relation: '身强' | '身弱'; score: number };
    hourGan: { relation: '身强' | '身弱'; score: number };
    yearZhi: { relation: '身强' | '身弱'; score: number };
    monthZhi: { relation: '身强' | '身弱'; score: number };
    dayZhi: { relation: '身强' | '身弱'; score: number };
    hourZhi: { relation: '身强' | '身弱'; score: number };
  };
  analysis: string;
} {
  // 导入常量
  const { GAN_ZHI_WU_XING_SHENG_KE } = require('../constants');

  let totalScore = 0;
  const details: any = {};

  // 计算年干的关系和分数
  const yearGanRelation = GAN_ZHI_WU_XING_SHENG_KE[dayGan + yearGan] || '身弱';
  const yearGanScore = yearGanRelation === '身强' ? 10 : -10;
  totalScore += yearGanScore;
  details.yearGan = { relation: yearGanRelation, score: yearGanScore };

  // 计算月干的关系和分数（月干权重最大）
  const monthGanRelation = GAN_ZHI_WU_XING_SHENG_KE[dayGan + monthGan] || '身弱';
  const monthGanScore = monthGanRelation === '身强' ? 30 : -30;
  totalScore += monthGanScore;
  details.monthGan = { relation: monthGanRelation, score: monthGanScore };

  // 计算时干的关系和分数
  const hourGanRelation = GAN_ZHI_WU_XING_SHENG_KE[dayGan + hourGan] || '身弱';
  const hourGanScore = hourGanRelation === '身强' ? 10 : -10;
  totalScore += hourGanScore;
  details.hourGan = { relation: hourGanRelation, score: hourGanScore };

  // 计算年支的关系和分数
  const yearZhiRelation = GAN_ZHI_WU_XING_SHENG_KE[dayGan + yearZhi] || '身弱';
  const yearZhiScore = yearZhiRelation === '身强' ? 5 : -5;
  totalScore += yearZhiScore;
  details.yearZhi = { relation: yearZhiRelation, score: yearZhiScore };

  // 计算月支的关系和分数（月支权重较大）
  const monthZhiRelation = GAN_ZHI_WU_XING_SHENG_KE[dayGan + monthZhi] || '身弱';
  const monthZhiScore = monthZhiRelation === '身强' ? 20 : -20;
  totalScore += monthZhiScore;
  details.monthZhi = { relation: monthZhiRelation, score: monthZhiScore };

  // 计算日支的关系和分数
  const dayZhiRelation = GAN_ZHI_WU_XING_SHENG_KE[dayGan + dayZhi] || '身弱';
  const dayZhiScore = dayZhiRelation === '身强' ? 15 : -15;
  totalScore += dayZhiScore;
  details.dayZhi = { relation: dayZhiRelation, score: dayZhiScore };

  // 计算时支的关系和分数
  const hourZhiRelation = GAN_ZHI_WU_XING_SHENG_KE[dayGan + hourZhi] || '身弱';
  const hourZhiScore = hourZhiRelation === '身强' ? 5 : -5;
  totalScore += hourZhiScore;
  details.hourZhi = { relation: hourZhiRelation, score: hourZhiScore };

  // 判断结果
  let result: '身强' | '身弱' | '中和';
  if (totalScore > 10) {
    result = '身强';
  } else if (totalScore < -10) {
    result = '身弱';
  } else {
    result = '中和';
  }

  // 生成分析文本
  const analysis = generateShenQiangShenRuoAnalysis(result, totalScore, details);

  return {
    result,
    score: totalScore,
    details,
    analysis
  };
}

/**
 * 生成身强身弱分析文本
 */
function generateShenQiangShenRuoAnalysis(
  result: '身强' | '身弱' | '中和',
  score: number,
  details: any
): string {
  let analysis = `综合评分：${score}分，判断为${result}。\n\n`;

  if (result === '身强') {
    analysis += '日主得到较多的生扶，身强有力。';
    analysis += '身强之人通常精力充沛，自信果断，适合从事竞争性强的工作。';
    analysis += '用神宜取克泄耗，如食伤、财星、官杀。';
  } else if (result === '身弱') {
    analysis += '日主受到较多的克泄耗，身弱无力。';
    analysis += '身弱之人通常需要他人帮助，适合从事技术性、辅助性的工作。';
    analysis += '用神宜取生扶，如比劫、印星。';
  } else {
    analysis += '日主生扶与克泄基本平衡，身强身弱适中。';
    analysis += '中和之命较为平稳，适应能力强，进退自如。';
    analysis += '用神需根据具体情况灵活选取。';
  }

  return analysis;
}

//=====================================================================
// 新增工具函数：重冲生肖、彭祖百忌、命卦、财运、桃花运、月将等
//=====================================================================

/**
 * 获取重冲生肖
 * @param yearZhi 年支
 * @param monthZhi 月支
 * @param dayZhi 日支
 * @param hourZhi 时支
 * @returns 各柱重冲的生肖
 */
export function getChongShengXiao(
  yearZhi: string,
  monthZhi: string,
  dayZhi: string,
  hourZhi: string
): { year: string; month: string; day: string; hour: string } {
  const DI_ZHI_CHONG: { [key: string]: string } = {
    '子': '午', '丑': '未', '寅': '申', '卯': '酉',
    '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
    '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
  };

  const getChongZhi = (zhi: string): string => DI_ZHI_CHONG[zhi] || '';
  const getShengXiao = (zhi: string): string => {
    const idx = DI_ZHI.indexOf(zhi);
    return idx >= 0 ? SHENG_XIAO[idx] : '';
  };

  return {
    year: getShengXiao(getChongZhi(yearZhi)),
    month: getShengXiao(getChongZhi(monthZhi)),
    day: getShengXiao(getChongZhi(dayZhi)),
    hour: getShengXiao(getChongZhi(hourZhi))
  };
}

/**
 * 获取彭祖百忌
 * @param dayGan 日干
 * @param dayZhi 日支
 * @returns 彭祖百忌
 */
export function getPengZuBaiJi(dayGan: string, dayZhi: string): { gan: string; zhi: string } {
  return {
    gan: PENG_ZU_BAI_JI_GAN[dayGan] || '',
    zhi: PENG_ZU_BAI_JI_ZHI[dayZhi] || ''
  };
}

/**
 * 获取命卦
 * @param lunarYear 农历年份
 * @param sex 性别 1=男 0=女
 * @returns 命卦
 */
export function getMingGua(lunarYear: number, sex: number): string {
  // 计算年份合数
  let yearStr = String(lunarYear);
  let yearCount = 0;
  for (let i = 0; i < yearStr.length; i++) {
    yearCount += parseInt(yearStr[i]);
  }

  // 若大于10，继续相加直至小于10
  while (yearCount > 10) {
    let temp = yearCount;
    yearCount = 0;
    yearStr = String(temp);
    for (let i = 0; i < yearStr.length; i++) {
      yearCount += parseInt(yearStr[i]);
    }
  }

  let mingGuaNum: number;

  if (sex === 1) {
    // 男命：(11 - 年数合数)，若等于5则寄坤宫
    mingGuaNum = 11 - yearCount;
    if (mingGuaNum === 5) mingGuaNum = 2;
  } else {
    // 女命：(年数合数 + 4)，若大于9则-9
    mingGuaNum = yearCount + 4;
    if (mingGuaNum > 9) mingGuaNum -= 9;
    if (mingGuaNum === 5) mingGuaNum = 8; // 女命5寄艮宫
  }

  return MING_GUA_MAP[mingGuaNum] || '';
}

/**
 * 获取月将
 * @param currentJieQi 当前节气
 * @returns 月将和月将神
 */
export function getYueJiang(currentJieQi: string): { yueJiang: string; yueJiangShen: string } {
  // 根据当前节气获取月将
  const yueJiangZhi = JIE_QI_YUE_JIANG[currentJieQi] || '子';

  // 获取对应的月将神
  for (const key in YUE_JIANG) {
    if (YUE_JIANG[key].yueJiang === yueJiangZhi) {
      return YUE_JIANG[key];
    }
  }

  return { yueJiang: yueJiangZhi, yueJiangShen: '' };
}

/**
 * 获取日柱论命
 * @param dayGanZhi 日柱干支
 * @returns 论命结果
 */
export function getRiZhuLunMing(dayGanZhi: string): string {
  return RI_ZHU_LUN_MING[dayGanZhi] || '';
}

/**
 * 计算财运 - 正财年份
 * @param dayGan 日干
 * @param daYun 大运数组
 * @param liuNian 流年数组
 * @returns 正财年份数组
 */
export function calculateZhengCai(
  dayGan: string,
  daYun: { ganZhi: string; startAge: number }[],
  liuNian: { ganZhi: string; year: number; age: number }[]
): { ganZhi: string; year: number; age: number }[] {
  const zhengCaiZhis = RI_ZHU_ZHENG_CAI[dayGan] || [];
  const result: { ganZhi: string; year: number; age: number }[] = [];

  // 在大运中查找正财
  daYun.forEach(dy => {
    const zhi = dy.ganZhi[1];
    if (zhengCaiZhis.includes(zhi)) {
      result.push({
        ganZhi: dy.ganZhi,
        year: 0, // 大运年份不固定
        age: dy.startAge
      });
    }
  });

  // 在流年中查找正财
  liuNian.forEach(ln => {
    const zhi = ln.ganZhi[1];
    if (zhengCaiZhis.includes(zhi)) {
      result.push({
        ganZhi: ln.ganZhi,
        year: ln.year,
        age: ln.age
      });
    }
  });

  return result;
}

/**
 * 计算财运 - 偏财年份
 * @param dayGan 日干
 * @param daYun 大运数组
 * @param liuNian 流年数组
 * @returns 偏财年份数组
 */
export function calculatePianCai(
  dayGan: string,
  daYun: { ganZhi: string; startAge: number }[],
  liuNian: { ganZhi: string; year: number; age: number }[]
): { ganZhi: string; year: number; age: number }[] {
  const pianCaiZhis = RI_ZHU_PIAN_CAI[dayGan] || [];
  const result: { ganZhi: string; year: number; age: number }[] = [];

  daYun.forEach(dy => {
    const zhi = dy.ganZhi[1];
    if (pianCaiZhis.includes(zhi)) {
      result.push({
        ganZhi: dy.ganZhi,
        year: 0,
        age: dy.startAge
      });
    }
  });

  liuNian.forEach(ln => {
    const zhi = ln.ganZhi[1];
    if (pianCaiZhis.includes(zhi)) {
      result.push({
        ganZhi: ln.ganZhi,
        year: ln.year,
        age: ln.age
      });
    }
  });

  return result;
}

/**
 * 计算桃花运 - 正桃花
 * @param dayGan 日干
 * @param sex 性别
 * @param daYun 大运数组
 * @param liuNian 流年数组
 * @returns 正桃花年份数组
 */
export function calculateZhengTaoHua(
  dayGan: string,
  sex: number,
  daYun: { ganZhi: string; startAge: number }[],
  liuNian: { ganZhi: string; year: number; age: number }[]
): { ganZhi: string; year: number; age: number }[] {
  // 男命正桃花等于正财
  if (sex === 1) {
    return calculateZhengCai(dayGan, daYun, liuNian);
  }

  // 女命正桃花
  const zhengTaoHuaZhis = NV_RI_ZHU_ZHENG_TAO_HUA[dayGan] || [];
  const result: { ganZhi: string; year: number; age: number }[] = [];

  daYun.forEach(dy => {
    const zhi = dy.ganZhi[1];
    if (zhengTaoHuaZhis.includes(zhi)) {
      result.push({ ganZhi: dy.ganZhi, year: 0, age: dy.startAge });
    }
  });

  liuNian.forEach(ln => {
    const zhi = ln.ganZhi[1];
    if (zhengTaoHuaZhis.includes(zhi)) {
      result.push({ ganZhi: ln.ganZhi, year: ln.year, age: ln.age });
    }
  });

  return result;
}

/**
 * 计算桃花运 - 偏桃花
 * @param dayGan 日干
 * @param sex 性别
 * @param daYun 大运数组
 * @param liuNian 流年数组
 * @returns 偏桃花年份数组
 */
export function calculatePianTaoHua(
  dayGan: string,
  sex: number,
  daYun: { ganZhi: string; startAge: number }[],
  liuNian: { ganZhi: string; year: number; age: number }[]
): { ganZhi: string; year: number; age: number }[] {
  // 男命偏桃花等于偏财
  if (sex === 1) {
    return calculatePianCai(dayGan, daYun, liuNian);
  }

  // 女命偏桃花
  const pianTaoHuaZhis = NV_RI_ZHU_PIAN_TAO_HUA[dayGan] || [];
  const result: { ganZhi: string; year: number; age: number }[] = [];

  daYun.forEach(dy => {
    const zhi = dy.ganZhi[1];
    if (pianTaoHuaZhis.includes(zhi)) {
      result.push({ ganZhi: dy.ganZhi, year: 0, age: dy.startAge });
    }
  });

  liuNian.forEach(ln => {
    const zhi = ln.ganZhi[1];
    if (pianTaoHuaZhis.includes(zhi)) {
      result.push({ ganZhi: ln.ganZhi, year: ln.year, age: ln.age });
    }
  });

  return result;
}

/**
 * 获取九星吉凶
 * @param jiuXing 九星名称
 * @param type 类型：qiMen-奇门九星，xuanKong-玄空九星
 * @returns 吉凶结果
 */
export function getJiuXingLuck(jiuXing: string, type: 'qiMen' | 'xuanKong'): string {
  if (type === 'qiMen') {
    return JIU_XING_QI_MEN_JI_XIONG[jiuXing] || '';
  }
  return JIU_XING_XUAN_KONG_JI_XIONG[jiuXing] || '';
}
