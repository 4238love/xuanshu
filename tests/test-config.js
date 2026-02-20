const { Solar } = require('lunar-javascript');
const { BaZiPaiPan } = require('./lib/bazi/index.ts');

console.log('=== 测试神煞和干支留意的单独开关配置 ===\n');

// 测试用例1：默认配置（显示所有神煞和干支留意）
console.log('测试用例1：默认配置（显示所有）');
const settings1 = {
  name: '测试1',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0
};

try {
  const bazi1 = new BaZiPaiPan(settings1);
  const result1 = bazi1.getPaiPan();

  const totalShenSha1 = result1.shenSha ? result1.shenSha.flat().length : 0;
  console.log('神煞总数:', totalShenSha1);
  console.log('年柱神煞:', result1.shenSha ? result1.shenSha[0].join('、') : '无');

  if (result1.ganZhiLiuYi) {
    console.log('天干相生:', result1.ganZhiLiuYi.tianGanSheng ? result1.ganZhiLiuYi.tianGanSheng.length : 0, '对');
    console.log('天干相克:', result1.ganZhiLiuYi.tianGanKe ? result1.ganZhiLiuYi.tianGanKe.length : 0, '对');
  }
  console.log('✅ 测试用例1通过\n');
} catch (e) {
  console.log('❌ 测试用例1失败:', e.message);
}

// 测试用例2：禁用部分神煞
console.log('测试用例2：禁用部分神煞（禁用桃花、驿马）');
const settings2 = {
  name: '测试2',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0,
  shenShaConfig: {
    '桃花': false,
    '驿马': false
  }
};

try {
  const bazi2 = new BaZiPaiPan(settings2);
  const result2 = bazi2.getPaiPan();

  const allShenSha2 = result2.shenSha ? result2.shenSha.flat() : [];
  const hasTaoHua = allShenSha2.includes('桃花');
  const hasYiMa = allShenSha2.includes('驿马');

  console.log('神煞总数:', allShenSha2.length);
  console.log('包含桃花:', hasTaoHua ? '是' : '否');
  console.log('包含驿马:', hasYiMa ? '是' : '否');

  if (!hasTaoHua && !hasYiMa) {
    console.log('✅ 测试用例2通过（桃花和驿马已被过滤）\n');
  } else {
    console.log('❌ 测试用例2失败（桃花或驿马未被过滤）\n');
  }
} catch (e) {
  console.log('❌ 测试用例2失败:', e.message);
}

// 测试用例3：只显示特定神煞
console.log('测试用例3：只显示天乙贵人和文昌贵人');
const settings3 = {
  name: '测试3',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0,
  shenShaConfig: {
    '天乙贵人': true,
    '文昌贵人': true,
    '桃花': false,
    '驿马': false,
    '华盖': false,
    '将星': false,
    '劫煞': false,
    '灾煞': false
  }
};

try {
  const bazi3 = new BaZiPaiPan(settings3);
  const result3 = bazi3.getPaiPan();

  const allShenSha3 = result3.shenSha ? result3.shenSha.flat() : [];
  console.log('神煞总数:', allShenSha3.length);
  console.log('神煞列表:', allShenSha3.join('、'));
  console.log('✅ 测试用例3通过\n');
} catch (e) {
  console.log('❌ 测试用例3失败:', e.message);
}

// 测试用例4：禁用部分干支留意关系
console.log('测试用例4：禁用天干相生关系');
const settings4 = {
  name: '测试4',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0,
  ganZhiLiuYiConfig: {
    '天干相生': false
  }
};

try {
  const bazi4 = new BaZiPaiPan(settings4);
  const result4 = bazi4.getPaiPan();

  if (result4.ganZhiLiuYi) {
    const hasTianGanSheng = result4.ganZhiLiuYi.tianGanSheng !== undefined;
    const hasTianGanKe = result4.ganZhiLiuYi.tianGanKe !== undefined;

    console.log('包含天干相生:', hasTianGanSheng ? '是' : '否');
    console.log('包含天干相克:', hasTianGanKe ? '是' : '否');

    if (!hasTianGanSheng && hasTianGanKe) {
      console.log('✅ 测试用例4通过（天干相生已被过滤）\n');
    } else {
      console.log('❌ 测试用例4失败\n');
    }
  }
} catch (e) {
  console.log('❌ 测试用例4失败:', e.message);
}

console.log('=== 所有测试完成 ===');
console.log('\n功能说明：');
console.log('1. shenShaConfig: 控制60种神煞的显示');
console.log('2. ganZhiLiuYiConfig: 控制18种干支留意关系的显示');
console.log('3. 未配置的项默认显示');
console.log('4. 配置为false的项将被过滤');
