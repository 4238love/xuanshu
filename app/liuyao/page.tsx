'use client';

import { useEffect, useMemo, useState } from 'react';
import { createLiuYaoPaiPan } from '@/lib/liuyao';
import { LiuYaoResult, LiuYaoSettings } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, RadioGroup } from '@/components/ui/Input';
import { DateTimePicker } from '@/components/ui/FormControls';
import { AIAssistant } from '@/components/ai';
import { PageLayout as DossierPageLayout, WorkbenchPanel, WorkbenchStat } from '@/components/ui/page-layout';
import {
  DossierResultBlock,
  DossierResultList,
  DossierResultMetric,
  DossierResultSection,
  DossierResultTagList,
} from '@/components/ui/result';

interface ShenShaConfig {
  [key: string]: boolean;
}

const ALL_SHEN_SHA = {
  吉神: ['天乙贵人', '太极贵人', '文昌贵人', '福星贵人', '天厨贵人', '月德贵人', '天德贵人', '天元禄', '将星', '天喜', '天医', '谋星', '皇恩', '唐符国印', '天马'],
  凶神: ['劫煞', '灾煞', '阳刃', '飞刃'],
  半吉半凶: ['华盖', '咸池'],
  动星: ['驿马'],
} as const;

const SHEN_SHA_KIND: Record<string, keyof typeof ALL_SHEN_SHA> = Object.fromEntries(
  Object.entries(ALL_SHEN_SHA).flatMap(([kind, list]) => list.map((item) => [item, kind]))
) as Record<string, keyof typeof ALL_SHEN_SHA>;

const LIU_QIN_TONE: Record<string, 'default' | 'muted' | 'warning' | 'danger' | 'success'> = {
  父母: 'default',
  兄弟: 'muted',
  子孙: 'success',
  妻财: 'warning',
  官鬼: 'danger',
};

const LIU_SHEN_TONE: Record<string, 'default' | 'muted' | 'warning' | 'danger' | 'success'> = {
  青龙: 'success',
  朱雀: 'danger',
  勾陈: 'warning',
  螣蛇: 'muted',
  白虎: 'default',
  玄武: 'default',
};

