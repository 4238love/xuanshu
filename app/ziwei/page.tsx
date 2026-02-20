'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createZiWeiPaiPan } from '@/lib/ziwei';
import { ZiWeiSettings, ZiWeiResult } from '@/types';
import { Card, InfoCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, RadioGroup } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DateTimePicker } from '@/components/ui/FormControls';
import { AIAssistant } from '@/components/ai';

export default function ZiWeiPage() {
  const [settings, setSettings] = useState<ZiWeiSettings>({
    name: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
    birthHour: 0
  });

  const [result, setResult] = useState<ZiWeiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paiPanResult = createZiWeiPaiPan(settings);
      setResult(paiPanResult);
    } catch (error) {
      console.error('排盘失败:', error);
      alert('排盘失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* 头部 */}
      <header className="border-b border-pink-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-3xl">★</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  紫微斗数排盘
                </h1>
                <p className="text-xs text-gray-500">星曜命盘 · 推演人生</p>
              </div>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg transition-all"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 输入表单 */}
          <Card title="输入信息" icon="📝" className="mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 姓名 */}
                <Input
                  label="姓名（可选）"
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="请输入姓名"
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

                {/* 出生时辰 */}
                <Input
                  label="出生时辰（小时）"
                  type="number"
                  min="0"
                  max="23"
                  value={settings.birthHour}
                  onChange={(e) => setSettings({ ...settings, birthHour: parseInt(e.target.value) || 0 })}
                  placeholder="0-23"
                  fullWidth
                />
              </div>

              {/* 日期时间 */}
              <DateTimePicker
                label="出生日期时间"
                value={settings.date}
                onChange={(value) => setSettings({ ...settings, date: value })}
                dateType={settings.dateType}
                helperText="格式：年-月-日 时:分:秒（例如：2024-01-01 08:30:00）"
              />

              {/* 提交按钮 */}
              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
                gradient="from-pink-500 to-rose-500"
              >
                开始排盘
              </Button>
            </form>
          </Card>

          {/* 排盘结果 */}
          {result && (
            <Card title="命盘结果" icon="✨" className="animate-fadeIn">
              {/* 传统命盘展示 - 环形布局 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">十二宫命盘</h3>

                {/* 环形命盘 */}
                <div className="relative w-full max-w-3xl mx-auto aspect-square mb-8">
                  {/* 背景装饰 */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 border-2 border-pink-200 shadow-inner"></div>

                  {/* 天盘圆环装饰 */}
                  <div className="absolute inset-4 rounded-full border border-pink-300/50 border-dashed"></div>
                  <div className="absolute inset-8 rounded-full border border-rose-300/30"></div>
                  <div className="absolute inset-12 rounded-full border border-pink-200/30"></div>

                  {/* 中心 - 基础信息 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 shadow-xl flex flex-col items-center justify-center text-white z-10">
                      <div className="text-xs opacity-80">五行局</div>
                      <div className="text-xl font-bold">{result.wuXingJu}</div>
                      <div className="text-xs mt-1 opacity-80">{result.mingGong}宫</div>
                    </div>
                  </div>

                  {/* 十二宫位 - 环形排列 */}
                  <div className="absolute inset-0">
                    {(() => {
                      // 传统紫微斗数十二宫排列顺序（从命宫开始顺时针）
                      const gongOrder = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
                      return gongOrder.map((zhi, index) => {
                        const angle = (index * 30 - 90) * (Math.PI / 180); // 从顶部开始顺时针
                        const radius = 38; // 百分比
                        const x = 50 + radius * Math.cos(angle);
                        const y = 50 + radius * Math.sin(angle);
                        const gong = result.gongWei[zhi];

                        return (
                          <div
                            key={zhi}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              width: '90px',
                            }}
                          >
                            <div className={`
                              p-2 rounded-lg text-xs text-center
                              ${index === 0 ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg' :
                                index === 3 || index === 9 ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-md' :
                                'bg-white border border-pink-200 text-gray-700 shadow-sm'}
                              ${gong?.zhuXing?.length > 0 ? 'ring-2 ring-pink-300' : ''}
                            `}>
                              {/* 宫位名称 */}
                              <div className="font-bold text-[10px] mb-1">{gong?.name || zhi}</div>

                              {/* 主星 */}
                              {gong?.zhuXing?.slice(0, 2).map((xing, i) => (
                                <div key={i} className={`text-[9px] ${i === 0 ? 'font-semibold' : ''} truncate`}>
                                  {xing}
                                </div>
                              ))}

                              {/* 辅星/煞星 */}
                              {gong?.auxStars?.[0] && (
                                <div className="text-[8px] text-purple-600 truncate">{gong.auxStars[0]}</div>
                              )}
                              {gong?.minorStars?.[0] && (
                                <div className="text-[8px] text-orange-600 truncate">{gong.minorStars[0]}</div>
                              )}

                              {/* 四化 */}
                              {gong?.siHua?.[0] && (
                                <div className="text-[8px] font-bold text-red-500 mt-0.5">{gong.siHua[0]}</div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* 东南西北标注 */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs text-pink-600 font-semibold">北</div>
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-pink-600 font-semibold">南</div>
                  <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs text-pink-600 font-semibold">东</div>
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-pink-600 font-semibold">西</div>
                </div>

                {/* 命主身主信息 */}
                <div className="flex justify-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">命主</div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold shadow-lg">
                      {result.mingZhu || '?'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">身主</div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold shadow-lg">
                      {result.shenZhu || '?'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 四化星展示 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">四化星</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-white text-center shadow-lg">
                    <div className="text-lg mb-1">化禄</div>
                    <div className="text-xl font-bold">{result.huaLu || '—'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 text-white text-center shadow-lg">
                    <div className="text-lg mb-1">化权</div>
                    <div className="text-xl font-bold">{result.huaQuan || '—'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white text-center shadow-lg">
                    <div className="text-lg mb-1">化科</div>
                    <div className="text-xl font-bold">{result.huaKe || '—'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 text-white text-center shadow-lg">
                    <div className="text-lg mb-1">化忌</div>
                    <div className="text-xl font-bold">{result.huaJi || '—'}</div>
                  </div>
                </div>
              </div>

              {/* 四化解读 */}
              {(result.huaLuJieDu || result.huaQuanJieDu || result.huaKeJieDu || result.huaJiJieDu) && (
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">四化解读</h3>
                  <div className="space-y-3 text-sm">
                    {result.huaLuJieDu && (
                      <div className="flex gap-2">
                        <Badge variant="success" size="sm">化禄</Badge>
                        <span className="text-gray-700">{result.huaLuJieDu}</span>
                      </div>
                    )}
                    {result.huaQuanJieDu && (
                      <div className="flex gap-2">
                        <Badge variant="info" size="sm">化权</Badge>
                        <span className="text-gray-700">{result.huaQuanJieDu}</span>
                      </div>
                    )}
                    {result.huaKeJieDu && (
                      <div className="flex gap-2">
                        <Badge variant="default" size="sm">化科</Badge>
                        <span className="text-gray-700">{result.huaKeJieDu}</span>
                      </div>
                    )}
                    {result.huaJiJieDu && (
                      <div className="flex gap-2">
                        <Badge variant="danger" size="sm">化忌</Badge>
                        <span className="text-gray-700">{result.huaJiJieDu}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 大限小限 */}
              {(result.daXian || result.xiaoXian) && (
                <div className="mb-8 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">大限流年</h3>
                  <div className="space-y-6">
                    {/* 大限 */}
                    {result.daXian && result.daXian.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                          大限（十年一限）
                        </h4>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {result.daXian.map((limit, index) => {
                            const gongWeiKeys = Object.keys(result.gongWei);
                            const gongName = result.gongWei[gongWeiKeys[index]]?.name || `第${index + 1}宫`;
                            return (
                              <div key={index} className="p-2 bg-white rounded-lg shadow-sm text-center border border-pink-100 hover:border-pink-300 transition-colors">
                                <div className="text-[10px] text-pink-600 mb-0.5">{gongName}</div>
                                <div className="text-xs font-medium text-gray-800">{limit}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 小限 */}
                    {result.xiaoXian && result.xiaoXian.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          小限（一年一限）
                        </h4>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {result.xiaoXian.map((limit, index) => {
                            const gongWeiKeys = Object.keys(result.gongWei);
                            const gongName = result.gongWei[gongWeiKeys[index]]?.name || `第${index + 1}宫`;
                            return (
                              <div key={index} className="p-2 bg-white rounded-lg shadow-sm text-center border border-purple-100 hover:border-purple-300 transition-colors">
                                <div className="text-[10px] text-purple-600 mb-0.5">{gongName}</div>
                                <div className="text-xs font-medium text-gray-800">{limit}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 十二宫位详细表格 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">十二宫位详情</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                        <th className="p-3 text-left rounded-l-lg">宫位</th>
                        <th className="p-3 text-center">主星</th>
                        <th className="p-3 text-center">辅星</th>
                        <th className="p-3 text-center">杂曜</th>
                        <th className="p-3 text-center rounded-r-lg">四化</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.gongWei).map(([zhi, gong], index) => (
                        <tr
                          key={zhi}
                          className={`
                            ${index % 2 === 0 ? 'bg-white' : 'bg-pink-50'}
                            hover:bg-pink-100 transition-colors
                          `}
                        >
                          <td className="p-3">
                            <div className="font-semibold text-gray-800">{gong.name}</div>
                            <div className="text-xs text-pink-500">{zhi}</div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {gong.zhuXing.map((xing, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-xs">
                                  {xing}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {gong.auxStars?.map((xing, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 rounded-full text-xs">
                                  {xing}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {gong.minorStars?.map((xing, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-xs">
                                  {xing}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {gong.siHua?.map((xing, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-full text-xs font-semibold">
                                  {xing}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* AI助手 */}
      {result && <AIAssistant system="ziwei" chartData={result} />}
    </div>
  );
}
