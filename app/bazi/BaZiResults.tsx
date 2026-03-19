import type { ReactNode } from 'react';
import { CopyButton, ExportButton, PrintButton } from '@/components/ui/Export';
import type { BaZiResult, BaZiSettings } from '@/types';

interface ShowConfig {
  showXiaoYun: boolean;
  showLiuYue: boolean;
  showLiuRi: boolean;
  showLiuShi: boolean;
  showJiuXing: boolean;
  showGanZhiLiuYi: boolean;
  showShenSha: boolean;
  showGeJu: boolean;
  showDaYunShenSha: boolean;
  showLiuNianShenSha: boolean;
}

interface BaZiResultsProps {
  result: BaZiResult;
  showConfig?: Partial<ShowConfig>;
  onToggle?: (field: keyof BaZiSettings, checked: boolean) => void;
  reportTargetId?: string;
}

const DEFAULT_SHOW_CONFIG: ShowConfig = {
  showXiaoYun: true,
  showLiuYue: true,
  showLiuRi: false,
  showLiuShi: true,
  showJiuXing: true,
  showGanZhiLiuYi: true,
  showShenSha: true,
  showGeJu: true,
  showDaYunShenSha: true,
  showLiuNianShenSha: true,
};

const DEFAULT_REPORT_TARGET_ID = 'bazi-report-content';
const EMPTY = '暂无';
const LINKS = [
  { id: 'overview', label: '命盘概览' },
  { id: 'strength', label: '命局判断' },
  { id: 'fortune', label: '大运流年' },
  { id: 'relations', label: '结构辅助' },
  { id: 'insights', label: '细化解读' },
];
const TOGGLES: Array<{ key: keyof ShowConfig; label: string }> = [
  { key: 'showGeJu', label: '格局用神' },
  { key: 'showShenSha', label: '神煞' },
  { key: 'showXiaoYun', label: '小运' },
  { key: 'showLiuYue', label: '流月' },
  { key: 'showLiuRi', label: '流日' },
  { key: 'showLiuShi', label: '流时' },
  { key: 'showJiuXing', label: '九星' },
  { key: 'showGanZhiLiuYi', label: '干支留意' },
  { key: 'showDaYunShenSha', label: '大运神煞' },
  { key: 'showLiuNianShenSha', label: '流年神煞' },
];

function join(items?: Array<string | number | undefined | null>, separator = ' · ') {
  const values = (items ?? []).filter((item): item is string | number => item !== undefined && item !== null && item !== '');
  return values.length ? values.join(separator) : EMPTY;
}

function range(start?: number, end?: number) {
  return start === undefined || end === undefined ? EMPTY : `${start} - ${end} 岁`;
}

function unique(groups?: string[][]) {
  return Array.from(new Set((groups ?? []).flat().filter(Boolean)));
}