function HexagramPanel({
  label,
  symbol,
  title,
  type,
  shen,
  data,
  showMarks = false,
}: {
  label: string;
  symbol: string;
  title: string;
  type: string;
  shen: string;
  data: LiuYaoResult['liuYao']['benGua'] | LiuYaoResult['liuYao']['bianGua'];
  showMarks?: boolean;
}) {
  return (
    <DossierResultBlock title={label}>
      <div className="text-center">
        <div className="text-5xl text-[#8f5b2d]">{symbol}</div>
        <div className="mt-2 text-2xl font-semibold tracking-[0.05em] text-[#2f2118]">{title}</div>
        <div className="mt-1 text-sm text-[#77685c]">
          {type} · 卦身 {shen}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {[5, 4, 3, 2, 1, 0].map((index) => {
          const shiYing = data.shiYing[index];
          const yaoMark = showMarks && 'yaoAsMark' in data ? data.yaoAsMark[index] : '';
          return (
            <div
              key={`${label}-${index}`}
              className={`rounded-[20px] border px-4 py-4 shadow-[0_16px_28px_-24px_rgba(61,37,15,0.32)] ${
                shiYing === '世'
                  ? 'border-[#caa16c] bg-[linear-gradient(180deg,#fff5e6,#f5e4c9)]'
                  : shiYing === '应'
                    ? 'border-[#bfd4c0] bg-[linear-gradient(180deg,#f4fbf3,#e8f3e8)]'
                    : 'border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">{data.yaoMing[index]}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-2xl font-semibold tracking-[0.25em] text-[#2f2118]">{data.yaoAs[index]}</span>
                    {yaoMark ? <span className="text-sm font-medium text-[#8f5b2d]">{yaoMark}</span> : null}
                    {shiYing ? <DossierResultTagList items={[shiYing]} tone={shiYing === '世' ? 'warning' : 'success'} /> : null}
                  </div>
                </div>
                <div className="min-w-0 text-right">
                  <div className="text-sm font-medium text-[#2f2118]">{data.ganZhi[index]}</div>
                  <div className="mt-1 text-xs text-[#77685c]">{data.naYin[index]}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <DossierResultTagList items={[data.liuQin[index]]} tone={LIU_QIN_TONE[data.liuQin[index]] || 'default'} />
                <DossierResultTagList items={[data.liuShen[index]]} tone={LIU_SHEN_TONE[data.liuShen[index]] || 'default'} />
                {showMarks && 'fuShen' in data && data.fuShen[index] ? (
                  <DossierResultTagList items={[`伏 ${data.fuShen[index]}`]} tone="muted" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </DossierResultBlock>
  );
}

export default function LiuYaoPage() {
  const [settings, setSettings] = useState<LiuYaoSettings>({
    name: '',
    occupy: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
    paiPanType: 1,
    manualYaoShu: [0, 0, 0, 0, 0, 0],
  });
  const [result, setResult] = useState<LiuYaoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedYao, setExpandedYao] = useState<string | null>(null);
  const [showShenShaConfig, setShowShenShaConfig] = useState(false);
  const [shenShaConfig, setShenShaConfig] = useState<ShenShaConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('liuyao_shensha_config');
      if (saved) {
        return JSON.parse(saved);
      }
    }

    const defaultConfig: ShenShaConfig = {};
    Object.values(ALL_SHEN_SHA).flat().forEach((sha) => {
      defaultConfig[sha] = true;
    });
    return defaultConfig;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('liuyao_shensha_config', JSON.stringify(shenShaConfig));
    }
  }, [shenShaConfig]);

  const filterShenSha = (shenShaList: string[]) => shenShaList.filter((sha) => shenShaConfig[sha] !== false);

  const toggleShenSha = (sha: string) => {
    setShenShaConfig((prev) => ({
      ...prev,
      [sha]: !prev[sha],
    }));
  };

  const toggleCategory = (category: keyof typeof ALL_SHEN_SHA, enabled: boolean) => {
    setShenShaConfig((prev) => {
      const next = { ...prev };
      ALL_SHEN_SHA[category].forEach((sha) => {
        next[sha] = enabled;
      });
      return next;
    });
  };

  const resetConfig = () => {
    const next: ShenShaConfig = {};
    Object.values(ALL_SHEN_SHA).flat().forEach((sha) => {
      next[sha] = true;
    });
    setShenShaConfig(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paiPanResult = createLiuYaoPaiPan(settings);
      setResult(paiPanResult);
    } catch (error) {
      console.error('排盘失败:', error);
      alert('排盘失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  const allFilteredShenSha = useMemo(() => {
    if (!result?.shenSha) return [];
    return [
      ...new Set([
        ...filterShenSha(result.shenSha.year),
        ...filterShenSha(result.shenSha.month),
        ...filterShenSha(result.shenSha.day),
        ...filterShenSha(result.shenSha.hour),
      ]),
    ];
  }, [result, shenShaConfig]);
  const paiPanTypeLabel =
    settings.paiPanType === 2 ? '手动起卦' : settings.paiPanType === 0 ? '日期起卦' : '自动起卦';
  const quickStats = [
    { label: '占事', value: settings.occupy?.trim() || '未填写' },
    { label: '性别', value: settings.sex === 1 ? '男占' : '女占' },
    { label: '起卦模式', value: paiPanTypeLabel },
    { label: '日期类型', value: settings.dateType === 0 ? '公历' : '农历' },
  ];
  const configNotes = [
    { label: '起卦时刻', value: settings.date || '未设置' },
    {
      label: '手动爻数',
      value:
        settings.paiPanType === 2
          ? (settings.manualYaoShu ?? []).map((item) => ['少阳', '少阴', '老阳', '老阴'][item] || '未设').join(' / ')
          : '自动生成',
    },
  ];
  const outputItems = ['本卦、变卦与辅助卦', '六爻、世应、六亲六神', '四柱、神煞与辅助信息', '爻辞与后续 AI 解读'];

  return (
    <DossierPageLayout
      title="六爻排盘"
      hasResult={Boolean(result)}
      rail={
        <Card title="输入信息" icon="📝">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="姓名（可选）"
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="请输入姓名"
                fullWidth
              />
              <Input
                label="占事（必填）"
                type="text"
                value={settings.occupy}
                onChange={(e) => setSettings({ ...settings, occupy: e.target.value })}
                placeholder="请输入占事内容"
                required
                fullWidth
              />
              <RadioGroup
                label="性别"
                name="sex"
                options={[
                  { label: '男', value: 1 },
                  { label: '女', value: 0 },
                ]}
                value={settings.sex}
                onChange={(value) => setSettings({ ...settings, sex: value as 0 | 1 })}
              />
              <RadioGroup
                label="日期类型"
                name="dateType"
                options={[
                  { label: '公历', value: 0 },
                  { label: '农历', value: 1 },
                ]}
                value={settings.dateType}
                onChange={(value) => setSettings({ ...settings, dateType: value as 0 | 1 })}
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8f6a45]">起卦模式</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { value: 1, label: '自动起卦', desc: '随机生成' },
                  { value: 0, label: '日期起卦', desc: '根据时间' },
                  { value: 2, label: '手动起卦', desc: '自定义爻数' },
                ].map((mode) => (
                  <label
                    key={mode.value}
                    className={`cursor-pointer rounded-[20px] border px-4 py-4 transition ${
                      settings.paiPanType === mode.value
                        ? 'border-[#4b2e19] bg-[linear-gradient(135deg,#4b2e19,#8f5b2d)] text-white shadow-[0_18px_36px_-24px_rgba(66,37,13,0.9)]'
                        : 'border-[#d9c9b4] bg-[rgba(255,252,247,0.88)] text-[#4b3a2c] hover:border-[#b98c5e] hover:bg-[#fff8ef]'
                    }`}
                  >
                    <input
                      type="radio"
                      value={mode.value}
                      checked={settings.paiPanType === mode.value}
                      onChange={() => setSettings({ ...settings, paiPanType: mode.value as 0 | 1 | 2 })}
                      className="sr-only"
                    />
                    <div className="font-medium">{mode.label}</div>
                    <div className={`mt-1 text-xs ${settings.paiPanType === mode.value ? 'text-stone-200' : 'text-[#77685c]'}`}>
                      {mode.desc}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {settings.paiPanType === 2 ? (
              <div className="rounded-[24px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,250,242,0.86)] p-5 shadow-[0_16px_32px_-26px_rgba(61,37,15,0.32)]">
                <h3 className="text-sm font-medium tracking-[0.03em] text-[#2f2118]">手动输入六爻</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                  {['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'].map((yaoName, index) => (
                    <div key={yaoName}>
                      <label className="mb-2 block text-xs text-[#77685c]">{yaoName}</label>
                      <select
                        value={settings.manualYaoShu?.[index] ?? 0}
                        onChange={(e) => {
                          const next = [...(settings.manualYaoShu || [0, 0, 0, 0, 0, 0])];
                          next[index] = parseInt(e.target.value, 10);
                          setSettings({ ...settings, manualYaoShu: next });
                        }}
                        className="w-full rounded-[16px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-sm text-stone-900"
                      >
                        <option value={0}>少阳 —</option>
                        <option value={1}>少阴 - -</option>
                        <option value={2}>老阳 ○</option>
                        <option value={3}>老阴 ×</option>
                      </select>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-[#77685c]">少阳/少阴为不动爻，老阳/老阴为动爻。</p>
              </div>
            ) : null}

            <DateTimePicker
              label="起卦日期时间"
              value={settings.date}
              onChange={(value) => setSettings({ ...settings, date: value })}
              dateType={settings.dateType}
              helperText="格式：年-月-日 时:分:秒（例如：2024-01-01 08:30:00）"
              pickerOnly
            />

            <Button type="submit" loading={loading} fullWidth size="lg">
              {loading ? '起卦中...' : '开始起卦'}
            </Button>
          </form>
        </Card>
      }
      emptySidebar={
        <>
          <WorkbenchPanel
            eyebrow="当前配置"
            title="起卦工作台"
            description="未起卦时右侧保留关键摘要，桌面端不再出现空着的结果区。"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {quickStats.map((item) => <WorkbenchStat key={item.label} label={item.label} value={item.value} />)}
            </div>
            <div className="mt-5 grid gap-3">
              {configNotes.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4 rounded-[18px] border border-[#d8cab6] bg-white/72 px-4 py-3">
                  <span className="text-xs uppercase tracking-[0.22em] text-[#8b6641]">{item.label}</span>
                  <span className="text-right text-sm font-medium text-[#2f2118]">{item.value}</span>
                </div>
              ))}
            </div>
          </WorkbenchPanel>

          <WorkbenchPanel
            eyebrow="起卦输出"
            title="提交后会展开这些内容"
            description="结果区会直接进入卦象结构、六爻细目和神煞配置。"
            tone="dark"
          >
            <div className="space-y-3">
              {outputItems.map((item, index) => (
                <div key={item} className="flex items-start gap-3 rounded-[18px] border border-white/12 bg-white/8 px-4 py-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/22 bg-white/10 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-white/88">{item}</span>
                </div>
              ))}
            </div>
          </WorkbenchPanel>
        </>
      }
      stage={
        <>
          {result ? (
            <div className="space-y-6">
              <DossierResultSection
                eyebrow="Hexagram Overview"
                title="卦象结果"
                description="本卦、变卦和辅助卦先放进同一张总览页，先把卦架看清，再读六爻细目。"
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {result.name ? <DossierResultMetric label="姓名" value={result.name} /> : null}
                    {result.occupy ? <DossierResultMetric label="占事" value={result.occupy} /> : null}
                    <DossierResultMetric label="本卦" value={result.benGua} note={result.benGuaType} />
                    <DossierResultMetric label="变卦" value={result.bianGua} note={result.bianGuaType} />
                    <DossierResultMetric label="互卦" value={result.huGua} />
                    <DossierResultMetric label="错卦" value={result.cuoGua} />
                    <DossierResultMetric label="综卦" value={result.zongGua} />
                    <DossierResultMetric label="伏卦" value={result.fuGua} />
                  </div>

                  <DossierResultBlock title="起卦底稿">
                    <DossierResultList
                      items={[
                        { label: '公历', value: result.solar },
                        { label: '农历', value: result.lunar },
                        { label: '本卦 / 变卦', value: `${result.benGua} / ${result.bianGua}` },
                        { label: '卦身', value: `${result.benGuaShen} / ${result.bianGuaShen}` },
                      ]}
                    />
                    <div className="mt-4">
                      <DossierResultTagList
                        items={[
                          `本卦 ${result.benGuaAs}`,
                          `互卦 ${result.huGuaAs}`,
                          `错卦 ${result.cuoGuaAs}`,
                          `综卦 ${result.zongGuaAs}`,
                          `伏卦 ${result.fuGuaAs}`,
                        ]}
                      />
                    </div>
                  </DossierResultBlock>
                </div>
              </DossierResultSection>

              <DossierResultSection
                eyebrow="Main Frames"
                title="本卦与变卦"
                description="六爻主盘回到同一套纸感卡片，世应、六亲和六神都用统一标签系统。"
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  <HexagramPanel
                    label="本卦"
                    symbol={result.benGuaAs}
                    title={result.benGua}
                    type={result.benGuaType}
                    shen={result.benGuaShen}
                    data={result.liuYao.benGua}
                    showMarks
                  />
                  <HexagramPanel
                    label="变卦"
                    symbol={result.bianGuaAs}
                    title={result.bianGua}
                    type={result.bianGuaType}
                    shen={result.bianGuaShen}
                    data={result.liuYao.bianGua}
                  />
                </div>
              </DossierResultSection>

              <DossierResultSection
                eyebrow="Pillars"
                title="四柱与辅助信息"
                description="四柱、节气和辅助信息集中收纳，避免结果区被过多主题块打散。"
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <DossierResultBlock title="四柱干支">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        ['年柱', result.ganZhi.year, filterShenSha(result.shenSha?.year || [])],
                        ['月柱', result.ganZhi.month, filterShenSha(result.shenSha?.month || [])],
                        ['日柱', result.ganZhi.day, filterShenSha(result.shenSha?.day || [])],
                        ['时柱', result.ganZhi.hour, filterShenSha(result.shenSha?.hour || [])],
                      ].map(([label, value, shensha]) => (
                        <div
                          key={label as string}
                          className="rounded-[22px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)] p-4"
                        >
                          <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">{label}</div>
                          <div className="mt-3 text-2xl font-semibold tracking-[0.05em] text-[#2f2118]">{value as string}</div>
                          <div className="mt-3">
                            <DossierResultTagList items={shensha as string[]} tone="muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </DossierResultBlock>

                  <DossierResultBlock title="辅助信息">
                    <DossierResultList
                      items={[
                        { label: '上一节 / 下一节', value: result.jieQi ? `${result.jieQi.prevJie} / ${result.jieQi.nextJie}` : '暂无' },
                        { label: '上一气 / 下一气', value: result.jieQi ? `${result.jieQi.prevQi} / ${result.jieQi.nextQi}` : '暂无' },
                        { label: '月将 / 月将神', value: `${result.yueJiang || '暂无'} / ${result.yueJiangShen || '暂无'}` },
                        { label: '空亡', value: result.kongWang?.join('、') || '暂无' },
                        { label: '五不遇时', value: result.wuBuYuShi ? '是' : '否' },
                        { label: '星期 / 季节', value: `${result.xingQi || '暂无'} / ${result.jiJie || '暂无'}` },
                        { label: '生肖 / 星座', value: `${result.shengXiao || '暂无'} / ${result.xingZuo || '暂无'}` },
                        { label: '月相 / 造', value: `${result.yueXiang || '暂无'} / ${result.zao || '暂无'}` },
                      ]}
                    />
                  </DossierResultBlock>
                </div>
              </DossierResultSection>

              <DossierResultSection
                eyebrow="Yao Detail"
                title="六爻详析"
                description="保留爻辞展开交互，外观统一回到当前页面的信息块样式。"
              >
                {result.liuQinQueShi?.length ? (
                  <div className="mb-4">
                    <DossierResultTagList items={result.liuQinQueShi.map((item) => `缺 ${item}`)} tone="danger" />
                  </div>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-2">
                  {[
                    ['本卦六爻', result.benGua, result.liuYao.benGua, true],
                    ['变卦六爻', result.bianGua, result.liuYao.bianGua, false],
                  ].map(([label, gua, data, showFu]) => (
                    <DossierResultBlock key={label as string} title={`${label} · ${gua as string}`}>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1, 0].map((index) => {
                          const key = `${label}-${index}`;
                          const benData = data as LiuYaoResult['liuYao']['benGua'];
                          return (
                            <div
                              key={key}
                              className="rounded-[20px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)] p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">{benData.yaoMing[index]}</div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="text-2xl font-semibold tracking-[0.25em] text-[#2f2118]">{benData.yaoAs[index]}</span>
                                    {showFu && benData.yaoAsMark[index] ? (
                                      <span className="text-sm text-[#8f5b2d]">{benData.yaoAsMark[index]} {benData.yaoAsMarkName[index]}</span>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-[#2f2118]">{benData.ganZhi[index]}</div>
                                  <div className="mt-1 text-xs text-[#77685c]">{benData.naYin[index]}</div>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {benData.shiYing[index] ? (
                                  <DossierResultTagList items={[benData.shiYing[index]]} tone={benData.shiYing[index] === '世' ? 'warning' : 'success'} />
                                ) : null}
                                <DossierResultTagList items={[benData.liuQin[index]]} tone={LIU_QIN_TONE[benData.liuQin[index]] || 'default'} />
                                <DossierResultTagList items={[benData.liuShen[index]]} tone={LIU_SHEN_TONE[benData.liuShen[index]] || 'default'} />
                                {showFu && benData.fuShen[index] ? <DossierResultTagList items={[`伏 ${benData.fuShen[index]}`]} tone="muted" /> : null}
                              </div>

                              {benData.yaoCi[index] ? (
                                <div className="mt-4">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setExpandedYao(expandedYao === key ? null : key)}
                                  >
                                    {expandedYao === key ? '收起爻辞' : '展开爻辞'}
                                  </Button>
                                  {expandedYao === key ? (
                                    <div className="mt-3 rounded-[18px] border border-[rgba(117,76,40,0.12)] bg-[rgba(247,240,229,0.72)] px-4 py-4 text-sm leading-7 text-[#5d4732]">
                                      {benData.yaoCi[index]}
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </DossierResultBlock>
                  ))}
                </div>
              </DossierResultSection>

              {result.shenSha ? (
                <DossierResultSection
                  eyebrow="ShenSha"
                  title="神煞汇总"
                  description="保留显示配置和分类，但外观统一成当前页面的信息块样式。"
                >
                  <div className="mb-4 flex items-center justify-end">
                    <Button type="button" size="sm" variant="secondary" onClick={() => setShowShenShaConfig((prev) => !prev)}>
                      {showShenShaConfig ? '收起配置' : '配置神煞'}
                    </Button>
                  </div>

                  {showShenShaConfig ? (
                    <div className="mb-4 rounded-[24px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,253,248,0.92)] p-5 shadow-[0_20px_38px_-32px_rgba(56,35,12,0.45)]">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">显示配置</div>
                          <div className="mt-1 text-lg font-semibold text-[#2f2118]">神煞开关</div>
                        </div>
                        <Button type="button" size="sm" variant="secondary" onClick={resetConfig}>
                          重置全部
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {Object.entries(ALL_SHEN_SHA).map(([category, list]) => (
                          <div key={category} className="rounded-[20px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)] p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="text-sm font-medium text-[#2f2118]">
                                {category} ({list.length})
                              </div>
                              <div className="flex gap-2">
                                <Button type="button" size="sm" variant="secondary" onClick={() => toggleCategory(category as keyof typeof ALL_SHEN_SHA, true)}>
                                  全选
                                </Button>
                                <Button type="button" size="sm" variant="secondary" onClick={() => toggleCategory(category as keyof typeof ALL_SHEN_SHA, false)}>
                                  全不选
                                </Button>
                              </div>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                              {list.map((sha) => (
                                <label
                                  key={sha}
                                  className="flex items-center gap-2 rounded-[16px] border border-[rgba(117,76,40,0.12)] bg-white/70 px-3 py-2 text-sm text-[#5d4732]"
                                >
                                  <input type="checkbox" checked={shenShaConfig[sha] !== false} onChange={() => toggleShenSha(sha)} />
                                  <span>{sha}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DossierResultMetric label="神煞总数" value={allFilteredShenSha.length} />
                    <DossierResultMetric label="年柱神煞" value={filterShenSha(result.shenSha.year).length} />
                    <DossierResultMetric label="月柱神煞" value={filterShenSha(result.shenSha.month).length} />
                    <DossierResultMetric label="日时神煞" value={filterShenSha(result.shenSha.day).length + filterShenSha(result.shenSha.hour).length} />
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {(Object.keys(ALL_SHEN_SHA) as Array<keyof typeof ALL_SHEN_SHA>).map((kind) => {
                      const items = allFilteredShenSha.filter((sha) => SHEN_SHA_KIND[sha] === kind);
                      if (!items.length) return null;

                      const tone =
                        kind === '吉神' ? 'success' : kind === '凶神' ? 'danger' : kind === '半吉半凶' ? 'warning' : 'default';

                      return (
                        <DossierResultBlock key={kind} title={`${kind} (${items.length})`}>
                          <DossierResultTagList items={items} tone={tone} />
                        </DossierResultBlock>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ['年柱', filterShenSha(result.shenSha.year)],
                      ['月柱', filterShenSha(result.shenSha.month)],
                      ['日柱', filterShenSha(result.shenSha.day)],
                      ['时柱', filterShenSha(result.shenSha.hour)],
                    ].map(([label, items]) => (
                      <DossierResultBlock key={label as string} title={label as string}>
                        <DossierResultTagList items={items as string[]} tone="muted" />
                      </DossierResultBlock>
                    ))}
                  </div>
                </DossierResultSection>
              ) : null}
            </div>
          ) : null}
        </>
      }
      footer={result ? <AIAssistant system="liuyao" chartData={result} /> : null}
    />
  );
}
