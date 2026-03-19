/**
 * 真太阳时工具
 * 用于根据地理经度调整时间
 */

// 中国主要城市经度数据（东经）
export const CITY_LONGITUDE: { [key: string]: number } = {
  // 直辖市
  '北京': 116.4,
  '上海': 121.5,
  '天津': 117.2,
  '重庆': 106.5,

  // 省会城市
  '哈尔滨': 126.6,
  '长春': 125.3,
  '沈阳': 123.4,
  '呼和浩特': 111.7,
  '石家庄': 114.5,
  '乌鲁木齐': 87.6,
  '兰州': 103.8,
  '西宁': 101.8,
  '西安': 108.9,
  '银川': 106.3,
  '郑州': 113.6,
  '济南': 117.0,
  '太原': 112.5,
  '合肥': 117.3,
  '武汉': 114.3,
  '长沙': 113.0,
  '南京': 118.8,
  '成都': 104.1,
  '贵阳': 106.7,
  '昆明': 102.7,
  '南宁': 108.3,
  '拉萨': 91.1,
  '杭州': 120.2,
  '南昌': 115.9,
  '广州': 113.3,
  '福州': 119.3,
  '台北': 121.5,
  '海口': 110.3,
  '香港': 114.2,
  '澳门': 113.5,

  // 其他重要城市
  '深圳': 114.1,
  '青岛': 120.4,
  '大连': 121.6,
  '宁波': 121.6,
  '厦门': 118.1,
  '苏州': 120.6,
  '无锡': 120.3,
  '佛山': 113.1,
  '东莞': 113.8,
  '泉州': 118.6,
  '温州': 120.7,
  '珠海': 113.6,
  '中山': 113.4,
  '惠州': 114.4,
  '嘉兴': 120.8,
  '南通': 121.0,
  '金华': 119.6,
  '保定': 115.5,
  '烟台': 121.4,
  '洛阳': 112.5,
  '常州': 119.9,
  '徐州': 117.2,
  '潍坊': 119.1,
  '绍兴': 120.6,
  '扬州': 119.4,
  '盐城': 120.1,
  '临沂': 118.4,
  '唐山': 118.2,
  '邯郸': 114.5,
  '江门': 113.1,
  '威海': 122.1,
  '淄博': 118.1,
  '包头': 110.0,
  '株洲': 113.2,
  '镇江': 119.4,
  '桂林': 110.3,
  '三亚': 109.5,
  '台州': 121.4,
  '湖州': 120.1,
  '漳州': 117.6,
  '揭阳': 116.4,
  '肇庆': 112.5,
  '新乡': 113.9,
  '湛江': 110.4,
  '咸阳': 108.7,
  '芜湖': 118.4,
  '连云港': 119.2,
  '柳州': 109.4,
  '鞍山': 123.0,
  '沧州': 116.8,
  '九江': 116.0,
  '抚顺': 123.9,
  '襄阳': 112.1,
  '宜昌': 111.3,
  '赣州': 114.9,
  '泰州': 119.9,
  '荆州': 112.2,
  '宿迁': 118.3,
  '马鞍山': 118.5,
  '南阳': 112.5,
  '阜阳': 115.8,
  '商丘': 115.7,
  '吉林': 126.6,
  '大庆': 125.1,
  '许昌': 113.8,
  '宝鸡': 107.1,
  '秦皇岛': 119.6,
  '上饶': 117.9,
  '营口': 122.2,
  '信阳': 114.1,
  '衡阳': 112.6,
  '黄冈': 114.9,
  '滁州': 118.3,
  '茂名': 110.9,
  '安阳': 114.4,
  '宜春': 114.4,
  '遵义': 106.9,
  '周口': 114.6,
  '聊城': 115.9,
  '黄石': 115.0,
  '岳阳': 113.1,
  '德州': 116.3,
  '淮安': 119.0,
  '汕头': 116.7,
  '梅州': 116.1,
  '邢台': 114.5,
  '龙岩': 117.0,
  '菏泽': 115.5,
  '三明': 117.6,
  '十堰': 110.8,
  '宣城': 118.8,
  '莆田': 119.0,
  '邵阳': 111.5,
  '南平': 118.2,
  '孝感': 113.9,
  '齐齐哈尔': 123.9,
  '焦作': 113.2,
  '平顶山': 113.3,
  '驻马店': 114.0,
  '蚌埠': 117.4,
  '景德镇': 117.2,
  '开封': 114.3,
  '濮阳': 115.0,
  '荆门': 112.2,
  '鄂州': 114.9,
  '丹东': 124.4,
  '锦州': 121.1,
  '安庆': 117.0,
  '晋中': 112.8,
  '运城': 111.0,
  '南充': 106.1,
  '六安': 116.5,
  '宿州': 116.9,
  '通辽': 122.3,
  '亳州': 115.8,
  '宁德': 119.5,
  '枣庄': 117.3,
  '达州': 107.5,
  '盘锦': 122.1,
  '宜宾': 104.6,
  '铜陵': 117.8,
  '承德': 117.9,
  '广元': 105.8,
  '忻州': 112.7,
  '绵阳': 104.7,
  '新余': 114.9,
  '葫芦岛': 120.9,
  '吕梁': 111.1,
  '黔东南': 107.9,
  '内江': 105.1,
  '鹰潭': 117.0,
  '抚州': 116.4,
  '乐山': 103.8,
  '泸州': 105.4,
  '延安': 109.5,
  '汉中': 107.0,
  '安康': 109.0,
  '商洛': 109.9,
  '榆林': 109.7,
  '渭南': 109.5
};

