'use client';

import { useState } from 'react';
import { createMeiHuaPaiPan } from '@/lib/meihua';
import { MeiHuaResult, MeiHuaSettings } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, RadioGroup } from '@/components/ui/Input';
import { DateTimePicker } from '@/components/ui/FormControls';
import { Loading } from '@/components/ui/Loading';
import { AIAssistant } from '@/components/ai';
import { PageLayout as DossierPageLayout, WorkbenchPanel, WorkbenchStat } from '@/components/ui/page-layout';
import {
  DossierResultBlock,
  DossierResultList,
  DossierResultMetric,
  DossierResultSection,
  DossierResultTagList,
} from '@/components/ui/result';

function splitGua(value: string) {
  const name = value.split(/[（(]/)[0];
  const symbol = value.match(/[（(](.+?)[）)]/)?.[1] || '';
  return { name, symbol };
}

function DetailSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-[28px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,250,242,0.84)] shadow-[0_24px_48px_-34px_rgba(61,37,15,0.42)]"
    >
      <summary className="cursor-pointer list-none px-5 py-4 text-[1.05rem] font-semibold tracking-[0.03em] text-[#2f2118]">
        {title}
      </summary>
      <div className="border-t border-[rgba(117,76,40,0.12)] px-5 py-5">{children}</div>
    </details>
  );
}

