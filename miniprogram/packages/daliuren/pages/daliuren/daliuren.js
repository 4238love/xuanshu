/**
 * 大六壬排盘页
 *
 * 排盘引擎复用 Web 端 TS 算法层（已编译到 /lib/daliuren）。
 */

const kit = require('../../../../utils/chart-kit.js');
const preferences = require('../../../../utils/preferences.js');
const { createDaLiuRenPaiPan } = require('../../../../lib/daliuren/index.js');

const GUI_REN_TYPES = [
  { label: '自动昼夜', value: 0 },
  { label: '昼贵', value: 1 },
  { label: '夜贵', value: 2 },
];

const KE_LABELS = ['一课', '二课', '三课', '四课'];
const CHUAN_LABELS = ['初传', '中传', '末传'];

function buildViewModel(result) {
  const diPan = result.diPan || [];
  const tianPan = result.tianPan || [];
  const shenPan = result.shenPan || [];
  const tianGan = result.tianGan || [];

  const palaceRows = diPan.map((zhi, index) => ({
    key: zhi,
    diZhi: zhi,
    tianPan: tianPan[index] || '',
    shenJiang: shenPan[index] || '',
    dunGan: tianGan[index] || '',
  }));

  const siKe = (result.siKe || []).map((pair, index) => ({
    key: KE_LABELS[index],
    label: KE_LABELS[index],
    shang: pair[0] || '',
    xia: pair[1] || '',
    shangJiang: (result.siKeShenJiang && result.siKeShenJiang[index] && result.siKeShenJiang[index][0]) || '',
    xiaJiang: (result.siKeShenJiang && result.siKeShenJiang[index] && result.siKeShenJiang[index][1]) || '',
    shangDun: (result.siKeDunGan && result.siKeDunGan[index] && result.siKeDunGan[index][0]) || '',
    xiaDun: (result.siKeDunGan && result.siKeDunGan[index] && result.siKeDunGan[index][1]) || '',
  }));

  const sanChuan = (result.sanChuan || []).map((zhi, index) => ({
    key: CHUAN_LABELS[index],
    label: CHUAN_LABELS[index],
    zhi,
    dunGan: (result.sanChuanDunGan && result.sanChuanDunGan[index]) || '',
    shenJiang: (result.sanChuanShenJiang && result.sanChuanShenJiang[index]) || '',
    liuQin: (result.sanChuanLiuQin && result.sanChuanLiuQin[index]) || '',
  }));

  const metaRows = kit.rows([
    kit.kv('公历', result.solar),
    kit.kv('农历', result.lunar),
    kit.kv('四柱', `${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.hourGanZhi}`),
    kit.kv('月将', result.yueJiang ? `${result.yueJiang}（${result.yueJiangShen}）` : ''),
    kit.kv('月相', result.yueXiang),
    kit.kv('空亡', (result.dayGanZhiKongWang || '')),
    kit.kv('节气', result.chuShengJie),
    kit.kv('旺衰', (result.wuXingWangShuai || []).join(' · ')),
  ]);

  const reportText = kit.report(`${result.tianDiPanType}`, [
    {
      title: '课式信息',
      items: [
        `公历：${result.solar}`,
        `农历：${result.lunar}`,
        `四柱：${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.hourGanZhi}`,
        `月将：${result.yueJiang}（${result.yueJiangShen}）　天地盘：${result.tianDiPanType}`,
        `占事：${result.occupy || '未填写'}`,
      ],
    },
    { title: '四课', items: siKe.map((ke) => `${ke.label}：${ke.shangJiang}${ke.shang} / ${ke.xiaJiang}${ke.xia}`) },
    {
      title: '三传',
      items: sanChuan.map(
        (chuan) => `${chuan.label}：${chuan.zhi}（${chuan.dunGan}）${chuan.shenJiang} ${chuan.liuQin}`
      ),
    },
    {
      title: '天地盘',
      items: palaceRows.map(
        (row) => `${row.diZhi}宫：天盘 ${row.tianPan}　天将 ${row.shenJiang}　遁干 ${row.dunGan}`
      ),
    },
  ]);

  return {
    title: result.tianDiPanType || '大六壬课式',
    sub: `${result.dayGanZhi} 日 ${result.hourGanZhi} 时 · 月将 ${result.yueJiang || ''}（${result.yueJiangShen || ''}）`,
    yueJiang: `${result.yueJiang || ''}${result.yueJiangShen ? `（${result.yueJiangShen}）` : ''}`,
    palaceRows,
    siKe,
    sanChuan,
    quFa: result.sanChuanQuFa || '',
    metaRows,
    reportText,
  };
}

Page(
  Object.assign({}, kit.formHandlers, {
    aiType: 'daliuren',

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
        guiRenType: 0,
      },

      solarDate: '1990-01-01',
      timeValue: '08:30',

      guiRenTypes: GUI_REN_TYPES,

      vm: null,
      ai: kit.freshAi(),
    },

    onLoad() {
      kit.initPage(this, { guiRenType: 0 });
    },

    onShow() {
      this.hapticEnabled = preferences.read().haptic;
    },

    onSubmit() {
      kit.submit(this, {
        create: createDaLiuRenPaiPan,
        buildVm: buildViewModel,
      });
    },

    onShareAppMessage() {
      return {
        title: '大六壬 · 四课三传',
        path: '/packages/daliuren/pages/daliuren/daliuren',
      };
    },
  })
);