/**
 * 计算真太阳时
 * @param date 原始时间
 * @param longitude 经度（东经为正，西经为负）
 * @returns 调整后的真太阳时
 */
export function calculateTrueSolarTime(date: Date, longitude: number): Date {
  return calculateTrueSolarTimeAccurate(date, longitude);
}

/**
 * 计算真太阳时（精确版）
 * @param date 原始时间
 * @param longitude 经度
 * @returns 调整后的真太阳时
 */
export function calculateTrueSolarTimeAccurate(date: Date, longitude: number): Date {
  // 平太阳时时差
  const offset = (longitude - 120) * 4;

  // 结合均时差与经度差，按常用天文近似公式修正为真太阳时
  const dayOfYear = getDayOfYear(date);
  const correction = calculateEquationOfTime(dayOfYear);

  // 总时差
  const totalOffset = offset + correction;

  return new Date(date.getTime() + totalOffset * 60 * 1000);
}

/**
 * 计算一年中的第几天
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * 计算均时差（分钟）
 * @param dayOfYear 一年中的第几天
 * @returns 均时差（分钟）
 */
function calculateEquationOfTime(dayOfYear: number): number {
  // 常用均时差近似公式，精度足以覆盖排盘场景中的分钟级修正
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  const E = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  return E;
}

/**
 * 根据城市名称获取经度
 * @param city 城市名称
 * @returns 经度，如果城市不存在则返回null
 */
export function getLongitudeByCity(city: string): number | null {
  const normalizedCity = city.trim().replace(/市$/, '');
  return CITY_LONGITUDE[normalizedCity] || null;
}

/**
 * 获取所有支持的城市列表
 * @returns 城市名称数组
 */
export function getSupportedCities(): string[] {
  return Object.keys(CITY_LONGITUDE).sort();
}

/**
 * 根据城市名称计算真太阳时
 * @param date 原始时间
 * @param city 城市名称
 * @returns 调整后的真太阳时，如果城市不存在则返回原始时间
 */
export function calculateTrueSolarTimeByCity(date: Date, city: string): Date {
  const longitude = getLongitudeByCity(city);
  if (longitude === null) {
    return date;
  }
  return calculateTrueSolarTimeAccurate(date, longitude);
}
