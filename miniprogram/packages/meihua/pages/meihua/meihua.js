/**
 * 梅花易数排盘页
 *
 * 排盘引擎复用 Web 端 TS 算法层（已编译到 /lib/meihua）。
 */

const kit = require('../../../../utils/chart-kit.js');
const preferences = require('../../../../utils/preferences.js');
const { createMeiHuaPaiPan } = require('../../../../lib/meihua/index.js');

const PAN_TYPES = [
  { label: '时间起卦', value: 0 },
  { label: '随机起卦', value: 1 },
  { label: '数字起卦', value: 2 },
  { label: '单数起卦', value: 3 },
  { label: '双数起卦', value: 4 },
];

/** 上下卦的符号拼在一起，例如 ☴☴ */
function guaSymbol(upper, lower) {
  return `${upper || ''}${lower || ''}`;
}

function buildViewModel(result) {
  const benYao = result.benGuaLiuYao || { yaoMing: [], yaoXiang: [], yaoCi: [] };
  const yaoRows = [];

  for (let i = 5; i >= 0; i -= 1) {
    if (!benYao.yaoMing[i]) continue;
    yaoRows.push({
      key: benYao.yaoMing[i],
      position: benYao.yaoMing[i],
      isYin: benYao.yaoXiang[i] === '--',
      isMoving: i + 1 === result.dongYao,
      yaoCi: benYao.yaoCi[i] || '',
    });
  }

  const guaList = [
    {
      key: 'ben',
      label: '本卦',
      name: result.benGua,
      as: guaSymbol(result.benGuaShangGuaAs, result.benGuaXiaGuaAs),
    },
    {
      key: 'bian',
      label: '变卦',
      name: result.bianGua,
      as: guaSymbol(result.bianGuaShangGuaAs, result.bianGuaXiaGuaAs),
    },
    {
      key: 'hu',
      label: '互卦',
      name: result.huGua,
      as: guaSymbol(result.huGuaShangGuaAs, result.huGuaXiaGuaAs),
    },
    {
      key: 'cuo',
      label: '错卦',
      name: result.cuoGua,
      as: guaSymbol(result.cuoGuaShangGuaAs, result.cuoGuaXiaGuaAs),
    },
    {
      key: 'zong',
      label: '综卦',
      name: result.zongGua,
      as: guaSymbol(result.zongGuaShangGuaAs, result.zongGuaXiaGuaAs),
    },
  ];

  const tiYongRows = kit.rows([
    kit.kv('体卦', `${result.tiGua}（${result.tiGuaWuXing}）`),
    kit.kv('用卦', `${result.yongGua}（${result.yongGuaWuXing}）`),
    kit.kv('生克', result.tiYongGuanXi),
    kit.kv('卦象五行', result.benGuaWuXing),
    kit.kv('方位', result.benGuaFangWei),
  ]);

  const guaCi = kit.rows([
    kit.kv('本卦', result.benGuaGuaCi),
    kit.kv('变卦', result.bianGuaGuaCi),
    kit.kv('互卦', result.huGuaGuaCi),
    kit.kv('错卦', result.cuoGuaGuaCi),
    kit.kv('综卦', result.zongGuaGuaCi),
  ]);

  const metaRows = kit.rows([
    kit.kv('公历', result.solar),
    kit.kv('农历', result.lunar),
    kit.kv('四柱', `${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.hourGanZhi}`),
    kit.kv('卦码', result.guaMa),
    kit.kv('动爻', `第 ${result.dongYao} 爻`),
    kit.kv('空亡', `${result.yearKongWang || ''} ${result.dayKongWang || ''}`.trim()),
    kit.kv('节气', result.chuShengJie),
  ]);

  const reportText = kit.report(`${result.benGua} 之 ${result.bianGua}`, [
    {
      title: '起卦信息',
      items: [
        `公历：${result.solar}`,
        `农历：${result.lunar}`,
        `卦码：${result.guaMa}　动爻：第 ${result.dongYao} 爻`,
        `占事：${result.occupy || '未填写'}`,
      ],
    },
    { title: '卦象', items: guaList.map((item) => `${item.label}：${item.name} ${item.as}`) },
    { title: '体用', items: tiYongRows.map((item) => `${item.label}：${item.value}`) },
    {
      title: '六爻',
      items: yaoRows.map(
        (row) => `${row.position} ${row.isYin ? '阴' : '阳'}${row.isMoving ? '（动）' : ''}　${row.yaoCi}`
      ),
    },
    { title: '卦辞', items: guaCi.map((item) => `${item.label}：${item.value}`) },
  ]);

  return {
    title: result.benGua,
    sub: `之 ${result.bianGua} · 卦码 ${result.guaMa} · 动第 ${result.dongYao} 爻`,
    dongYao: result.dongYao,
    tiYongText: result.tiYongGuanXi,
    guaList,
    yaoRows,
    tiYongRows,
    guaCi,
    metaRows,
    reportText,
  };
}

Page(
  Object.assign({}, kit.formHandlers, {
    aiType: 'meihua',

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
        paiPanType: 0,
        shu: 123,
        danShu: 12345,
        shuangShuOne: 12,
        shuangShuTwo: 34,
        shangXiaGuaType: 0,
        dongYaoType: 0,
      },

      solarDate: '1990-01-01',
      timeValue: '08:30',

      panTypes: PAN_TYPES,

      vm: null,
      ai: kit.freshAi(),
    },

    onLoad() {
      kit.initPage(this, {
        paiPanType: 0,
        shu: 123,
        danShu: 12345,
        shuangShuOne: 12,
        shuangShuTwo: 34,
        shangXiaGuaType: 0,
        dongYaoType: 0,
      });
    },

    onShow() {
      this.hapticEnabled = preferences.read().haptic;
    },

    /** 数字类输入统一走这里（shu / danShu / shuangShuOne / shuangShuTwo） */
    onNumberInput(event) {
      const field = event.currentTarget.dataset.field;
      const raw = String(event.detail.value || '').replace(/[^\d]/g, '');
      this.setData({ [`settings.${field}`]: raw === '' ? undefined : Number(raw) });
    },

    onSubmit() {
      kit.submit(this, {
        create: createMeiHuaPaiPan,
        buildVm: buildViewModel,
      });
    },

    onShareAppMessage() {
      const vm = this.data.vm;
      return {
        title: vm ? `梅花易数 · ${vm.title}` : '玄数排盘 · 梅花易数',
        path: '/packages/meihua/pages/meihua/meihua',
      };
    },
  })
);
