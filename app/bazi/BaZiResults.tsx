import { BaZiResult } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { CopyButton, ExportButton, PrintButton } from '@/components/ui/Export';

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
  showConfig: ShowConfig;
  onToggle: (field: keyof import('@/types').BaZiSettings, checked: boolean) => void;
}

const DISPLAY_TOGGLES: { key: keyof ShowConfig; label: string }[] = [
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

const SECTION_LINKS = [
  { id: 'overview', label: '概览' },
  { id: 'strength', label: '判断' },
  { id: 'fortune', label: '运势' },
  { id: 'relations', label: '结构' },
  { id: 'insights', label: '细化解释' },
];

function Section({
  id,
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <details
        open={defaultOpen}
        className="overflow-hidden rounded-[28px] border border-stone-200 bg-white/90 shadow-xl backdrop-blur"
      >
        <summary className="cursor-pointer list-none border-b border-stone-200 bg-stone-50 px-6 py-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
              <p className="mt-1 text-sm text-stone-600">{summary}</p>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-stone-400">展开 / 收起</span>
          </div>
        </summary>
        <div className="space-y-6 p-6">{children}</div>
      </details>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.2em] text-stone-400">{label}</div>
      <div className="mt-2 text-sm font-medium text-stone-900">{value}</div>
    </div>
  );
}

function TagList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return <span className="text-sm text-stone-500">无</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span
          key={item}
          className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function RelationGroup({
  title,
  items,
  renderItem,
}: {
  title: string;
  items?: unknown[];
  renderItem: (item: any, index: number) => React.ReactNode;
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
      <div className="grid gap-3 md:grid-cols-2">{items.map(renderItem)}</div>
    </div>
  );
}

