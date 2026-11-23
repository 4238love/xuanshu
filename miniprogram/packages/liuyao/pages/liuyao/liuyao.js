/**
 * 六爻排盘页
 *
 * 排盘引擎复用 Web 端 TS 算法层（已编译到 /lib/liuyao），
 * 页面只负责表单、视图模型与交互。
 */

const kit = require('../../../../utils/chart-kit.js');
const preferences = require('../../../../utils/preferences.js');
const { createLiuYaoPaiPan } = require('../../../../lib/liuyao/index.js');

const PAN_TYPES = [
  { label: '日期起卦', value: 0 },
  { label: '自动起卦', value: 1 },
  { label: '手动起卦', value: 2 },
];

/** 手动爻数：算法层约定 0=少阳 1=少阴 2=老阳 3=老阴 */
const MANUAL_CHOICES = [
  { label: '少阳', value: 0 },
  { label: '少阴', value: 1 },
  { label: '老阳', value: 2 },
  { label: '老阴', value: 3 },
];

const YAO_POSITIONS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

/** 卦名 + 卦象，用于「本卦 / 变卦 / 互卦…」一排 */
function guaList(result) {
  return [
    { key: 'ben', label: '本卦', name: result.benGua, as: result.benGuaAs },
    { key: 'bian', label: '变卦', name: result.bianGua, as: result.bianGuaAs },
    { key: 'hu', label: '互卦', name: result.huGua, as: result.huGuaAs },
    { key: 'cuo', label: '错卦', name: result.cuoGua, as: result.cuoGuaAs },
    { key: 'zong', label: '综卦', name: result.zongGua, as: result.zongGuaAs },
    { key: 'fu', label: '伏卦', name: result.fuGua, as: result.fuGuaAs },
  ];
}

