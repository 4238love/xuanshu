/**
 * 紫微斗数排盘页
 *
 * 排盘引擎复用 Web 端 TS 算法层（已编译到 /lib/ziwei）。
 * 十二宫以 gongWei 对象存储（key 为地支），顺序取 shiErGongDiZhi，保证与传统盘一致。
 */

const kit = require('../../../../utils/chart-kit.js');
const preferences = require('../../../../utils/preferences.js');
const { createZiWeiPaiPan } = require('../../../../lib/ziwei/index.js');

const WU_XING_JU_TYPES = [
  { label: '年干 + 命宫地支', value: 0 },
  { label: '命宫天干 + 命宫地支', value: 1 },
];

function buildViewModel(result) {
  const zhiList = result.shiErGongDiZhi || Object.keys(result.gongWei || {});
  const daXian = result.daXian || [];

  const gongs = zhiList.map((zhi, index) => {
    const gong = (result.gongWei && result.gongWei[zhi]) || {};
    const zhuXing = gong.zhuXing || [];
    const relations = gong.zhuXingGuanXi || [];

    return {
      key: zhi,
      name: gong.name || '',
      zhi,
      gan: gong.tianGan || '',
      isMing: Boolean(gong.isMingGong),
      isShen: Boolean(gong.isShenGong),
      zhuXing: zhuXing.map((star, starIndex) => ({
        star,
        relation: relations[starIndex] || '',
        label: relations[starIndex] ? `${star}（${relations[starIndex]}）` : star,
      })),
      hasZhuXing: zhuXing.length > 0,
      auxStars: gong.auxStars || [],
      minorStars: gong.minorStars || [],
      siHuaText: (gong.siHua || []).join(' '),
      zhangSheng: gong.zhangSheng || '',
      daXianText: daXian[index] ? `${daXian[index]} 岁` : '',
    };
  });

  const siHua = kit.rows([
    kit.kv('化禄', result.huaLu),
    kit.kv('化权', result.huaQuan),
    kit.kv('化科', result.huaKe),
    kit.kv('化忌', result.huaJi),
  ]);

  const metaRows = kit.rows([
    kit.kv('公历', result.solar),
    kit.kv('农历', result.lunar),
    kit.kv('四柱', `${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.hourGanZhi}`),
    kit.kv('命主', result.mingZhu),
    kit.kv('身主', result.shenZhu),
    kit.kv('节气', result.chuShengJie),
  ]);

  const mingGong = gongs.find((gong) => gong.isMing);

  const reportText = kit.report(`${result.wuXingJu} · 命宫${result.mingGong}`, [
    {
      title: '命盘信息',
      items: [
        `公历：${result.solar}`,
        `农历：${result.lunar}`,
        `四柱：${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.hourGanZhi}`,
        `五行局：${result.wuXingJu}　命宫：${result.mingGong}　身宫：${result.shenGong}`,
        `命主：${result.mingZhu || '—'}　身主：${result.shenZhu || '—'}`,
        `四化：禄 ${result.huaLu} / 权 ${result.huaQuan} / 科 ${result.huaKe} / 忌 ${result.huaJi}`,
      ],
    },
    {
      title: '十二宫',
      items: gongs.map((gong) => {
        const stars = gong.zhuXing.map((item) => item.label).join(' ');
        const aux = gong.auxStars.concat(gong.minorStars).join(' ');
        return `${gong.name}（${gong.gan}${gong.zhi}）${gong.daXianText ? ` [${gong.daXianText}]` : ''}：${stars || '无主星'}${aux ? `　${aux}` : ''}`;
      }),
    },
  ]);

  const headMetrics = [
    { label: '命宫', value: result.mingGong || '—' },
    { label: '身宫', value: result.shenGong || '—' },
    { label: '命主', value: result.mingZhu || '—' },
    { label: '身主', value: result.shenZhu || '—' },
    { label: '命宫主星', value: mingGong && mingGong.zhuXing.length ? mingGong.zhuXing.map((item) => item.star).join(' · ') : '无主星' },
  ];

  return {
    title: result.wuXingJu,
    sub: `命宫 ${result.mingGong} · 身宫 ${result.shenGong} · ${result.sex || ''}`,
    gongs,
    siHua,
    headMetrics,
    metaRows,
    mingGongName: mingGong ? mingGong.name : '命宫',
    reportText,
  };
}

Page(
  Object.assign({}, kit.formHandlers, {
    aiType: 'ziwei',

    data: {
      mode: 'form',
      statusBarHeight: 20,
      loading: false,
      error: '',
      showOccupy: false,
      occupyLabel: '占事',

      settings: {
        name: '',
        occupy: '',
        sex: 1,
        dateType: 0,
        date: kit.DEFAULT_DATE,
        wuXingJuType: 0,
      },

      solarDate: '1990-01-01',
      timeValue: '08:30',

      wuXingJuTypes: WU_XING_JU_TYPES,

      vm: null,
      ai: kit.freshAi(),
    },

    onLoad() {
      kit.initPage(this, { wuXingJuType: 0 });
    },

    onShow() {
      this.hapticEnabled = preferences.read().haptic;
    },

    onSubmit() {
      kit.submit(this, {
        create: createZiWeiPaiPan,
        buildVm: buildViewModel,
      });
    },

    onShareAppMessage() {
      const vm = this.data.vm;
      return {
        title: vm ? `紫微 · ${vm.title}` : '玄数排盘 · 紫微斗数',
        path: '/packages/ziwei/pages/ziwei/ziwei',
      };
    },
  })
);