export function BaZiResults({ result, showConfig, onToggle }: BaZiResultsProps) {
  const pillarData = [
    { label: '年柱', gz: result.baZi[0], wuXing: result.baZiWuXing[0], naYin: result.baZiNaYin[0], shiShen: result.shiShen?.year, cangGan: result.diZhiCangGan?.year },
    { label: '月柱', gz: result.baZi[1], wuXing: result.baZiWuXing[1], naYin: result.baZiNaYin[1], shiShen: result.shiShen?.month, cangGan: result.diZhiCangGan?.month },
    { label: '日柱', gz: result.baZi[2], wuXing: result.baZiWuXing[2], naYin: result.baZiNaYin[2], shiShen: result.shiShen?.day, cangGan: result.diZhiCangGan?.day },
    { label: '时柱', gz: result.baZi[3], wuXing: result.baZiWuXing[3], naYin: result.baZiNaYin[3], shiShen: result.shiShen?.hour, cangGan: result.diZhiCangGan?.hour },
  ];

  const wuXingData = [
    { name: '木', count: result.muCount, color: 'bg-emerald-500' },
    { name: '火', count: result.huoCount, color: 'bg-orange-500' },
    { name: '土', count: result.tuCount, color: 'bg-amber-500' },
    { name: '金', count: result.jinCount, color: 'bg-slate-500' },
    { name: '水', count: result.shuiCount, color: 'bg-sky-500' },
  ];
  const maxWuXing = Math.max(...wuXingData.map(item => item.count), 1);

  const generateTextReport = () => [
    `【八字排盘报告】${result.name ? ' — ' + result.name : ''}`,
    `公历：${result.solar}`,
    `农历：${result.lunar}`,
    `四柱：${result.baZi.join(' ')}`,
    `日主：${result.dayGan}  生肖：${result.shengXiao}`,
    ``,
    `【判断】`,
    `身强身弱：${result.shenQiangShenRuo?.result ?? '未判定'}（${result.shenQiangShenRuo?.score ?? '-'}分）`,
    `喜用神：${result.xiYongShen ?? '未输出'}`,
    result.geJu ? `格局：${result.geJu.geJuName} — ${result.geJu.geJuMeaning}` : '',
    ``,
    `【运势】`,
    `起运：${result.qiYunSui}岁（${result.qiYunDate}）`,
    result.currentDaYun ? `当前大运：${result.currentDaYun.ganZhi}（${result.currentDaYun.startAge}-${result.currentDaYun.endAge}岁）` : '',
    result.currentLiuNian ? `当前流年：${result.currentLiuNian.year} ${result.currentLiuNian.ganZhi}` : '',
  ].filter(Boolean).join('\n');

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-amber-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_35%),linear-gradient(135deg,#1c1917,#44403c_55%,#a16207)] p-6 text-white shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="warning" size="sm">八字排盘</Badge>
              {result.qiYunDate && <Badge variant="info" size="sm">起运 {result.qiYunDate}</Badge>}
              {result.shenQiangShenRuo?.result && <Badge variant="default" size="sm">{result.shenQiangShenRuo.result}</Badge>}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {result.name || '未命名命盘'}
              </h1>
              <p className="mt-2 text-sm text-stone-200">
                {result.sex} · {result.shengXiao} · 实岁 {result.age} / 虚岁 {result.xuSui ?? '-'} · {result.solar}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {pillarData.map(item => (
                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-300">{item.label}</div>
                  <div className="mt-2 text-2xl font-semibold">{item.gz}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[340px]">
            <InfoTile label="日主" value={result.dayGan} />
            <InfoTile label="喜用" value={result.xiYongShen} />
            <InfoTile
              label="当前大运"
              value={result.currentDaYun ? `${result.currentDaYun.ganZhi} (${result.currentDaYun.startAge}-${result.currentDaYun.endAge}岁)` : '未起运'}
            />
            <InfoTile
              label="当前流年"
              value={result.currentLiuNian ? `${result.currentLiuNian.year} ${result.currentLiuNian.ganZhi}` : '未找到'}
            />
          </div>
        </div>
      </div>

      <div className="sticky top-[72px] z-30 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {SECTION_LINKS.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="rounded-full border border-stone-200 px-4 py-1.5 text-sm text-stone-700 transition-colors hover:border-stone-500 hover:bg-stone-50"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#"
            className="ml-auto rounded-full border border-stone-200 px-4 py-1.5 text-sm text-stone-500 transition-colors hover:border-stone-400"
          >
            ↑ 顶部
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-lg backdrop-blur">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">显示内容</p>
        <div className="flex flex-wrap gap-2">
          {DISPLAY_TOGGLES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key, !showConfig[key])}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                showConfig[key]
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-wrap gap-3">
          <CopyButton text={generateTextReport()}>复制文字报告</CopyButton>
          <ExportButton data={result} filename={`八字排盘-${result.name || '未命名'}`} type="json">
            导出原始数据（JSON）
          </ExportButton>
          <PrintButton>打印结果</PrintButton>
        </div>
      </div>

      <Section
        id="overview"
        title="概览"
        summary={`四柱 ${result.baZi.join(' / ')}，农历 ${result.lunar}`}
        defaultOpen
      >
        <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-stone-50/70">
          <table className="w-full min-w-[400px] border-collapse text-center">
            <thead>
              <tr className="border-b border-stone-200">
                <td className="w-16 py-3 text-xs text-stone-400">柱</td>
                {pillarData.map(item => (
                  <th key={item.label} className="py-3 text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">{item.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="py-2 text-xs text-stone-400">天干</td>
                {pillarData.map(item => (
                  <td key={item.label} className="py-3 text-3xl font-semibold text-stone-900">{item.gz[0]}</td>
                ))}
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 text-xs text-stone-400">地支</td>
                {pillarData.map(item => (
                  <td key={item.label} className="py-3 text-3xl font-semibold text-amber-700">{item.gz[1]}</td>
                ))}
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 text-xs text-stone-400">纳音</td>
                {pillarData.map(item => (
                  <td key={item.label} className="py-2 text-xs text-stone-500">{item.naYin}</td>
                ))}
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 text-xs text-stone-400">十神</td>
                {pillarData.map(item => (
                  <td key={item.label} className="py-2 text-sm font-medium text-stone-700">{item.shiShen ?? '—'}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 text-xs text-stone-400">藏干</td>
                {pillarData.map(item => (
                  <td key={item.label} className="py-3">
                    <div className="flex flex-wrap justify-center gap-1">
                      {item.cangGan?.gan.map((gan, index) => (
                        <span
                          key={`${gan}-${index}`}
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            index === 0
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {gan}·{item.cangGan?.shiShen[index]}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoTile label="公历" value={result.solar} />
          <InfoTile label="农历" value={result.lunar} />
          <InfoTile label="生肖 / 星座" value={`${result.shengXiao} / ${result.xingZuo}`} />
          <InfoTile label="星期 / 季节" value={`${result.xingQi} / ${result.jiJie}`} />
          <InfoTile label="空亡" value={result.baZiKongWang.join('、')} />
          <InfoTile label="胎元" value={result.taiYuan} />
          <InfoTile label="命宫 / 身宫" value={`${result.mingGong ?? '-'} / ${result.shenGong ?? '-'}`} />
          <InfoTile label="日主论命" value={result.riZhuLunMing} />
        </div>
      </Section>

      <Section
        id="strength"
        title="判断"
        summary={`${result.shenQiangShenRuo?.result ?? '未判定'}，${result.xiYongShen ?? '未输出喜用神'}`}
        defaultOpen
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {wuXingData.map(item => (
            <div key={item.name} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700">{item.name}</span>
                <span className="text-2xl font-semibold text-stone-900">{item.count}</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-stone-200">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${item.count === 0 ? 0 : Math.max((item.count / maxWuXing) * 100, 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-lg font-semibold text-stone-900">五行判断</h3>
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              <p>旺衰：{result.wuXingWangShuai ?? '未判定'}</p>
              <p>缺失：{result.wuXingQueShi?.length ? result.wuXingQueShi.join('、') : '无明显缺失'}</p>
              <p>喜用神：{result.xiYongShen ?? '未输出'}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-lg font-semibold text-stone-900">身强身弱</h3>
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              <p>结果：{result.shenQiangShenRuo?.result ?? '未判定'}</p>
              <p>评分：{result.shenQiangShenRuo?.score ?? '-'}</p>
              <p>{result.shenQiangShenRuo?.analysis ?? '无分析文本'}</p>
            </div>
          </div>
        </div>

        {showConfig.showGeJu && result.geJu && (
          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-lg font-semibold text-stone-900">{result.geJu.geJuName}</h3>
            <p className="mt-2 text-sm text-stone-700">{result.geJu.geJuMeaning}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoTile label="用神" value={result.geJu.yongShen} />
              <InfoTile label="喜神" value={result.geJu.xiShen} />
              <InfoTile label="忌神" value={result.geJu.jiShen} />
              <InfoTile label="仇神" value={result.geJu.chouShen} />
            </div>
            <p className="mt-4 text-sm text-stone-600">成败判断：{result.geJu.geJuChengBai}</p>
          </div>
        )}
      </Section>

      <Section
        id="fortune"
        title="运势"
        summary={
          result.currentDaYun
            ? `当前大运 ${result.currentDaYun.ganZhi}，当前流年 ${result.currentLiuNian?.ganZhi ?? '未定位'}`
            : '起运前阶段'
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoTile label="起运岁数" value={result.qiYunSui ? `${result.qiYunSui}岁` : '未计算'} />
          <InfoTile label="起运日期" value={result.qiYunDate} />
          <InfoTile
            label="当前大运"
            value={result.currentDaYun ? `${result.currentDaYun.ganZhi}（${result.currentDaYun.startAge}-${result.currentDaYun.endAge}岁）` : '未起运'}
          />
          <InfoTile
            label="当前流年"
            value={result.currentLiuNian ? `${result.currentLiuNian.year} ${result.currentLiuNian.ganZhi}` : '未定位'}
          />
        </div>

        {result.daYun && result.daYun.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-stone-800">大运</h3>
            <div className="flex gap-0 overflow-x-auto rounded-3xl border border-stone-200 bg-stone-50">
              {result.daYun.map((item, index) => {
                const isCurrent = result.currentDaYun?.startAge === item.startAge;
                return (
                  <div
                    key={`${item.ganZhi}-${item.startAge}`}
                    className={`flex min-w-[88px] flex-col items-center border-r border-stone-200 px-3 py-4 last:border-r-0 ${
                      isCurrent ? 'bg-amber-50' : ''
                    }`}
                  >
                    {isCurrent && <Badge variant="warning" size="sm">当前</Badge>}
                    <div className={`mt-1 text-xl font-semibold ${ isCurrent ? 'text-amber-700' : 'text-stone-900'}`}>{item.ganZhi}</div>
                    <div className="mt-1 text-xs text-stone-500">{item.startAge}–{item.endAge}岁</div>
                    <div className="mt-1 text-xs text-stone-600">{item.shiShen}</div>
                    {showConfig.showDaYunShenSha && item.shenSha && item.shenSha.length > 0 && (
                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        {item.shenSha.map(s => (
                          <span key={s} className="rounded-full bg-stone-200 px-1.5 py-0.5 text-[10px] text-stone-600">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {result.liuNian && result.liuNian.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-stone-800">流年</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {result.liuNian.map(item => (
                <div
                  key={`${item.year}-${item.ganZhi}`}
                  className={`rounded-2xl border px-4 py-3 ${
                    result.currentLiuNian?.year === item.year
                      ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-200'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-400">{item.year}</div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">{item.ganZhi}</div>
                  <div className="mt-1 text-sm text-stone-600">{item.age}岁 · {item.shiShen}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showConfig.showXiaoYun && result.xiaoYun && result.xiaoYun.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-stone-800">小运</h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {result.xiaoYun.map(item => (
                <div key={`${item.age}-${item.ganZhi}`} className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <div className="text-sm text-stone-500">{item.age}岁</div>
                  <div className="mt-1 text-lg font-semibold text-stone-900">{item.ganZhi}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {showConfig.showLiuYue && result.liuYue && result.liuYue.length > 0 && (
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-lg font-semibold text-stone-900">流月</h3>
              <div className="mt-4 grid gap-2">
                {result.liuYue.map(item => (
                  <div key={`${item.month}-${item.ganZhi}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-stone-700">
                    <span>{item.monthName}</span>
                    <span className="font-medium">{item.ganZhi}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showConfig.showLiuRi && result.liuRi && result.liuRi.length > 0 && (
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-lg font-semibold text-stone-900">流日</h3>
              <div className="mt-4 grid max-h-80 gap-2 overflow-auto pr-1">
                {result.liuRi.map(item => (
                  <div key={`${item.day}-${item.ganZhi}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-stone-700">
                    <span>{item.day}日</span>
                    <span className="font-medium">{item.ganZhi}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showConfig.showLiuShi && result.liuShi && result.liuShi.length > 0 && (
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-lg font-semibold text-stone-900">流时</h3>
              <div className="mt-4 grid gap-2">
                {result.liuShi.map(item => (
                  <div key={`${item.hour}-${item.ganZhi}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-stone-700">
                    <span>{item.hourName}</span>
                    <span className="font-medium">{item.ganZhi}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section
        id="relations"
        title="结构"
        summary="十神、藏干、生克与干支关系分层展示"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoTile label="年干 / 年支" value={`${result.yearGan}${result.yearZhi}`} />
          <InfoTile label="月干 / 月支" value={`${result.monthGan}${result.monthZhi}`} />
          <InfoTile label="日干 / 日支" value={`${result.dayGan}${result.dayZhi}`} />
          <InfoTile label="时干 / 时支" value={`${result.hourGan}${result.hourZhi}`} />
        </div>

        {result.shiShen && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoTile label="年干十神" value={result.shiShen.year} />
            <InfoTile label="月干十神" value={result.shiShen.month} />
            <InfoTile label="日干十神" value={result.shiShen.day} />
            <InfoTile label="时干十神" value={result.shiShen.hour} />
          </div>
        )}

        {result.shiShenAnalysis && (
          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-lg font-semibold text-stone-900">十神分析</h3>
            <p className="mt-3 text-sm leading-7 text-stone-700">{result.shiShenAnalysis}</p>
          </div>
        )}

        {result.wuXingShengKe && (
          <div className="space-y-4">
            <RelationGroup
              title="天干五合"
              items={result.wuXingShengKe.tianGanWuHe}
              renderItem={(item, index) => (
                <div key={`he-${index}`} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  {item.position1} {item.gan1} 与 {item.position2} {item.gan2} 合化 {item.heHua}
                </div>
              )}
            />
            <RelationGroup
              title="地支三合"
              items={result.wuXingShengKe.diZhiSanHe}
              renderItem={(item, index) => (
                <div key={`sanhe-${index}`} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  {item.positions.join(' / ')}：{item.zhis.join('、')} · {item.wuXing}
                </div>
              )}
            />
            <RelationGroup
              title="地支三会"
              items={result.wuXingShengKe.diZhiSanHui}
              renderItem={(item, index) => (
                <div key={`sanhui-${index}`} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  {item.positions.join(' / ')}：{item.zhis.join('、')} · {item.wuXing}
                </div>
              )}
            />
            <RelationGroup
              title="冲刑害破"
              items={[
                ...(result.wuXingShengKe.diZhiXiangChong ?? []).map(item => ({ ...item, label: '冲' })),
                ...(result.wuXingShengKe.diZhiXiangHai ?? []).map(item => ({ ...item, label: '害' })),
                ...(result.wuXingShengKe.diZhiXiangPo ?? []).map(item => ({ ...item, label: '破' })),
              ]}
              renderItem={(item, index) => (
                <div key={`relation-${index}`} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  {item.position1} {item.zhi1} 与 {item.position2} {item.zhi2} 相{item.label}
                </div>
              )}
            />
          </div>
        )}

        {showConfig.showGanZhiLiuYi && result.ganZhiLiuYi && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-lg font-semibold text-stone-900">天干留意</h3>
              <div className="mt-4 space-y-2 text-sm text-stone-700">
                {result.ganZhiLiuYi.tianGanSheng.map((item, index) => (
                  <div key={`sheng-${index}`} className="rounded-xl bg-white px-3 py-2">
                    {item.position1} {item.gan1} 生 {item.position2} {item.gan2}
                  </div>
                ))}
                {result.ganZhiLiuYi.tianGanKe.map((item, index) => (
                  <div key={`ke-${index}`} className="rounded-xl bg-white px-3 py-2">
                    {item.position1} {item.gan1} 克 {item.position2} {item.gan2}
                  </div>
                ))}
                {result.ganZhiLiuYi.tianGanChong.map((item, index) => (
                  <div key={`chong-${index}`} className="rounded-xl bg-white px-3 py-2">
                    {item.position1} {item.gan1} 冲 {item.position2} {item.gan2}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-lg font-semibold text-stone-900">地支留意</h3>
              <div className="mt-4 space-y-2 text-sm text-stone-700">
                {result.ganZhiLiuYi.diZhiBanHe.map((item, index) => (
                  <div key={`banhe-${index}`} className="rounded-xl bg-white px-3 py-2">
                    {item.position1} {item.zhi1} 与 {item.position2} {item.zhi2} 半合 {item.wuXing}
                  </div>
                ))}
                {result.ganZhiLiuYi.diZhiGongHe.map((item, index) => (
                  <div key={`gonghe-${index}`} className="rounded-xl bg-white px-3 py-2">
                    {item.position1} {item.zhi1} 与 {item.position2} {item.zhi2} 拱合 {item.wuXing}，缺 {item.missing}
                  </div>
                ))}
                {result.ganZhiLiuYi.diZhiAnHe.map((item, index) => (
                  <div key={`anhe-${index}`} className="rounded-xl bg-white px-3 py-2">
                    {item.position1} {item.zhi1} 与 {item.position2} {item.zhi2} {item.relation}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>

      <Section
        id="insights"
        title="细化解释"
        summary="把扩展判断和长文本拆成可快速浏览的模块"
      >
        {result.detailedAnalysis && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <InfoTile label="性格" value={result.detailedAnalysis.xingGeAnalysis} />
            <InfoTile label="财运" value={result.detailedAnalysis.caiYunAnalysis} />
            <InfoTile label="事业" value={result.detailedAnalysis.shiYeAnalysis} />
            <InfoTile label="感情" value={result.detailedAnalysis.ganQingAnalysis} />
            <InfoTile label="健康" value={result.detailedAnalysis.jiankangAnalysis} />
          </div>
        )}

        {showConfig.showJiuXing && result.jiuXing && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(['year', 'month', 'day', 'hour'] as const).map(period => {
              const PERIOD_LABELS = { year: '年星', month: '月星', day: '日星', hour: '时星' } as const;
              return (
              <div key={period} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-400">{PERIOD_LABELS[period]}</div>
                <div className="mt-3 space-y-2 text-sm text-stone-700">
                  <div>五行：{result.jiuXing?.[period].wuXing}</div>
                  <div>方位：{result.jiuXing?.[period].positionDesc}</div>
                  <div>玄空：{result.jiuXing?.[period].xuanKong}</div>
                  <div>北斗：{result.jiuXing?.[period].beiDou}</div>
                  <div>奇门：{result.jiuXing?.[period].qiMen}</div>
                  <div>吉凶：{result.jiuXing?.[period].qiMenLuck} / {result.jiuXing?.[period].xuanKongLuck}</div>
                </div>
              </div>
            ); })}
          </div>
        )}

        {showConfig.showShenSha && result.shenSha && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {result.shenSha.map((items, index) => (
              <div key={`shensha-${index}`} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <h3 className="text-lg font-semibold text-stone-900">{pillarData[index]?.label}</h3>
                <div className="mt-4">
                  <TagList items={items} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoTile label="彭祖百忌" value={result.pengZuBaiJi ? `${result.pengZuBaiJi.gan} / ${result.pengZuBaiJi.zhi}` : undefined} />
          <InfoTile label="命卦" value={result.mingGua} />
          <InfoTile label="月将" value={result.yueJiang ? `${result.yueJiang.yueJiang} / ${result.yueJiang.yueJiangShen}` : undefined} />
          <InfoTile label="五不遇时" value={result.wuBuYuShi ? '是' : '否'} />
          <InfoTile label="骨重" value={result.guZhong ? `${result.guZhong.guZhongText} · ${result.guZhong.piZhu}` : undefined} />
          <InfoTile label="节气" value={result.jieQiInfo ? `${result.jieQiInfo.current}，下一节气 ${result.jieQiInfo.next}` : undefined} />
          <InfoTile label="冲生肖" value={result.chongShengXiao ? `${result.chongShengXiao.year} / ${result.chongShengXiao.month} / ${result.chongShengXiao.day} / ${result.chongShengXiao.hour}` : undefined} />
        </div>

        {(result.caiYun?.zhengCai?.length || result.caiYun?.pianCai?.length || result.taoHuaYun?.zhengTaoHua?.length || result.taoHuaYun?.pianTaoHua?.length) && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-lg font-semibold text-stone-900">财运提示</h3>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                {(result.caiYun?.zhengCai ?? []).slice(0, 5).map(item => (
                  <div key={`zhengcai-${item.ganZhi}-${item.year}-${item.age}`} className="rounded-xl bg-white px-3 py-2">
                    正财：{item.ganZhi} {item.year > 0 ? `${item.year}年` : `${item.age}岁`}
                  </div>
                ))}
                {(result.caiYun?.pianCai ?? []).slice(0, 5).map(item => (
                  <div key={`piancai-${item.ganZhi}-${item.year}-${item.age}`} className="rounded-xl bg-white px-3 py-2">
                    偏财：{item.ganZhi} {item.year > 0 ? `${item.year}年` : `${item.age}岁`}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-lg font-semibold text-stone-900">桃花提示</h3>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                {(result.taoHuaYun?.zhengTaoHua ?? []).slice(0, 5).map(item => (
                  <div key={`zhengtaohua-${item.ganZhi}-${item.year}-${item.age}`} className="rounded-xl bg-white px-3 py-2">
                    正桃花：{item.ganZhi} {item.year > 0 ? `${item.year}年` : `${item.age}岁`}
                  </div>
                ))}
                {(result.taoHuaYun?.pianTaoHua ?? []).slice(0, 5).map(item => (
                  <div key={`piantaohua-${item.ganZhi}-${item.year}-${item.age}`} className="rounded-xl bg-white px-3 py-2">
                    偏桃花：{item.ganZhi} {item.year > 0 ? `${item.year}年` : `${item.age}岁`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