function pickTimelineWindow(daYun: NonNullable<BaZiResult['daYun']>, currentGanZhi?: string) {
  if (!daYun.length) return [];
  const index = currentGanZhi ? daYun.findIndex((item) => item.ganZhi === currentGanZhi) : -1;
  const start = index <= 1 ? 0 : Math.max(0, index - 1);
  return daYun.slice(start, start + 4);
}

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[32px] border border-[rgba(116,74,36,0.12)] bg-[rgba(255,250,242,0.8)] p-5 shadow-[0_32px_60px_-42px_rgba(60,38,15,0.6)] backdrop-blur-xl sm:p-6"
    >
      <div className="mb-5 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.34em] text-[#8a6239]">{eyebrow}</p>
        <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
          <h2 className="text-[1.9rem] font-semibold tracking-[0.05em] text-[#2f2118]">{title}</h2>
          <p className="max-w-3xl text-sm leading-7 text-[#6c5a4d]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Card({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <article className={`rounded-[24px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,253,248,0.9)] p-4 shadow-[0_22px_40px_-34px_rgba(56,35,12,0.55)] ${className}`}>
      <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">{title}</div>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function Tags({ items, tone = 'default' }: { items?: Array<string | undefined | null>; tone?: 'default' | 'warning' | 'ink' }) {
  const values = (items ?? []).filter(Boolean) as string[];
  if (!values.length) return <span className="text-sm text-[#7b6b5f]">{EMPTY}</span>;
  const toneClass =
    tone === 'warning'
      ? 'border-[#d7b07d] bg-[#fff5e8] text-[#7a5328]'
      : tone === 'ink'
        ? 'border-[#4a2d19] bg-[#4a2d19] text-white'
        : 'border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.86)] text-[#5d4732]';
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((item, index) => (
        <span key={`${item}-${index}`} className={`rounded-full border px-3 py-1 text-xs ${toneClass}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-[22px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.82)] p-4 shadow-[0_20px_38px_-34px_rgba(56,35,12,0.6)]">
      <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-[0.03em] text-[#2f2118]">{value}</div>
      {note ? <div className="mt-2 text-xs leading-6 text-[#77685c]">{note}</div> : null}
    </div>
  );
}

export function BaZiResults({ result, showConfig, onToggle, reportTargetId = DEFAULT_REPORT_TARGET_ID }: BaZiResultsProps) {
  const config = { ...DEFAULT_SHOW_CONFIG, ...showConfig };
  const ageLabel = result.ageLabel ?? '实岁';
  const otherAgeLabel = ageLabel === '实岁' ? '虚岁' : '实岁';
  const otherAge = ageLabel === '实岁' ? result.xuSui : result.shiSui;
  const pillars = [
    { label: '年柱', key: 'year' as const, gz: result.baZi[0], wuXing: result.baZiWuXing[0], naYin: result.baZiNaYin[0], kongWang: result.baZiKongWang[0] },
    { label: '月柱', key: 'month' as const, gz: result.baZi[1], wuXing: result.baZiWuXing[1], naYin: result.baZiNaYin[1], kongWang: result.baZiKongWang[1] },
    { label: '日柱', key: 'day' as const, gz: result.baZi[2], wuXing: result.baZiWuXing[2], naYin: result.baZiNaYin[2], kongWang: result.baZiKongWang[2] },
    { label: '时柱', key: 'hour' as const, gz: result.baZi[3], wuXing: result.baZiWuXing[3], naYin: result.baZiNaYin[3], kongWang: result.baZiKongWang[3] },
  ].map((item) => ({
    ...item,
    shiShen: result.shiShen?.[item.key],
    cangGan: result.diZhiCangGan?.[item.key],
    zhiShiShen: result.shiShenZhi?.[item.key],
  }));
  const wuXing = [
    { name: '木', count: result.muCount, color: '#5f775f' },
    { name: '火', count: result.huoCount, color: '#b26039' },
    { name: '土', count: result.tuCount, color: '#9c6c2e' },
    { name: '金', count: result.jinCount, color: '#67707f' },
    { name: '水', count: result.shuiCount, color: '#496e8d' },
  ];
  const maxCount = Math.max(...wuXing.map((item) => item.count), 1);
  const reportText = [
    `【八字排盘报告】${result.name ? ` ${result.name}` : ''}`,
    `公历：${result.solar}`,
    `农历：${result.lunar}`,
    `四柱：${result.baZi.join(' ')}`,
    `年龄：${ageLabel} ${result.age}${otherAge !== undefined ? ` / ${otherAgeLabel} ${otherAge}` : ''}`,
    `日主：${result.dayGan}`,
    `人元司令：${result.renYuanSiLingFenYe ?? EMPTY}`,
    `喜用神：${result.xiYongShen ?? EMPTY}`,
  ].filter(Boolean).join('\n');

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,251,245,0.82)] p-4 shadow-[0_28px_52px_-38px_rgba(58,35,10,0.6)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {LINKS.map((link) => (
              <a key={link.id} href={`#${link.id}`} className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-4 py-2 text-sm text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-[#8a6239]">结果控制</p>
                <h2 className="mt-2 text-xl font-semibold text-[#2f2118]">结果开关与导出</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {TOGGLES.map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => onToggle?.(key as keyof BaZiSettings, !config[key])} className={`rounded-full border px-3 py-1.5 text-xs transition ${config[key] ? 'border-[#4a2d19] bg-[#4a2d19] text-white' : 'border-[rgba(117,76,40,0.16)] bg-[rgba(255,252,247,0.88)] text-[#5d4732] hover:border-[#a27140] hover:bg-[#fff7ed]'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <CopyButton text={reportText} className="border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] text-[#5d4732] hover:border-[#a27140] hover:bg-[#fff7ed]">复制文本报告</CopyButton>
              <ExportButton data={result} filename={`八字排盘-${result.name || '未命名'}`} type="json" className="border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] text-[#5d4732] hover:border-[#a27140] hover:bg-[#fff7ed]">导出原始数据</ExportButton>
              <ExportButton data={result} filename={`八字排盘-${result.name || '未命名'}`} type="image" targetId={reportTargetId} className="border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] text-[#5d4732] hover:border-[#a27140] hover:bg-[#fff7ed]">导出图像</ExportButton>
              <PrintButton targetId={reportTargetId} className="border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] text-[#5d4732] hover:border-[#a27140] hover:bg-[#fff7ed]">打印结果</PrintButton>
            </div>
          </div>
        </div>
      </div>

      <div id={reportTargetId} className="space-y-6">
        <section className="overflow-hidden rounded-[34px] border border-[#6b4524]/15 bg-[radial-gradient(circle_at_top_left,rgba(255,212,141,0.22),transparent_28%),linear-gradient(135deg,#2c1b12_0%,#573520_52%,#98612e_100%)] p-5 text-white shadow-[0_34px_72px_-38px_rgba(72,38,10,0.95)] sm:p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white">当前命盘</span>
                {result.qiYunDate ? <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white">起运 {result.qiYunDate}</span> : null}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.36em] text-stone-300">八字排盘</p>
                <h1 className="mt-3 text-[2.2rem] font-semibold tracking-[0.08em] text-white sm:text-[2.8rem]">{result.name || '未命名命盘'}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-200 sm:text-base">{join([result.sex, result.shengXiao, `${ageLabel} ${result.age}`, otherAge !== undefined ? `${otherAgeLabel} ${otherAge}` : undefined, result.solar])}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {pillars.map((item) => (
                  <article key={item.label} className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-stone-300">{item.label}</div>
                    <div className="mt-3 text-[2rem] font-semibold tracking-[0.08em] text-white">{item.gz}</div>
                    <div className="mt-3 text-xs text-stone-200">{item.wuXing}</div>
                    <div className="mt-1 text-xs text-stone-300">{item.naYin}</div>
                  </article>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-stone-300">命局结论</div>
                <div className="mt-3 text-lg font-semibold leading-8 text-white">{join([result.shenQiangShenRuo?.result, config.showGeJu && result.geJu?.geJuName ? result.geJu.geJuName : undefined, result.xiYongShen ? `喜用 ${result.xiYongShen}` : undefined], '，')}</div>
                <p className="mt-3 text-sm leading-7 text-stone-200">{join([config.showGeJu && result.geJu?.geJuMeaning ? result.geJu.geJuMeaning : undefined, result.shenQiangShenRuo?.analysis, result.shiShenAnalysis], ' ')}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="日主" value={result.dayGan} />
                <Metric label="喜用神" value={result.xiYongShen ?? EMPTY} />
                <Metric label="当前大运" value={result.currentDaYun ? result.currentDaYun.ganZhi : EMPTY} note={result.currentDaYun ? range(result.currentDaYun.startAge, result.currentDaYun.endAge) : undefined} />
                <Metric label="当前流年" value={result.currentLiuNian ? result.currentLiuNian.ganZhi : EMPTY} note={result.currentLiuNian ? String(result.currentLiuNian.year) : undefined} />
              </div>
            </div>
          </div>
        </section>

        <Section id="overview" eyebrow="命盘概览" title="四柱全览与命盘底稿" description="四柱、历法、节气与宫位信息集中展示，便于先看整体格局。">
          <div className="grid gap-4 xl:grid-cols-4">
            {pillars.map((item) => (
              <Card key={item.label} title={item.label}>
                <div className="space-y-3 text-sm text-[#5d4732]">
                  <div className="text-[2rem] font-semibold tracking-[0.06em] text-[#2f2118]">{item.gz}</div>
                  <div>五行：{item.wuXing}</div>
                  <div>纳音：{item.naYin}</div>
                  <div>十神：{item.shiShen ?? EMPTY}</div>
                  <div>空亡：{item.kongWang}</div>
                  <div>地支十神：{join(item.zhiShiShen, '、')}</div>
                  <Tags items={item.cangGan?.gan.map((gan, index) => `${gan} · ${item.cangGan?.shiShen[index]}`)} />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Card title="公历 / 农历"><div className="space-y-2 text-sm leading-7 text-[#5d4732]"><div>{result.solar}</div><div>{result.lunar}</div></div></Card>
              <Card title="年龄与生肖"><div className="space-y-2 text-sm leading-7 text-[#5d4732]"><div>{ageLabel} {result.age}{otherAge !== undefined ? ` / ${otherAgeLabel} ${otherAge}` : ''}</div><div>{join([result.shengXiao, result.xingZuo, result.xingQi, result.jiJie])}</div></div></Card>
              <Card title="胎元 / 命宫"><div className="space-y-2 text-sm leading-7 text-[#5d4732]"><div>胎元：{result.taiYuan ?? EMPTY}</div><div>胎息：{result.taiXi ?? EMPTY}</div><div>命宫：{result.mingGong ?? EMPTY}</div><div>身宫：{result.shenGong ?? EMPTY}</div></div></Card>
            </div>
            <div className="space-y-4">
              <Card title="节气信息">{result.jieQiInfo ? <div className="space-y-2 text-sm leading-7 text-[#5d4732]"><div>上一节气：{result.jieQiInfo.prev}</div><div>当前节气：{join([result.jieQiInfo.current, result.jieQiInfo.currentTime])}</div><div>下一节气：{join([result.jieQiInfo.next, result.jieQiInfo.nextTime, result.jieQiInfo.daysToNext !== undefined ? `距离出生 ${result.jieQiInfo.daysToNext} 天` : undefined])}</div></div> : <span className="text-sm text-[#7b6b5f]">{EMPTY}</span>}</Card>
              <Card title="补充提示"><div className="space-y-2 text-sm leading-7 text-[#5d4732]"><div>冲生肖：{join(Object.values(result.chongShengXiao ?? {}), '、')}</div><div>五不遇时：{result.wuBuYuShi ? '是' : '否'}</div><div>称骨：{result.guZhong ? `${result.guZhong.guZhongText}（${result.guZhong.guZhong} 两）` : EMPTY}</div></div></Card>
            </div>
          </div>
        </Section>

        <Section id="strength" eyebrow="命局判断" title="五行平衡与命局判断" description="主判断单独成区，五行计量、身强身弱与格局摘要并排，让判断不再被表格淹没。">
          <div className="grid gap-4 xl:grid-cols-3">
            <Card title="五行计量">
              <div className="space-y-3">
                {wuXing.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm text-[#5d4732]"><span>{item.name}</span><span>{item.count}</span></div>
                    <div className="h-2.5 rounded-full bg-[#efe4d5]"><div className="h-2.5 rounded-full" style={{ width: `${(item.count / maxCount) * 100}%`, backgroundColor: item.color }} /></div>
                  </div>
                ))}
                <div className="pt-2 text-sm leading-7 text-[#5d4732]">旺衰：{result.wuXingWangShuai ?? EMPTY}<br />缺失：{join(result.wuXingQueShi, '、')}<br />喜用神：{result.xiYongShen ?? EMPTY}</div>
              </div>
            </Card>
            <Card title="身强身弱">{result.shenQiangShenRuo ? <div className="space-y-4 text-sm leading-7 text-[#5d4732]"><div className="text-[2rem] font-semibold tracking-[0.04em] text-[#2f2118]">{result.shenQiangShenRuo.result}{result.shenQiangShenRuo.score > 0 ? ` +${result.shenQiangShenRuo.score}` : ` ${result.shenQiangShenRuo.score}`}</div><p>{result.shenQiangShenRuo.analysis}</p></div> : <span className="text-sm text-[#7b6b5f]">{EMPTY}</span>}</Card>
            <Card title="格局摘要">{config.showGeJu && result.geJu ? <div className="space-y-3 text-sm leading-7 text-[#5d4732]"><div className="text-[2rem] font-semibold tracking-[0.04em] text-[#2f2118]">{result.geJu.geJuName}</div><div>{result.geJu.geJuMeaning}</div><div>用神：{result.geJu.yongShen}</div><div>喜神：{result.geJu.xiShen}</div><div>忌神：{result.geJu.jiShen}</div><div>仇神：{result.geJu.chouShen}</div></div> : <div className="space-y-3 text-sm leading-7 text-[#5d4732]"><div>十神格局分析：{result.shiShenAnalysis ?? EMPTY}</div><div>日柱论命：{result.riZhuLunMing ?? EMPTY}</div></div>}</Card>
          </div>
        </Section>

        <Section id="fortune" eyebrow="流运时间轴" title="大运与流年时间轴" description="先把当前周期抬出来，再依次铺开大运、流年和短周期，保留完整信息但降低拥挤感。">
          <div className="grid gap-4 xl:grid-cols-5">
            {pickTimelineWindow(result.daYun ?? [], result.currentDaYun?.ganZhi).map((item) => {
              const active = result.currentDaYun?.ganZhi === item.ganZhi;
              return (
                <div key={`${item.ganZhi}-${item.startAge}`} className={`rounded-[22px] border px-4 py-4 shadow-[0_20px_40px_-34px_rgba(56,35,12,0.75)] ${active ? 'border-[#5a351a] bg-[linear-gradient(135deg,#5a351a,#9a602e)] text-white' : 'border-[rgba(117,76,40,0.12)] bg-[rgba(255,253,248,0.9)] text-[#2f2118]'}`}>
                  <div className={`text-[11px] uppercase tracking-[0.22em] ${active ? 'text-stone-200' : 'text-[#8a6239]'}`}>{range(item.startAge, item.endAge)}</div>
                  <div className="mt-3 text-2xl font-semibold tracking-[0.06em]">{item.ganZhi}</div>
                  <div className={`mt-2 text-sm leading-7 ${active ? 'text-stone-200' : 'text-[#6f5e51]'}`}>{join([item.shiShen, config.showDaYunShenSha ? item.shenSha?.slice(0, 2).join('、') : undefined])}</div>
                </div>
              );
            })}
            {result.currentLiuNian ? <div className="rounded-[22px] border border-[#5a351a] bg-[linear-gradient(135deg,#5a351a,#9a602e)] px-4 py-4 text-white shadow-[0_20px_40px_-34px_rgba(56,35,12,0.75)]"><div className="text-[11px] uppercase tracking-[0.22em] text-stone-200">{result.currentLiuNian.year} 流年</div><div className="mt-3 text-2xl font-semibold tracking-[0.06em]">{result.currentLiuNian.ganZhi}</div><div className="mt-2 text-sm leading-7 text-stone-200">{join([`${result.currentLiuNian.age} 岁`, result.currentLiuNian.shiShen])}</div></div> : null}
          </div>
          {result.daYun?.length ? <div className="mt-4"><Card title="大运序列"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{result.daYun.slice(0, 10).map((item, index) => { const active = result.currentDaYun?.ganZhi === item.ganZhi; return <div key={`${item.ganZhi}-${index}`} className={`rounded-[20px] border px-4 py-3 ${active ? 'border-[#4a2d19] bg-[#4a2d19] text-white' : 'border-[rgba(117,76,40,0.12)] bg-[#fffaf4] text-[#2f2118]'}`}><div className="text-lg font-semibold tracking-[0.04em]">{item.ganZhi}</div><div className={`mt-1 text-sm ${active ? 'text-stone-200' : 'text-[#6f5e51]'}`}>{item.shiShen}</div><div className={`mt-1 text-xs ${active ? 'text-stone-300' : 'text-[#7b6b5f]'}`}>{range(item.startAge, item.endAge)}</div>{config.showDaYunShenSha ? <div className="mt-3"><Tags items={item.shenSha?.slice(0, 4)} tone={active ? 'ink' : 'default'} /></div> : null}</div>; })}</div></Card></div> : null}
          {result.liuNian?.length ? <div className="mt-4"><Card title="近期流年"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{result.liuNian.map((item, index) => <div key={`${item.year}-${index}`} className={`rounded-[20px] border px-4 py-3 ${result.currentLiuNian?.year === item.year ? 'border-[#7da28e] bg-[#eef6f0]' : 'border-[rgba(117,76,40,0.12)] bg-[#fffaf4]'}`}><div className="text-xs text-[#7b6b5f]">{item.year}</div><div className="mt-1 text-xl font-semibold tracking-[0.04em] text-[#2f2118]">{item.ganZhi}</div><div className="mt-2 text-sm text-[#6f5e51]">{item.shiShen} · {item.age} 岁</div>{config.showLiuNianShenSha ? <div className="mt-3"><Tags items={item.shenSha?.slice(0, 4)} tone="warning" /></div> : null}</div>)}</div></Card></div> : null}
          {config.showXiaoYun && result.xiaoYun?.length ? <div className="mt-4"><Card title="小运"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{result.xiaoYun.map((item, index) => <div key={`${item.ganZhi}-${index}`} className="rounded-[20px] border border-[rgba(117,76,40,0.12)] bg-[#fffaf4] px-4 py-3 text-center"><div className="text-lg font-semibold tracking-[0.04em] text-[#2f2118]">{item.ganZhi}</div><div className="mt-1 text-sm text-[#6f5e51]">{item.age} 岁</div></div>)}</div></Card></div> : null}
          {config.showLiuYue && result.liuYue?.length ? <div className="mt-4"><Card title="流月"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{result.liuYue.map((item, index) => <div key={`${item.month}-${index}`} className={`rounded-[20px] border px-4 py-3 ${item.isCurrent ? 'border-[#7c99b4] bg-[#eff6fc]' : 'border-[rgba(117,76,40,0.12)] bg-[#fffaf4]'}`}><div className="text-xs text-[#7b6b5f]">{item.monthName}</div><div className="mt-1 text-xl font-semibold tracking-[0.04em] text-[#2f2118]">{item.ganZhi}</div><div className="mt-2 text-sm text-[#6f5e51]">{item.month} 月{item.isCurrent ? ' · 当前' : ''}</div></div>)}</div></Card></div> : null}
          {config.showLiuRi && result.liuRi?.length ? <div className="mt-4"><Card title="流日"><div className="grid max-h-[28rem] gap-2 overflow-y-auto sm:grid-cols-3 xl:grid-cols-7">{result.liuRi.map((item, index) => <div key={`${item.day}-${index}`} className={`rounded-[18px] border px-3 py-3 text-center ${item.isCurrent ? 'border-[#82a98f] bg-[#edf6ef]' : 'border-[rgba(117,76,40,0.12)] bg-[#fffaf4]'}`}><div className="text-xs text-[#7b6b5f]">{item.day} 日{item.isCurrent ? ' · 今日' : ''}</div><div className="mt-1 text-sm font-semibold text-[#2f2118]">{item.ganZhi}</div></div>)}</div></Card></div> : null}
          {config.showLiuShi && result.liuShi?.length ? <div className="mt-4"><Card title="流时"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{result.liuShi.map((item, index) => <div key={`${item.hour}-${index}`} className={`rounded-[20px] border px-4 py-3 ${item.isCurrent ? 'border-[#b78572] bg-[#fbf1ee]' : 'border-[rgba(117,76,40,0.12)] bg-[#fffaf4]'}`}><div className="text-xs text-[#7b6b5f]">{item.hourName}{item.isCurrent ? ' · 当前' : ''}</div><div className="mt-1 text-xl font-semibold tracking-[0.04em] text-[#2f2118]">{item.ganZhi}</div><div className="mt-2 text-sm text-[#6f5e51]">{item.hour} 时</div></div>)}</div></Card></div> : null}
        </Section>

        <Section id="relations" eyebrow="结构辅助" title="结构关系与辅助系统" description="合冲刑害、十神藏干、神煞和九星等信息集中收纳，方便对照查看。">
          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="结构关系">{(() => {
              const relationBlocks = [
                { title: '天干五合', items: result.wuXingShengKe?.tianGanWuHe?.map((item) => `${item.position1}${item.gan1} 与 ${item.position2}${item.gan2}${item.heHua ? `，化 ${item.heHua}` : ''}`) },
                { title: '地支三合', items: result.wuXingShengKe?.diZhiSanHe?.map((item) => `${item.positions.join('、')} · ${item.zhis.join('、')} · ${item.isComplete ? '三合' : '半合'}${item.wuXing}局`) },
                { title: '地支三会', items: result.wuXingShengKe?.diZhiSanHui?.map((item) => `${item.positions.join('、')} · ${item.zhis.join('、')} · ${item.isComplete ? '三会' : '半会'}${item.wuXing}局`) },
                { title: '地支六合', items: result.wuXingShengKe?.diZhiLiuHe?.map((item) => `${item.position1}${item.zhi1} 与 ${item.position2}${item.zhi2}${item.heHua ? `，化 ${item.heHua}` : ''}`) },
                { title: '地支相冲', items: result.wuXingShengKe?.diZhiXiangChong?.map((item) => `${item.position1}${item.zhi1} 冲 ${item.position2}${item.zhi2}`) },
                { title: '地支相刑', items: result.wuXingShengKe?.diZhiXiangXing?.map((item) => `${item.positions.join('、')} · ${item.zhis.join('、')} · ${item.xingType}`) },
                { title: '地支相害', items: result.wuXingShengKe?.diZhiXiangHai?.map((item) => `${item.position1}${item.zhi1} 害 ${item.position2}${item.zhi2}`) },
                { title: '地支相破', items: result.wuXingShengKe?.diZhiXiangPo?.map((item) => `${item.position1}${item.zhi1} 破 ${item.position2}${item.zhi2}`) },
              ].filter((item) => item.items?.length);
              return relationBlocks.length ? <div className="space-y-3">{relationBlocks.map((block) => <div key={block.title} className="rounded-[18px] border border-[rgba(117,76,40,0.12)] bg-[#fffaf4] p-3"><div className="text-sm font-medium text-[#2f2118]">{block.title}</div><div className="mt-2 space-y-1.5 text-sm leading-7 text-[#5d4732]">{block.items?.map((item, index) => <div key={`${block.title}-${index}`}>{item}</div>)}</div></div>)}</div> : <span className="text-sm text-[#7b6b5f]">{EMPTY}</span>;
            })()}</Card>
            <Card title="十神与藏干"><div className="grid gap-3">{pillars.map((item) => <div key={item.label} className="rounded-[18px] border border-[rgba(117,76,40,0.12)] bg-[#fffaf4] p-3"><div className="flex items-center justify-between gap-3"><div><div className="text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">{item.label}</div><div className="mt-1 text-lg font-semibold tracking-[0.04em] text-[#2f2118]">{item.gz}</div></div><span className="rounded-full border border-[rgba(117,76,40,0.14)] bg-white/90 px-3 py-1 text-xs text-[#5d4732]">{item.shiShen ?? EMPTY}</span></div><div className="mt-3 space-y-2 text-sm text-[#5d4732]"><div>地支十神：{join(item.zhiShiShen, '、')}</div><Tags items={item.cangGan?.gan.map((gan, index) => `${gan} · ${item.cangGan?.shiShen[index]}`)} /></div></div>)}</div></Card>
          </div>
          {config.showGanZhiLiuYi ? <div className="mt-4"><Card title="干支留意">{(() => {
            const ganZhiBlocks = result.ganZhiLiuYi ? [
              { title: '天干相生', items: result.ganZhiLiuYi.tianGanSheng?.map((item) => `${item.position1}${item.gan1} 生 ${item.position2}${item.gan2} · ${item.relation}`) },
              { title: '天干相克', items: result.ganZhiLiuYi.tianGanKe?.map((item) => `${item.position1}${item.gan1} 克 ${item.position2}${item.gan2} · ${item.relation}`) },
              { title: '天干相冲', items: result.ganZhiLiuYi.tianGanChong?.map((item) => `${item.position1}${item.gan1} 冲 ${item.position2}${item.gan2}`) },
              { title: '地支半合', items: result.ganZhiLiuYi.diZhiBanHe?.map((item) => `${item.position1}${item.zhi1} 与 ${item.position2}${item.zhi2} · ${item.wuXing}`) },
              { title: '地支拱合', items: result.ganZhiLiuYi.diZhiGongHe?.map((item) => `${item.position1}${item.zhi1} 与 ${item.position2}${item.zhi2} · ${item.wuXing}，缺 ${item.missing}`) },
              { title: '地支暗合', items: result.ganZhiLiuYi.diZhiAnHe?.map((item) => `${item.position1}${item.zhi1} 与 ${item.position2}${item.zhi2} · ${item.relation}`) },
            ].filter((item) => item.items?.length) : [];
            return ganZhiBlocks.length ? <div className="grid gap-3 xl:grid-cols-2">{ganZhiBlocks.map((block) => <div key={block.title} className="rounded-[18px] border border-[rgba(117,76,40,0.12)] bg-[#fffaf4] p-4"><div className="text-sm font-medium text-[#2f2118]">{block.title}</div><div className="mt-2 space-y-1.5 text-sm leading-7 text-[#5d4732]">{block.items?.map((item, index) => <div key={`${block.title}-${index}`}>{item}</div>)}</div></div>)}</div> : <span className="text-sm text-[#7b6b5f]">{EMPTY}</span>;
          })()}</Card></div> : null}
          {config.showShenSha ? <div className="mt-4"><Card title="神煞汇总"><div className="space-y-4"><Tags items={unique(result.shenSha)} tone="warning" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{pillars.map((item, index) => <div key={item.label} className="rounded-[20px] border border-[rgba(117,76,40,0.12)] bg-[#fffaf4] p-4"><div className="text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">{item.label}</div><div className="mt-1 text-lg font-semibold tracking-[0.04em] text-[#2f2118]">{item.gz}</div><div className="mt-3"><Tags items={result.shenSha?.[index]} /></div></div>)}</div></div></Card></div> : null}
        </Section>

        <Section id="insights" eyebrow="细读批注" title="细化解释与报告语气" description="长文本拆成专题卡片，便于后续接 AI 解读、专家批注和打印输出。">
          {result.detailedAnalysis ? <div className="grid gap-4 xl:grid-cols-2">{[
            ['性格分析', result.detailedAnalysis.xingGeAnalysis],
            ['财运分析', result.detailedAnalysis.caiYunAnalysis],
            ['事业分析', result.detailedAnalysis.shiYeAnalysis],
            ['感情分析', result.detailedAnalysis.ganQingAnalysis],
            ['健康分析', result.detailedAnalysis.jiankangAnalysis],
          ].map(([title, value]) => <Card key={title} title={title}><p className="whitespace-pre-line text-sm leading-8 text-[#5d4732]">{value || EMPTY}</p></Card>)}</div> : null}
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card title="补充解读"><div className="space-y-4 text-sm leading-8 text-[#5d4732]"><div><div className="font-medium text-[#2f2118]">十神格局分析</div><p className="mt-1">{result.shiShenAnalysis ?? EMPTY}</p></div><div><div className="font-medium text-[#2f2118]">日柱论命</div><p className="mt-1">{result.riZhuLunMing ?? EMPTY}</p></div><div><div className="font-medium text-[#2f2118]">冲生肖</div><p className="mt-1">{join(Object.values(result.chongShengXiao ?? {}), '、')}</p></div>{result.occupy ? <div><div className="font-medium text-[#2f2118]">当前占事</div><p className="mt-1">{result.occupy}</p></div> : null}</div></Card>
            <Card title="附记"><div className="space-y-3 text-sm leading-7 text-[#5d4732]"><div>彭祖百忌：{result.pengZuBaiJi ? `${result.pengZuBaiJi.gan}${result.pengZuBaiJi.zhi}` : EMPTY}</div><div>命卦：{result.mingGua ?? EMPTY}</div><div>月将：{result.yueJiang ? `${result.yueJiang.yueJiang} / ${result.yueJiang.yueJiangShen}` : EMPTY}</div><div>人元司令：{result.renYuanSiLingFenYe ?? EMPTY}</div><div>五不遇时：{result.wuBuYuShi ? '是' : '否'}</div><div>称骨：{result.guZhong ? `${result.guZhong.guZhongText}（${result.guZhong.guZhong} 两）` : EMPTY}</div></div></Card>
          </div>
        </Section>
      </div>
    </div>
  );
}