function LiuYaoTable({
  title,
  gua,
  data,
}: {
  title: string;
  gua: string;
  data: { yaoMing: string[]; yaoXiang: string[]; yaoCi: string[] };
}) {
  const rows = data.yaoMing
    .map((yaoMing, index) => ({
      key: `${title}-${index}`,
      position: 6 - index,
      name: yaoMing,
      symbol: data.yaoXiang[index],
      text: data.yaoCi[index],
    }))
    .reverse();

  return (
    <div className="rounded-[24px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,253,248,0.9)] p-4 shadow-[0_20px_38px_-32px_rgba(56,35,12,0.45)]">
      <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">{title}</div>
      <div className="mt-2 text-lg font-semibold text-[#2f2118]">{gua}</div>
      <div className="mt-4 space-y-3 md:hidden">
        {rows.map((row) => (
          <article
            key={`${row.key}-mobile`}
            className="rounded-[20px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)] p-4 shadow-[0_16px_30px_-26px_rgba(56,35,12,0.32)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">爻位</div>
                <div className="mt-1 text-lg font-semibold text-[#2f2118]">第 {row.position} 爻</div>
              </div>
              <div className="rounded-full border border-[rgba(117,76,40,0.16)] bg-[rgba(244,233,215,0.76)] px-3 py-1 text-sm font-medium text-[#6c5a4d]">
                {row.name}
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="rounded-[16px] bg-white/70 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-[#8a6239]">爻象</dt>
                <dd className="mt-1 leading-6 text-[#5d4732]">{row.symbol}</dd>
              </div>
              <div className="rounded-[16px] bg-white/70 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-[#8a6239]">爻辞</dt>
                <dd className="mt-1 leading-6 text-[#5d4732]">{row.text}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[rgba(244,233,215,0.9)] text-left text-[#5d4732]">
              <th className="px-3 py-2">爻位</th>
              <th className="px-3 py-2">爻名</th>
              <th className="px-3 py-2">爻象</th>
              <th className="px-3 py-2">爻辞</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.key} className={index % 2 === 0 ? 'bg-white/70' : 'bg-[rgba(247,240,229,0.72)]'}>
                <td className="px-3 py-3 text-center text-[#6c5a4d]">{row.position}</td>
                <td className="px-3 py-3 font-medium text-[#2f2118]">{row.name}</td>
                <td className="px-3 py-3 text-[#5d4732]">{row.symbol}</td>
                <td className="px-3 py-3 text-[#5d4732]">{row.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MeiHuaPage() {
  const [settings, setSettings] = useState<MeiHuaSettings>({
    name: '',
    occupy: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
  });
  const [result, setResult] = useState<MeiHuaResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paiPanResult = createMeiHuaPaiPan(settings);
      setResult(paiPanResult);
    } catch (error) {
      console.error('排盘失败:', error);
      alert('排盘失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  const shangGua = result ? splitGua(result.shangGua) : { name: '', symbol: '' };
  const xiaGua = result ? splitGua(result.xiaGua) : { name: '', symbol: '' };
  const pillars = result
    ? [
        {
          label: '年柱',
          ganZhi: result.yearGanZhi,
          ganWuXing: result.yearGanWuXing,
          zhiWuXing: result.yearZhiWuXing,
          naYin: result.yearNaYin,
          kongWang: result.yearKongWang,
        },
        {
          label: '月柱',
          ganZhi: result.monthGanZhi,
          ganWuXing: result.monthGanWuXing,
          zhiWuXing: result.monthZhiWuXing,
          naYin: result.monthNaYin,
          kongWang: result.monthKongWang,
        },
        {
          label: '日柱',
          ganZhi: result.dayGanZhi,
          ganWuXing: result.dayGanWuXing,
          zhiWuXing: result.dayZhiWuXing,
          naYin: result.dayNaYin,
          kongWang: result.dayKongWang,
        },
        {
          label: '时柱',
          ganZhi: result.hourGanZhi,
          ganWuXing: result.hourGanWuXing,
          zhiWuXing: result.hourZhiWuXing,
          naYin: result.hourNaYin,
          kongWang: result.hourKongWang,
        },
      ].filter((item) => item.ganZhi)
    : [];
  const quickStats = [
    { label: '占事', value: settings.occupy?.trim() || '未填写' },
    { label: '性别', value: settings.sex === 1 ? '男命' : '女命' },
    { label: '日期类型', value: settings.dateType === 0 ? '公历' : '农历' },
    { label: '起卦时刻', value: settings.date || '未设置' },
  ];
  const outputItems = ['本卦、变卦与动爻', '互卦、错卦、综卦', '体用与生克关系', '卦辞与六爻细读'];

  return (
    <DossierPageLayout
      title="梅花易数"
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
                value={settings.sex}
                onChange={(value) => setSettings({ ...settings, sex: Number(value) as 0 | 1 })}
                options={[
                  { label: '男', value: 1 },
                  { label: '女', value: 0 },
                ]}
              />
              <RadioGroup
                label="日期类型"
                name="dateType"
                value={settings.dateType}
                onChange={(value) => setSettings({ ...settings, dateType: Number(value) as 0 | 1 })}
                options={[
                  { label: '公历', value: 0 },
                  { label: '农历', value: 1 },
                ]}
              />
            </div>

            <DateTimePicker
              label="起卦日期时间"
              value={settings.date}
              onChange={(value) => setSettings({ ...settings, date: value })}
              dateType={settings.dateType}
              helperText="格式：年-月-日 时:分:秒（例如：2024-01-01 08:30:00）"
              pickerOnly
            />

            <Button type="submit" disabled={loading} fullWidth size="lg">
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
            description="把当前起卦条件收进右栏，未起卦时页面更完整。"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {quickStats.map((item) => <WorkbenchStat key={item.label} label={item.label} value={item.value} />)}
            </div>
          </WorkbenchPanel>

          <WorkbenchPanel
            eyebrow="起卦输出"
            title="提交后会展开这些内容"
            description="结果区会直接给出卦象链路和体用判断。"
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
          {loading ? <Loading size="lg" text="正在起卦..." /> : null}

          {result && !loading ? (
            <div className="space-y-6">
              <DossierResultSection
                eyebrow="Hexagram Overview"
                title="本卦主盘"
                description="本卦主体、动爻和时间底稿集中放在同一块总览区域。"
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {result.name ? <DossierResultMetric label="姓名" value={result.name} /> : null}
                      {result.occupy ? <DossierResultMetric label="占事" value={result.occupy} /> : null}
                      <DossierResultMetric label="卦码" value={result.guaMa} />
                      <DossierResultMetric label="动爻" value={`第 ${result.dongYao} 爻`} />
                    </div>

                    <DossierResultBlock title="主卦结构">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-[22px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)] p-4 text-center">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">上卦</div>
                          <div className="mt-3 text-5xl text-[#8f5b2d]">{shangGua.symbol || '—'}</div>
                          <div className="mt-2 text-2xl font-semibold text-[#2f2118]">{shangGua.name}</div>
                        </div>
                        <div className="rounded-[22px] border border-[#c89f67] bg-[linear-gradient(135deg,#4b2e19,#8f5b2d)] p-4 text-center text-white shadow-[0_24px_48px_-24px_rgba(61,37,15,0.82)]">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-stone-200">本卦</div>
                          <div className="mt-4 text-3xl font-semibold tracking-[0.06em]">{result.benGua}</div>
                          <div className="mt-3 text-sm text-stone-200">变卦 {result.bianGua}</div>
                        </div>
                        <div className="rounded-[22px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)] p-4 text-center">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">下卦</div>
                          <div className="mt-3 text-5xl text-[#8f5b2d]">{xiaGua.symbol || '—'}</div>
                          <div className="mt-2 text-2xl font-semibold text-[#2f2118]">{xiaGua.name}</div>
                        </div>
                      </div>
                    </DossierResultBlock>
                  </div>

                  <DossierResultBlock title="起卦底稿">
                    <DossierResultList
                      items={[
                        { label: '公历', value: result.solar },
                        { label: '农历', value: result.lunar },
                        { label: '本卦 / 变卦', value: `${result.benGua} / ${result.bianGua}` },
                        { label: '动爻', value: `第 ${result.dongYao} 爻` },
                      ]}
                    />
                  </DossierResultBlock>
                </div>
              </DossierResultSection>

              <DossierResultSection
                eyebrow="Relation Chain"
                title="互卦、错卦、综卦与体用"
                description="辅助卦象和平衡关系都回到统一指标卡，不再使用深色舞台和大量彩色渐变。"
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <DossierResultBlock title="卦象链路">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <DossierResultMetric label="互卦" value={result.huGua} />
                      <DossierResultMetric label="错卦" value={result.cuoGua} />
                      <DossierResultMetric label="综卦" value={result.zongGua} />
                      <DossierResultMetric label="变卦" value={result.bianGua} />
                    </div>
                  </DossierResultBlock>

                  <DossierResultBlock title="体用分析">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DossierResultMetric label="体卦" value={result.tiGua} note={result.tiGuaWuXing} />
                      <DossierResultMetric label="用卦" value={result.yongGua} note={result.yongGuaWuXing} />
                    </div>
                    <div className="mt-4 rounded-[20px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)] p-4">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">体用生克关系</div>
                      <div className="mt-2 text-xl font-semibold text-[#2f2118]">{result.tiYongGuanXi}</div>
                      {(result.benGuaWuXing || result.benGuaFangWei) ? (
                        <div className="mt-3 text-sm leading-7 text-[#5d4732]">
                          {result.benGuaWuXing ? `本卦五行：${result.benGuaWuXing}` : null}
                          {result.benGuaWuXing && result.benGuaFangWei ? ' · ' : null}
                          {result.benGuaFangWei ? `本卦方位：${result.benGuaFangWei}` : null}
                        </div>
                      ) : null}
                    </div>
                  </DossierResultBlock>
                </div>
              </DossierResultSection>

              {pillars.length ? (
                <DetailSection title="干支信息" defaultOpen>
                  <div className="grid gap-4 xl:grid-cols-4">
                    {pillars.map((item) => (
                      <DossierResultBlock key={item.label} title={item.label}>
                        <div className="space-y-3 text-sm text-[#5d4732]">
                          <div className="text-2xl font-semibold text-[#2f2118]">{item.ganZhi}</div>
                          <DossierResultTagList items={[item.ganWuXing, item.zhiWuXing]} tone="muted" />
                          <div>纳音：{item.naYin || '暂无'}</div>
                          <div>空亡：{item.kongWang || '暂无'}</div>
                        </div>
                      </DossierResultBlock>
                    ))}
                  </div>
                </DetailSection>
              ) : null}

              {(result.prevJie || result.nextJie || result.prevQi || result.nextQi) ? (
                <DetailSection title="节气信息">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {result.prevJie ? <DossierResultMetric label="上一节" value={result.prevJie} note={result.prevJieDate || undefined} /> : null}
                    {result.nextJie ? <DossierResultMetric label="下一节" value={result.nextJie} note={result.nextJieDate || undefined} /> : null}
                    {result.prevQi ? <DossierResultMetric label="上一气" value={result.prevQi} note={result.prevQiDate || undefined} /> : null}
                    {result.nextQi ? <DossierResultMetric label="下一气" value={result.nextQi} note={result.nextQiDate || undefined} /> : null}
                  </div>
                  {(result.chuShengJie || result.chuShengQi) ? (
                    <div className="mt-4 rounded-[22px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)] p-4 text-sm leading-7 text-[#5d4732]">
                      {result.chuShengJie ? <div>出生节：{result.chuShengJie}</div> : null}
                      {result.chuShengQi ? <div>出生气：{result.chuShengQi}</div> : null}
                    </div>
                  ) : null}
                </DetailSection>
              ) : null}

              {(result.benGuaGuaCi || result.bianGuaGuaCi || result.huGuaGuaCi || result.cuoGuaGuaCi || result.zongGuaGuaCi) ? (
                <DetailSection title="卦辞">
                  <div className="grid gap-4 xl:grid-cols-2">
                    {[
                      ['本卦', result.benGua, result.benGuaGuaCi],
                      ['变卦', result.bianGua, result.bianGuaGuaCi],
                      ['互卦', result.huGua, result.huGuaGuaCi],
                      ['错卦', result.cuoGua, result.cuoGuaGuaCi],
                      ['综卦', result.zongGua, result.zongGuaGuaCi],
                    ].map(([label, gua, value]) =>
                      value ? (
                        <DossierResultBlock key={label} title={`${label} · ${gua}`}>
                          <p className="text-sm leading-8 text-[#5d4732]">{value}</p>
                        </DossierResultBlock>
                      ) : null
                    )}
                  </div>
                </DetailSection>
              ) : null}

              {(result.benGuaLiuYao || result.bianGuaLiuYao || result.huGuaLiuYao || result.cuoGuaLiuYao || result.zongGuaLiuYao) ? (
                <DetailSection title="六爻详细">
                  <div className="space-y-4">
                    {result.benGuaLiuYao ? <LiuYaoTable title="本卦六爻" gua={result.benGua} data={result.benGuaLiuYao} /> : null}
                    {result.bianGuaLiuYao ? <LiuYaoTable title="变卦六爻" gua={result.bianGua} data={result.bianGuaLiuYao} /> : null}
                    {result.huGuaLiuYao ? <LiuYaoTable title="互卦六爻" gua={result.huGua} data={result.huGuaLiuYao} /> : null}
                    {result.cuoGuaLiuYao ? <LiuYaoTable title="错卦六爻" gua={result.cuoGua} data={result.cuoGuaLiuYao} /> : null}
                    {result.zongGuaLiuYao ? <LiuYaoTable title="综卦六爻" gua={result.zongGua} data={result.zongGuaLiuYao} /> : null}
                  </div>
                </DetailSection>
              ) : null}

              {(result.benGuaShangGuaName || result.bianGuaShangGuaName || result.huGuaShangGuaName || result.cuoGuaShangGuaName || result.zongGuaShangGuaName) ? (
                <DetailSection title="卦象分解">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[
                      ['本卦', result.benGua, result.benGuaShangGuaAs, result.benGuaShangGuaName, result.benGuaXiaGuaAs, result.benGuaXiaGuaName],
                      ['变卦', result.bianGua, result.bianGuaShangGuaAs, result.bianGuaShangGuaName, result.bianGuaXiaGuaAs, result.bianGuaXiaGuaName],
                      ['互卦', result.huGua, result.huGuaShangGuaAs, result.huGuaShangGuaName, result.huGuaXiaGuaAs, result.huGuaXiaGuaName],
                      ['错卦', result.cuoGua, result.cuoGuaShangGuaAs, result.cuoGuaShangGuaName, result.cuoGuaXiaGuaAs, result.cuoGuaXiaGuaName],
                      ['综卦', result.zongGua, result.zongGuaShangGuaAs, result.zongGuaShangGuaName, result.zongGuaXiaGuaAs, result.zongGuaXiaGuaName],
                    ].map(([label, gua, shangAs, shangName, xiaAs, xiaName]) =>
                      shangName ? (
                        <DossierResultBlock key={label} title={`${label} · ${gua}`}>
                          <DossierResultList
                            items={[
                              { label: '上卦', value: `${shangAs || ''} ${shangName}`.trim() },
                              { label: '下卦', value: `${xiaAs || ''} ${xiaName || ''}`.trim() },
                            ]}
                          />
                        </DossierResultBlock>
                      ) : null
                    )}
                  </div>
                </DetailSection>
              ) : null}

              {(result.shengXiao || result.xingZuo || result.yueXiang || result.yueJiang || result.yueJiangShen || result.wuBuYuShi !== undefined) ? (
                <DetailSection title="辅助信息">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {result.shengXiao ? <DossierResultMetric label="生肖" value={result.shengXiao} /> : null}
                    {result.xingZuo ? <DossierResultMetric label="星座" value={result.xingZuo} /> : null}
                    {result.yueXiang ? <DossierResultMetric label="月相" value={result.yueXiang} /> : null}
                    {result.yueJiang ? <DossierResultMetric label="月将" value={result.yueJiang} /> : null}
                    {result.yueJiangShen ? <DossierResultMetric label="月将神" value={result.yueJiangShen} /> : null}
                    {result.wuBuYuShi !== undefined ? <DossierResultMetric label="五不遇时" value={result.wuBuYuShi ? '是' : '否'} /> : null}
                  </div>
                </DetailSection>
              ) : null}

              <DossierResultSection
                eyebrow="Notes"
                title="梅花易数说明"
                description="术数解释保留在统一注释页，便于后续继续扩写 AI 解读。"
              >
                <DossierResultBlock>
                  <div className="space-y-2 text-sm leading-7 text-[#5d4732]">
                    <p>本卦：根据时间起卦得到的原始卦象。</p>
                    <p>变卦：动爻变化后形成的卦象。</p>
                    <p>互卦：由本卦 2、3、4 爻和 3、4、5 爻组成。</p>
                    <p>错卦：本卦阴阳爻全部相反的卦象。</p>
                    <p>综卦：本卦上下颠倒的卦象。</p>
                  </div>
                </DossierResultBlock>
              </DossierResultSection>
            </div>
          ) : null}
        </>
      }
      footer={result ? <AIAssistant system="meihua" chartData={result} /> : null}
    />
  );
}
