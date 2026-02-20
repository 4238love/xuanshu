'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createDaLiuRenPaiPan } from '@/lib/daliuren';
import { DaLiuRenSettings, DaLiuRenResult } from '@/types';
import { Card, InfoCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, RadioGroup } from '@/components/ui/Input';
import { DateTimePicker } from '@/components/ui/FormControls';
import { Badge } from '@/components/ui/Badge';
import { AIAssistant } from '@/components/ai';

export default function DaLiuRenPage() {
  const [settings, setSettings] = useState<DaLiuRenSettings>({
    name: '',
    occupy: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* 头部 */}
      <header className="border-b border-green-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-3xl">⚌</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  大六壬排盘
                </h1>
                <p className="text-xs text-gray-500">三式之首 · 神机妙算</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="success" size="md">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 输入表单 */}
          <Card
            title="输入信息"
            icon="📝"
            className="mb-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 姓名 */}
                <Input
                  label="姓名（可选）"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="请输入姓名"
                  fullWidth
                />

                {/* 占事 */}
                <Input
                  label="占事（必填）"
                  value={settings.occupy}
                  onChange={(e) => setSettings({ ...settings, occupy: e.target.value })}
                  placeholder="请输入占事内容"
                  required
                  fullWidth
                />

                {/* 性别 */}
                <RadioGroup
                  label="性别"
                  name="sex"
                  value={settings.sex}
                  onChange={(value) => setSettings({ ...settings, sex: Number(value) as 0 | 1 })}
                  options={[
                    { label: '男', value: 1 },
                    { label: '女', value: 0 }
                  ]}
                />

                {/* 日期类型 */}
                <RadioGroup
                  label="日期类型"
                  name="dateType"
                  value={settings.dateType}
                  onChange={(value) => setSettings({ ...settings, dateType: Number(value) as 0 | 1 })}
                  options={[
                    { label: '公历', value: 0 },
                    { label: '农历', value: 1 }
                  ]}
                />
              </div>

              {/* 日期时间 */}
              <DateTimePicker
                label="起课日期时间"
                value={settings.date}
                onChange={(value) => setSettings({ ...settings, date: value })}
                dateType={settings.dateType}
                helperText="格式：年-月-日 时:分:秒（例如：2024-01-01 08:30:00）"
              />

              {/* 提交按钮 */}
              <Button
                type="submit"
                variant="success"
                size="lg"
                fullWidth
                loading={loading}
              >
                {loading ? '起课中...' : '开始起课'}
              </Button>
            </form>
          </Card>

          {/* 排盘结果 */}
          {result && (
            <div className="space-y-8">
              {/* 基础信息 */}
              <Card title="课式结果" icon="🔮">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {result.name && (
                    <InfoCard
                      label="姓名"
                      value={result.name}
                      color="from-green-50 to-emerald-50"
                      icon="👤"
                    />
                  )}
                  {result.occupy && (
                    <InfoCard
                      label="占事"
                      value={result.occupy}
                      color="from-teal-50 to-cyan-50"
                      icon="📋"
                    />
                  )}
                  <InfoCard
                    label="课式"
                    value={result.tianDiPanType}
                    color="from-emerald-50 to-green-50"
                    icon="⚌"
                  />
                  {result.yueJiang && (
                    <InfoCard
                      label="月将"
                      value={result.yueJiang}
                      color="from-cyan-50 to-teal-50"
                      icon="🌙"
                    />
                  )}
                  {result.yueJiangShen && (
                    <InfoCard
                      label="月将神"
                      value={result.yueJiangShen}
                      color="from-lime-50 to-green-50"
                      icon="✨"
                    />
                  )}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="info" size="sm">公历</Badge>
                    <span className="text-gray-700">{result.solar}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="warning" size="sm">农历</Badge>
                    <span className="text-gray-700">{result.lunar}</span>
                  </div>
                </div>
              </Card>

              {/* 天地盘 - 传统层叠式展示 */}
              <Card title="天地盘" icon="🌍" gradient="from-emerald-600 to-green-600">
                <div className="relative">
                  {/* 装饰性框架 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 to-green-900/5 rounded-2xl"></div>

                  {/* 天盘覆盖地盘 */}
                  <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50">
                    {/* 天盘层 */}
                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                          <span className="text-white text-sm">☀</span>
                        </div>
                        <h3 className="text-lg font-bold text-emerald-800">天盘</h3>
                        <span className="text-sm text-emerald-600/70">（月将 {result.yueJiang} 加时）</span>
                      </div>
                      {/* 天盘八卦式布局 */}
                      <div className="flex flex-wrap justify-center gap-2">
                        {result.tianPan.map((zhi, index) => {
                          const diZhi = result.diPan[index];
                          const isJiaPan = zhi !== diZhi;
                          return (
                            <div
                              key={`tian-${index}`}
                              className={`relative w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shadow-md transition-all hover:scale-110 hover:shadow-lg ${
                                isJiaPan
                                  ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-orange-700 border-2 border-orange-300'
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border-2 border-gray-300'
                              }`}
                              title={`天盘: ${zhi} | 地盘: ${diZhi}`}
                            >
                              {zhi}
                              {isJiaPan && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">变</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 分割线 */}
                    <div className="flex items-center justify-center my-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
                      <div className="mx-4 text-emerald-400 text-sm">◇ ◇ ◇</div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
                    </div>

                    {/* 地盘层 */}
                    <div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-md">
                          <span className="text-white text-sm">✦</span>
                        </div>
                        <h3 className="text-lg font-bold text-green-800">地盘</h3>
                        <span className="text-sm text-green-600/70">（固定十二宫）</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {result.diPan.map((zhi, index) => (
                          <div
                            key={`di-${index}`}
                            className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-700 border-2 border-emerald-200 shadow-sm"
                          >
                            {zhi}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 太极图装饰 */}
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 opacity-20">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-green-600"></div>
                  </div>
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 opacity-20">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-600"></div>
                  </div>
                </div>
              </Card>

              {/* 神盘 - 十二神将 */}
              <Card title="神盘" icon="⚔" gradient="from-purple-600 to-indigo-600">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50">
                  <div className="text-center mb-4">
                    <span className="text-sm text-purple-600/70">十二神将顺时针排列</span>
                  </div>
                  {/* 圆形排列展示 */}
                  <div className="relative w-80 h-80 mx-auto">
                    {/* 中心装饰 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center border-2 border-purple-300 shadow-inner">
                      <span className="text-2xl">⚌</span>
                    </div>

                    {/* 神将环绕 */}
                    {result.shenPan.map((shen, index) => {
                      const angle = (index * 30 - 90) * (Math.PI / 180);
                      const radius = 120;
                      const x = 160 + radius * Math.cos(angle) - 28;
                      const y = 160 + radius * Math.sin(angle) - 28;

                      // 神将颜色配置
                      const shenColors: Record<string, string> = {
                        '贵人': 'from-yellow-100 to-amber-200 text-amber-700 border-amber-300',
                        '螣蛇': 'from-red-100 to-orange-200 text-red-600 border-red-300',
                        '朱雀': 'from-orange-100 to-red-200 text-orange-600 border-orange-300',
                        '六合': 'from-green-100 to-emerald-200 text-green-600 border-green-300',
                        '勾陈': 'from-amber-100 to-yellow-200 text-amber-600 border-amber-300',
                        '青龙': 'from-blue-100 to-cyan-200 text-blue-600 border-blue-300',
                        '天空': 'from-gray-100 to-slate-200 text-gray-500 border-gray-300',
                        '白虎': 'from-red-100 to-rose-200 text-red-600 border-red-300',
                        '太常': 'from-orange-100 to-yellow-200 text-orange-600 border-orange-300',
                        '玄武': 'from-indigo-100 to-purple-200 text-indigo-600 border-indigo-300',
                        '太阴': 'from-gray-100 to-slate-200 text-slate-600 border-slate-300',
                        '天后': 'from-blue-100 to-cyan-200 text-blue-600 border-blue-300',
                      };
                      const colorClass = shenColors[shen] || 'from-gray-100 to-gray-200 text-gray-600 border-gray-300';

                      return (
                        <div
                          key={index}
                          className={`absolute w-14 h-14 rounded-xl flex items-center justify-center text-xs font-bold bg-gradient-to-br ${colorClass} border-2 shadow-md hover:scale-125 hover:shadow-xl transition-all cursor-pointer`}
                          style={{ left: x, top: y }}
                          title={`${shen}（${index + 1}）`}
                        >
                          <div className="text-center leading-tight">{shen}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 神将列表 */}
                  <div className="mt-6 grid grid-cols-6 md:grid-cols-12 gap-2">
                    {result.shenPan.map((shen, index) => (
                      <div
                        key={index}
                        className="text-center p-2 bg-purple-50/50 rounded-lg hover:bg-purple-100/50 transition-colors"
                      >
                        <div className="text-xs text-purple-500 mb-1">{index + 1}</div>
                        <div className="text-sm font-medium text-purple-700">{shen}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* 四课 - 传统式展示 */}
              <Card title="四课" icon="📊" gradient="from-indigo-500 to-purple-500">
                <div className="space-y-4">
                  {/* 课名说明 */}
                  <div className="text-center mb-6">
                    <div className="inline-flex gap-8 text-sm text-indigo-600/70">
                      <span>日干阳神</span>
                      <span>日干阴神</span>
                      <span>日支阳神</span>
                      <span>日支阴神</span>
                    </div>
                  </div>

                  {/* 四课展示 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.siKe.map((ke, index) => {
                      const keNames = ['日干阳神', '日干阴神', '日支阳神', '日支阴神'];
                      const gradients = [
                        'from-amber-50 to-yellow-50 border-amber-200',
                        'from-orange-50 to-red-50 border-orange-200',
                        'from-blue-50 to-cyan-50 border-blue-200',
                        'from-green-50 to-emerald-50 border-green-200',
                      ];
                      return (
                        <div
                          key={index}
                          className={`relative p-5 rounded-xl bg-gradient-to-br ${gradients[index]} border-2 hover:scale-[1.02] transition-transform`}
                        >
                          {/* 课名标签 */}
                          <div className="absolute -top-3 left-4 px-3 py-1 bg-white rounded-full shadow-sm">
                            <span className="text-xs font-medium text-gray-600">第{index + 1}课 · {keNames[index]}</span>
                          </div>

                          {/* 上下神 */}
                          <div className="flex items-center justify-center gap-6 mt-2">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">上神</div>
                              <div className="text-3xl font-bold text-gray-800">{ke[0]}</div>
                            </div>
                            <div className="text-gray-400">＋</div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">下神</div>
                              <div className="text-3xl font-bold text-gray-800">{ke[1]}</div>
                            </div>
                          </div>

                          {/* 连接线装饰 */}
                          <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                            {ke[0]}{ke[1]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* 三传 - 重要展示 */}
              <Card title="三传" icon="🎴" gradient="from-rose-500 to-pink-500">
                <div className="relative">
                  {/* 背景装饰 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-2xl"></div>

                  <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
                    {result.sanChuan.map((chuan, index) => {
                      const chuanNames = ['初传', '中传', '末传'];
                      const positions = ['发端', '移易', '归计'];
                      const colors = [
                        'from-rose-500 to-red-500',
                        'from-pink-500 to-rose-500',
                        'from-purple-500 to-pink-500',
                      ];

                      return (
                        <div
                          key={index}
                          className="group relative"
                        >
                          {/* 连接线 */}
                          {index < 2 && (
                            <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-rose-300 to-pink-300 -translate-y-1/2 z-0"></div>
                          )}

                          <div className={`relative p-8 bg-gradient-to-br ${colors[index]} rounded-2xl text-white text-center shadow-lg hover:shadow-2xl hover:scale-105 transition-all z-10`}>
                            {/* 序号 */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-rose-500 flex items-center justify-center font-bold shadow-md">
                              {index + 1}
                            </div>

                            <div className="mb-4">
                              <div className="text-lg font-bold">{chuanNames[index]}</div>
                              <div className="text-xs text-white/70">{positions[index]}</div>
                            </div>

                            <div className="text-6xl font-bold mb-4">{chuan}</div>

                            {/* 五行属性 */}
                            <div className="inline-flex gap-2 text-xs">
                              <span className="px-2 py-1 bg-white/20 rounded-full">
                                {chuan}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 流向指示 */}
                  <div className="flex justify-center items-center gap-2 mt-6 text-rose-400">
                    <span className="text-sm">初传</span>
                    <div className="w-8 h-px bg-rose-300"></div>
                    <span className="text-lg">→</span>
                    <div className="w-8 h-px bg-rose-300"></div>
                    <span className="text-sm">中传</span>
                    <div className="w-8 h-px bg-rose-300"></div>
                    <span className="text-lg">→</span>
                    <div className="w-8 h-px bg-rose-300"></div>
                    <span className="text-sm">末传</span>
                  </div>
                </div>
              </Card>

              {/* 课式总结 */}
              <Card title="课式总览" icon="📋" gradient="from-slate-600 to-gray-600">
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-sm text-gray-500 mb-2">天盘</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {result.tianPan.filter((t, i) => t !== result.diPan[i]).length}宫变动
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-2">四课</div>
                      <div className="text-2xl font-bold text-gray-800">4课完整</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-2">三传</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {result.sanChuan.join(' → ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-2">课式</div>
                      <div className="text-2xl font-bold text-gray-800">{result.tianDiPanType}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* AI助手 */}
      {result && <AIAssistant system="daliuren" chartData={result} />}
    </div>
  );
}