function buildViewModel(result) {
  const ben = result.liuYao.benGua;
  const bian = result.liuYao.bianGua;
  const yaoRows = [];

  // 六爻传统排法：上爻在上，初爻在下
  for (let i = 5; i >= 0; i -= 1) {
    yaoRows.push({
      key: YAO_POSITIONS[i],
      position: YAO_POSITIONS[i],
      liuShen: ben.liuShen[i] || '',
      fuShen: ben.fuShen[i] || '',
      liuQin: ben.liuQin[i] || '',
      ganZhi: ben.ganZhi[i] || '',
      wuXing: ben.wuXing[i] || '',
      naYin: ben.naYin[i] || '',
      isYin: ben.yaoAs[i] === '--',
      isMoving: Boolean(ben.yaoAsMark[i]),
      markName: ben.yaoAsMarkName[i] || '',
      shiYing: ben.shiYing[i] || '',
      bianQin: bian.liuQin[i] || '',
      bianGanZhi: bian.ganZhi[i] || '',
      yaoCi: ben.yaoCi[i] || '',
    });
  }

  const qiGua = guaList(result);

  const shenShaRows = kit.rows([
    kit.kv('年柱', (result.shenSha && result.shenSha.year || []).join(' · ')),
    kit.kv('月柱', (result.shenSha && result.shenSha.month || []).join(' · ')),
    kit.kv('日柱', (result.shenSha && result.shenSha.day || []).join(' · ')),
    kit.kv('时柱', (result.shenSha && result.shenSha.hour || []).join(' · ')),
  ]);

  const metaRows = kit.rows([
    kit.kv('公历', result.solar),
    kit.kv('农历', result.lunar),
    kit.kv('四柱', `${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.hourGanZhi}`),
    kit.kv('空亡', (result.kongWang || []).join('')),
    kit.kv('月将', result.yueJiang ? `${result.yueJiang}（${result.yueJiangShen}）` : ''),
    kit.kv('节气', result.jieQi ? `${result.jieQi.prevJie} 后 ${result.jieQi.prevJieDay} 天` : ''),
  ]);

  const guaCi = kit.rows([
    kit.kv('本卦', result.benGuaCi),
    kit.kv('变卦', result.bianGuaCi),
    kit.kv('互卦', result.huGuaCi),
    kit.kv('错卦', result.cuoGuaCi),
    kit.kv('综卦', result.zongGuaCi),
  ]);

  const shiYao = yaoRows.find((row) => row.shiYing === '世');
  const yingYao = yaoRows.find((row) => row.shiYing === '应');
  const movingRows = yaoRows.filter((row) => row.isMoving);
  const headline = movingRows.length
    ? `${movingRows.map((row) => `${row.position}（${row.liuQin}${row.ganZhi}）动`).join('、')}`
    : '六爻安静，无动爻';

  const reportText = kit.report(`${result.benGua} 之 ${result.bianGua}`, [
    { title: '起卦信息', items: [`公历：${result.solar}`, `农历：${result.lunar}`, `占事：${result.occupy || '未填写'}`] },
    {
      title: '卦象',
      items: qiGua.map((item) => `${item.label}：${item.name} ${item.as}`),
    },
    {
      title: '六爻',
      items: yaoRows.map(
        (row) =>
          `${row.position} ${row.liuQin}${row.ganZhi}（${row.wuXing}）${row.isYin ? '阴' : '阳'}${row.isMoving ? ' 动' : ''}${row.shiYing ? ` ${row.shiYing}` : ''}${row.bianQin ? ` → ${row.bianQin}${row.bianGanZhi}` : ''}`
      ),
    },
    {
      title: '卦辞',
      items: guaCi.map((item) => `${item.label}：${item.value}`),
    },
  ]);

  return {
    title: result.benGua,
    sub: `${result.benGua} 之 ${result.bianGua} · ${result.benGuaType} / ${result.bianGuaType}`,
    headline,
    shiYao: shiYao ? `${shiYao.position} ${shiYao.liuQin}` : '未标',
    yingYao: yingYao ? `${yingYao.position} ${yingYao.liuQin}` : '未标',
    guaList: qiGua,
    yaoRows,
    metaRows,
    guaCi,
    shenShaRows,
    liuQinQueShi: (result.liuQinQueShi || []).join('、'),
    reportText,
  };
}

Page(
  Object.assign({}, kit.formHandlers, {
    aiType: 'liuyao',

    data: {
      mode: 'form',
      statusBarHeight: 20,
      loading: false,
      error: '',
      showOccupy: true,
      occupyLabel: '占事',

      settings: {
        name: '',
        occupy: '',
        sex: 1,
        dateType: 0,
        date: kit.DEFAULT_DATE,
        paiPanType: 0,
        manualYaoShu: [0, 0, 0, 0, 0, 0],
      },

      solarDate: '1990-01-01',
      timeValue: '08:30',

      panTypes: PAN_TYPES,
      manualChoices: MANUAL_CHOICES,
      yaoPositions: YAO_POSITIONS,

      vm: null,
      ai: kit.freshAi(),
    },

    onLoad() {
      kit.initPage(this, { paiPanType: 0, manualYaoShu: [0, 0, 0, 0, 0, 0] });
    },

    onShow() {
      this.hapticEnabled = preferences.read().haptic;
    },

    /** 手动起卦：第 index 爻的爻数 */
    onPickYao(event) {
      const index = Number(event.currentTarget.dataset.index);
      const value = Number(event.currentTarget.dataset.value);
      const next = (this.data.settings.manualYaoShu || []).slice();
      next[index] = value;
      this.setData({ 'settings.manualYaoShu': next });
    },

    onSubmit() {
      kit.submit(this, {
        create: createLiuYaoPaiPan,
        buildVm: buildViewModel,
      });
    },

    onShareAppMessage() {
      const vm = this.data.vm;
      return {
        title: vm ? `六爻 · ${vm.title}` : '玄数排盘 · 六爻',
        path: '/packages/liuyao/pages/liuyao/liuyao',
      };
    },
  })
);
