/**
 * 奇门遁甲排盘页
 *
 * 排盘引擎复用 Web 端 TS 算法层（已编译到 /lib/qimen）。
 * 结果里的 diPan / tianPan / renPan / shenPan 都是长度 9 的数组，
 * 下标 = 宫位号 - 1（坎1 → 0，离9 → 8），这里按洛书方位重排成九宫格。
 */

const kit = require('../../../../utils/chart-kit.js');
const preferences = require('../../../../utils/preferences.js');
const { createQiMenPaiPan } = require('../../../../lib/qimen/index.js');

const PAN_TYPES = [
  { label: '时家', value: 3 },
  { label: '日家', value: 2 },
  { label: '月家', value: 1 },
  { label: '年家', value: 0 },
];

const ZHI_SHI_TYPES = [
  { label: '天禽用死门', value: 0 },
  { label: '按阴阳遁', value: 1 },
  { label: '按节气', value: 2 },
];

/** 洛书九宫布局：巽4 离9 坤2 / 震3 中5 兑7 / 艮8 坎1 乾6 */
const GONG_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];
const GONG_NAME = { 1: '坎', 2: '坤', 3: '震', 4: '巽', 5: '中', 6: '乾', 7: '兑', 8: '艮', 9: '离' };

function buildViewModel(result) {
  const diPan = result.diPan || [];
  const tianPan = result.tianPan || [];
  const renPan = result.renPan || [];
  const shenPan = result.shenPan || [];
  const qiYiTianQinNo = result.tianPanQiYiTianQinNo || [];
  const qiYiTianQinYes = result.tianPanQiYiTianQinYes || [];
  const kongGong = result.liuJiaXunKongGongWei || [];

  const palaces = GONG_ORDER.map((gong) => {
    const index = gong - 1;
    const qiYi = qiYiTianQinNo[index] || qiYiTianQinYes[index] || '';
    return {
      key: String(gong),
      gong,
      name: `${GONG_NAME[gong]}${gong}`,
      isCenter: gong === 5,
      // 中五宫在转盘里不布神、星、门，给个占位符避免九宫格出现空行
      shen: shenPan[index] || '—',
      xing: tianPan[index] || '—',
      qiYi,
      men: renPan[index] || '—',
      diPan: diPan[index] || '—',
      kong: kongGong.indexOf(gong) !== -1,
    };
  });

  const infoRows = kit.rows([
    kit.kv('局式', result.juShu),
    kit.kv('阴阳遁', result.yinYangDun),
    kit.kv('节气', `${result.jieQi || ''} ${result.sanYuan || ''}`.trim()),
    kit.kv('符头', result.fuTou),
    kit.kv('旬首', `${result.xunShou || ''}${result.xunShouYiZhang ? `（${result.xunShouYiZhang}）` : ''}`),
    kit.kv('值符', result.zhiFu),
    kit.kv('值使', result.zhiShi),
    kit.kv('天乙', result.tianYi),
    kit.kv('地乙', result.diYi),
    kit.kv('太乙', result.taiYi),
    kit.kv('旬空', (result.liuJiaXunKong || []).join('')),
    kit.kv('马星', result.yiMa ? `${result.yiMa}（${GONG_NAME[result.yiMaGongWei] || ''}${result.yiMaGongWei || ''}宫）` : ''),
  ]);

  const metaRows = kit.rows([
    kit.kv('公历', result.solar),
    kit.kv('农历', result.lunar),
    kit.kv('四柱', `${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.hourGanZhi}`),
    kit.kv('节气区间', result.chuShengJie),
  ]);

  const marks = [
    { label: '六仪击刑', items: result.liuYiJiXing || [], tone: 'warn' },
    { label: '奇仪入墓', items: result.qiYiRuMu || [], tone: 'warn' },
    {
      label: '动应',
      items: (result.dongYing || []).map((item) => item.description || item.type),
      tone: 'jade',
    },
    {
      label: '克应',
      items: (result.keYing || []).map((item) => item.description || item.type),
      tone: 'jade',
    },
  ].filter((group) => group.items.length > 0);

  const reportText = kit.report(`${result.juShu} · ${result.zhiFu} / ${result.zhiShi}`, [
    {
      title: '局式',
      items: [
        `公历：${result.solar}`,
        `农历：${result.lunar}`,
        `四柱：${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.hourGanZhi}`,
        `局式：${result.juShu}　节气：${result.jieQi}　${result.sanYuan}`,
        `符头：${result.fuTou}　旬首：${result.xunShou}　值符：${result.zhiFu}　值使：${result.zhiShi}`,
        `占事：${result.occupy || '未填写'}`,
      ],
    },
    {
      title: '九宫',
      items: palaces.map(
        (item) => `${item.name}宫：${item.shen} ${item.xing}${item.qiYi} ${item.men}　地盘 ${item.diPan}`
      ),
    },
    ...marks.map((group) => ({ title: group.label, items: group.items })),
  ]);

  return {
    title: result.juShu,
    sub: `值符 ${result.zhiFu} · 值使 ${result.zhiShi} · ${result.jieQi}${result.sanYuan || ''}`,
    yinYangDun: result.yinYangDun || '',
    jieQiText: `${result.jieQi || ''}${result.sanYuan || ''}`,
    palaces,
    infoRows,
    metaRows,
    marks,
    reportText,
  };
}

Page(
  Object.assign({}, kit.formHandlers, {
    aiType: 'qimen',

    data: {
      mode: 'form',
      statusBarHeight: 20,
      loading: false,
      error: '',
      showOccupy: true,
      occupyLabel: '所占何事',

      settings: {
        name: '',
        occupy: '',
        sex: 1,
        dateType: 0,
        date: kit.DEFAULT_DATE,
        panType: 'zhuan',
        paiPanType: 3,
        zhiShiType: 0,
        yueJiaQiJuType: 0,
      },

      solarDate: '1990-01-01',
      timeValue: '08:30',

      panTypes: PAN_TYPES,
      zhiShiTypes: ZHI_SHI_TYPES,

      vm: null,
      ai: kit.freshAi(),
    },

    onLoad() {
      kit.initPage(this, {
        panType: 'zhuan',
        paiPanType: 3,
        zhiShiType: 0,
        yueJiaQiJuType: 0,
      });
    },

    onShow() {
      this.hapticEnabled = preferences.read().haptic;
    },

    onSubmit() {
      kit.submit(this, {
        create: createQiMenPaiPan,
        buildVm: buildViewModel,
      });
    },

    onShareAppMessage() {
      const vm = this.data.vm;
      return {
        title: vm ? `奇门 · ${vm.title}` : '玄数排盘 · 奇门遁甲',
        path: '/packages/qimen/pages/qimen/qimen',
      };
    },
  })
);
