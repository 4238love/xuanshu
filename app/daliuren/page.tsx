'use client';

import { useState } from 'react';
import { createDaLiuRenPaiPan } from '@/lib/daliuren';
import { DaLiuRenResult, DaLiuRenSettings } from '@/types';
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

const SI_KE_LABELS = ['日干阳神', '日干阴神', '日支阳神', '日支阴神'] as const;
const SAN_CHUAN_LABELS = ['初传', '中传', '末传'] as const;
const SAN_CHUAN_NOTES = ['发端', '移易', '归计'] as const;

export default function DaLiuRenPage() {
  const [settings, setSettings] = useState<DaLiuRenSettings>({
    name: '',
    occupy: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
  });
  const [result, setResult] = useState<DaLiuRenResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paiPanResult = createDaLiuRenPaiPan(settings);
      setResult(paiPanResult);
    } catch (error) {
      console.error('排盘失败:', error);
      alert('排盘失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  const changedPalaces = result ? result.tianPan.filter((item, index) => item !== result.diPan[index]).length : 0;
  const quickStats = [
    { label: '占事', value: settings.occupy?.trim() || '未填写' },
    { label: '性别', value: settings.sex === 1 ? '男课' : '女课' },
    { label: '日期类型', value: settings.dateType === 0 ? '公历' : '农历' },
    { label: '起课时刻', value: settings.date || '未设置' },
  ];
  const outputItems = ['天地盘与神盘', '四课与三传', '课体总览与月将', '后续 AI 课意解读'];

  return (
    <DossierPageLayout
      title="大六壬排盘"
      hasResult={Boolean(result)}
      rail={
        <Card title="输入信息" icon="📝">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="姓名（可选）"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="请输入姓名"
                fullWidth
              />
              <Input
                label="占事（必填）"
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
              label="起课日期时间"
              value={settings.date}
              onChange={(value) => setSettings({ ...settings, date: value })}
              dateType={settings.dateType}
              helperText="格式：年-月-日 时:分:秒（例如：2024-01-01 08:30:00）"
              pickerOnly
            />

            <Button type="submit" size="lg" fullWidth loading={loading}>
              {loading ? '起课中...' : '开始起课'}
            </Button>
          </form>
        </Card>
      }
      emptySidebar={
        <>
          <WorkbenchPanel
            eyebrow="当前配置"
            title="课式工作台"
            description="未起课时保留右侧摘要区，避免桌面端只剩一块宽表单。"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {quickStats.map((item) => <WorkbenchStat key={item.label} label={item.label} value={item.value} />)}
            </div>
          </WorkbenchPanel>

          <WorkbenchPanel
            eyebrow="起课输出"
            title="提交后会展开这些内容"
            description="结果区聚焦大六壬最核心的盘层与课传结构。"
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
                eyebrow="Course Overview"
                title="课式总览"
                description="基础信息、课体和时间信息先并到同一页，让读盘入口更稳定。"
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {result.name ? <DossierResultMetric label="姓名" value={result.name} /> : null}
                    {result.occupy ? <DossierResultMetric label="占事" value={result.occupy} /> : null}
                    <DossierResultMetric label="课式" value={result.tianDiPanType} />
                    {result.yueJiang ? <DossierResultMetric label="月将" value={result.yueJiang} /> : null}
                    {result.yueJiangShen ? <DossierResultMetric label="月将神" value={result.yueJiangShen} /> : null}
                    <DossierResultMetric label="天盘变动" value={`${changedPalaces} 宫`} />
                  </div>
                  <DossierResultBlock title="起课底稿">
                    <DossierResultList
                      items={[
                        { label: '公历', value: result.solar },
                        { label: '农历', value: result.lunar },
                        { label: '课式', value: result.tianDiPanType },
                        { label: '月将 / 月将神', value: `${result.yueJiang || '暂无'} / ${result.yueJiangShen || '暂无'}` },
                      ]}
                    />
                  </DossierResultBlock>
                </div>
              </DossierResultSection>

              <DossierResultSection
                eyebrow="Board Layer"
                title="天地盘与神盘"
                description="天地盘拆成两层展示，天盘挪动位置和神盘十二神将放回同一阅读区。"
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <DossierResultBlock title="天地盘">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-[#5d4732]">天盘</div>
                        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                          {result.tianPan.map((zhi, index) => {
                            const changed = zhi !== result.diPan[index];
                            return (
                              <div
                                key={`tian-${index}`}
                                className={`rounded-[20px] border px-3 py-4 text-center shadow-[0_16px_28px_-24px_rgba(61,37,15,0.32)] ${
                                  changed
                                    ? 'border-[#c99a62] bg-[linear-gradient(180deg,#fff5e6,#f4e1c4)]'
                                    : 'border-[#d8cfbf] bg-[linear-gradient(180deg,#faf7f0,#f3ede3)]'
                                }`}
                              >
                                <div className="text-[10px] uppercase tracking-[0.22em] text-[#8a6239]">第{index + 1}位</div>
                                <div className="mt-2 text-2xl font-semibold text-[#2f2118]">{zhi}</div>
                                <div className="mt-1 text-xs text-[#6c5a4d]">{changed ? `地盘 ${result.diPan[index]}` : '与地盘同位'}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-medium text-[#5d4732]">地盘</div>
                        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                          {result.diPan.map((zhi, index) => (
                            <div
                              key={`di-${index}`}
                              className="rounded-[20px] border border-[#d8cfbf] bg-[linear-gradient(180deg,#faf7f0,#f3ede3)] px-3 py-4 text-center shadow-[0_16px_28px_-24px_rgba(61,37,15,0.28)]"
                            >
                              <div className="text-[10px] uppercase tracking-[0.22em] text-[#8a6239]">第{index + 1}位</div>
                              <div className="mt-2 text-2xl font-semibold text-[#2f2118]">{zhi}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DossierResultBlock>

                  <DossierResultBlock title="神盘">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {result.shenPan.map((shen, index) => (
                        <DossierResultMetric key={`${shen}-${index}`} label={`第${index + 1}位`} value={shen} />
                      ))}
                    </div>
                  </DossierResultBlock>
                </div>
              </DossierResultSection>

              <DossierResultSection
                eyebrow="Course Core"
                title="四课与三传"
                description="四课回到平面阅读，三传保留顺序感，但不再使用每页都不一致的彩色舞台。"
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <DossierResultBlock title="四课">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {result.siKe.map((ke, index) => (
                        <div
                          key={`ke-${index}`}
                          className="rounded-[22px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)] p-4"
                        >
                          <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">{SI_KE_LABELS[index]}</div>
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <DossierResultMetric label="上神" value={ke[0]} />
                            <DossierResultMetric label="下神" value={ke[1]} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </DossierResultBlock>

                  <DossierResultBlock title="三传">
                    <div className="space-y-3">
                      {result.sanChuan.map((chuan, index) => (
                        <div
                          key={`chuan-${index}`}
                          className="rounded-[22px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.88)] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">{SAN_CHUAN_LABELS[index]}</div>
                              <div className="mt-1 text-sm text-[#77685c]">{SAN_CHUAN_NOTES[index]}</div>
                            </div>
                            <div className="text-3xl font-semibold tracking-[0.06em] text-[#2f2118]">{chuan}</div>
                          </div>
                        </div>
                      ))}
                      <DossierResultTagList items={[result.sanChuan.join(' → ')]} tone="strong" />
                    </div>
                  </DossierResultBlock>
                </div>
              </DossierResultSection>
            </div>
          ) : null}
        </>
      }
      footer={result ? <AIAssistant system="daliuren" chartData={result} /> : null}
    />
  );
}
