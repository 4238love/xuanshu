'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBaZiPaiPan } from '@/lib/bazi';
import { BaZiSettings, BaZiResult } from '@/types';

export default function BaZiPage() {
  const [settings, setSettings] = useState<BaZiSettings>({
    name: '',
    occupy: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0
  });

  const [result, setResult] = useState<BaZiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paiPanResult = createBaZiPaiPan({
        ...settings,
        showLiuRi: true,  // 确保显示流日
        showLiuYue: true, // 确保显示流月
        showLiuShi: true  // 确保显示流时
      });
      setResult(paiPanResult);
    } catch (error) {
      console.error('排盘失败:', error);
      alert('排盘失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* 头部 */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-3xl">☯</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  八字排盘
                </h1>
                <p className="text-xs text-gray-500">四柱八字 · 推算命理</p>
              </div>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 输入表单 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">📝</span>
              输入信息
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 姓名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名（可选）
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="请输入姓名"
                  />
                </div>

                {/* 占事 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    占事（可选）
                  </label>
                  <input
                    type="text"
                    value={settings.occupy}
                    onChange={(e) => setSettings({ ...settings, occupy: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="请输入占事"
                  />
                </div>

                {/* 性别 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性别
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={1}
                        checked={settings.sex === 1}
                        onChange={() => setSettings({ ...settings, sex: 1 })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span>男</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={0}
                        checked={settings.sex === 0}
                        onChange={() => setSettings({ ...settings, sex: 0 })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span>女</span>
                    </label>
                  </div>
                </div>

                {/* 日期类型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日期类型
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={0}
                        checked={settings.dateType === 0}
                        onChange={() => setSettings({ ...settings, dateType: 0 })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span>公历</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={1}
                        checked={settings.dateType === 1}
                        onChange={() => setSettings({ ...settings, dateType: 1 })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span>农历</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 日期时间 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出生日期
                  </label>
                  <input
                    type="date"
                    value={settings.date.split(' ')[0]}
                    onChange={(e) => {
                      const time = settings.date.split(' ')[1] || '00:00:00';
                      setSettings({ ...settings, date: `${e.target.value} ${time}` });
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出生时间
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={settings.date.split(' ')[1] || '00:00:00'}
                    onChange={(e) => {
                      const date = settings.date.split(' ')[0];
                      setSettings({ ...settings, date: `${date} ${e.target.value}` });
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '排盘中...' : '开始排盘'}
              </button>
            </form>
          </div>

          {/* 排盘结果 */}
          {result && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-3xl">📊</span>
                排盘结果
              </h2>

              {/* 基础信息 */}
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">基础信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {result.name && (
                    <div>
                      <span className="text-gray-600">姓名：</span>
                      <span className="font-medium">{result.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">性别：</span>
                    <span className="font-medium">{result.sex}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">年龄：</span>
                    <span className="font-medium">{result.age}岁（实岁）</span>
                    {result.xuSui && (
                      <span className="text-gray-500 ml-2">/ {result.xuSui}岁（虚岁）</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600">生肖：</span>
                    <span className="font-medium">{result.shengXiao}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">星座：</span>
                    <span className="font-medium">{result.xingZuo}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">星期：</span>
                    <span className="font-medium">{result.xingQi}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">季节：</span>
                    <span className="font-medium">{result.jiJie}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <div className="text-sm">
                    <span className="text-gray-600">公历：</span>
                    <span className="font-medium">{result.solar}</span>
                  </div>
                  <div className="text-sm mt-2">
                    <span className="text-gray-600">农历：</span>
                    <span className="font-medium">{result.lunar}</span>
                  </div>
                </div>
              </div>

              {/* 节气信息 */}
              {result.jieQiInfo && (
                <div className="mb-8 p-6 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl border border-cyan-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🌸</span>
                    出生时节气
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">上一节气</div>
                      <div className="text-lg font-bold text-gray-700">{result.jieQiInfo.prev}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-cyan-100 to-sky-100 rounded-lg border-2 border-cyan-300">
                      <div className="text-xs text-gray-600 mb-1">出生时节气</div>
                      <div className="text-xl font-bold text-cyan-700">{result.jieQiInfo.current}</div>
                      {result.jieQiInfo.currentTime && (
                        <div className="text-xs text-gray-600 mt-1">{result.jieQiInfo.currentTime}</div>
                      )}
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">下一节气</div>
                      <div className="text-lg font-bold text-gray-700">{result.jieQiInfo.next}</div>
                      {result.jieQiInfo.nextTime && (
                        <div className="text-xs text-gray-600 mt-1">{result.jieQiInfo.nextTime}</div>
                      )}
                      {result.jieQiInfo.daysToNext !== undefined && result.jieQiInfo.daysToNext > 0 && (
                        <div className="text-xs text-cyan-600 mt-1">出生后 {result.jieQiInfo.daysToNext} 天</div>
                      )}
                      {result.jieQiInfo.daysToNext !== undefined && result.jieQiInfo.daysToNext <= 0 && (
                        <div className="text-xs text-cyan-600 mt-1">已过</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 五不遇时警告 */}
              {result.wuBuYuShi && (
                <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-300">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <h3 className="text-lg font-semibold text-red-700">五不遇时</h3>
                      <p className="text-sm text-gray-700 mt-1">
                        此八字为"五不遇时"，日干与时辰组合较为特殊，需要特别注意时辰的影响。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 八字 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">四柱八字</h3>
                <div className="grid grid-cols-4 gap-4">
                  {['年柱', '月柱', '日柱', '时柱'].map((name, index) => (
                    <div key={index} className="text-center p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white shadow-lg">
                      <div className="text-sm mb-2 opacity-90">{name}</div>
                      <div className="text-3xl font-bold mb-2">{result.baZi[index]}</div>
                      <div className="text-sm opacity-90">{result.baZiWuXing[index]}</div>
                      <div className="text-xs mt-2 opacity-75">{result.baZiNaYin[index]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 骨重计算 */}
              {result.guZhong && (
                <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    称骨算命
                  </h3>
                  <div className="text-center mb-4">
                    <div className="inline-block p-6 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl border-2 border-amber-300">
                      <div className="text-sm text-gray-600 mb-2">骨重</div>
                      <div className="text-4xl font-bold text-amber-700">{result.guZhong.guZhongText}</div>
                      <div className="text-lg text-gray-600 mt-1">({result.guZhong.guZhong}两)</div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/60 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">命理批注</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{result.guZhong.piZhu}</p>
                  </div>
                </div>
              )}

              {/* 十神系统 */}
              {result.shiShen && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">十神分析</h3>

                  {/* 天干十神 */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-700 mb-3">天干十神</h4>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: '年干', value: result.shiShen.year, gan: result.yearGan },
                        { label: '月干', value: result.shiShen.month, gan: result.monthGan },
                        { label: '日干', value: result.shiShen.day, gan: result.dayGan },
                        { label: '时干', value: result.shiShen.hour, gan: result.hourGan }
                      ].map((item, index) => (
                        <div key={index} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg text-center border border-indigo-200">
                          <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                          <div className="text-2xl font-bold text-gray-800 mb-1">{item.gan}</div>
                          <div className={`text-sm font-medium ${item.value === '日主' ? 'text-red-600' : 'text-indigo-600'}`}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 地支藏干十神 */}
                  {result.shiShenZhi && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-700 mb-3">地支藏干十神</h4>
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { label: '年支', value: result.shiShenZhi.year, zhi: result.yearZhi },
                          { label: '月支', value: result.shiShenZhi.month, zhi: result.monthZhi },
                          { label: '日支', value: result.shiShenZhi.day, zhi: result.dayZhi },
                          { label: '时支', value: result.shiShenZhi.hour, zhi: result.hourZhi }
                        ].map((item, index) => (
                          <div key={index} className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                            <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                            <div className="text-xl font-bold text-gray-800 mb-2">{item.zhi}</div>
                            <div className="text-xs text-teal-700 space-y-1">
                              {item.value.map((ss, idx) => (
                                <div key={idx} className="bg-white/60 rounded px-2 py-1">{ss}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 地支藏干详情 */}
                  {result.diZhiCangGan && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-700 mb-3">地支藏干详情</h4>
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { label: '年支', zhi: result.yearZhi, data: result.diZhiCangGan.year },
                          { label: '月支', zhi: result.monthZhi, data: result.diZhiCangGan.month },
                          { label: '日支', zhi: result.dayZhi, data: result.diZhiCangGan.day },
                          { label: '时支', zhi: result.hourZhi, data: result.diZhiCangGan.hour }
                        ].map((item, index) => (
                          <div key={index} className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                            <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                            <div className="text-xl font-bold text-gray-800 mb-2">{item.zhi}</div>
                            <div className="text-xs space-y-1">
                              {item.data.gan.map((gan, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white/60 rounded px-2 py-1">
                                  <span className="font-medium text-gray-700">{gan}</span>
                                  <span className="text-emerald-600">{item.data.shiShen[idx]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 十神格局分析 */}
                  {result.shiShenAnalysis && (
                    <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                      <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        格局分析
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{result.shiShenAnalysis}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 五行统计 */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">五行统计</h3>
                <div className="grid grid-cols-5 gap-4 text-center">
                  {[
                    { name: '木', count: result.muCount, color: 'text-green-600' },
                    { name: '火', count: result.huoCount, color: 'text-red-600' },
                    { name: '土', count: result.tuCount, color: 'text-yellow-600' },
                    { name: '金', count: result.jinCount, color: 'text-gray-600' },
                    { name: '水', count: result.shuiCount, color: 'text-blue-600' }
                  ].map((item) => (
                    <div key={item.name} className="p-4 bg-white rounded-lg shadow">
                      <div className={`text-2xl font-bold ${item.color}`}>{item.count}</div>
                      <div className="text-sm text-gray-600 mt-1">{item.name}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200 space-y-2 text-sm">
                  {result.wuXingWangShuai && (
                    <div>
                      <span className="text-gray-600">五行旺衰：</span>
                      <span className="font-medium">{result.wuXingWangShuai}</span>
                    </div>
                  )}
                  {result.wuXingQueShi && result.wuXingQueShi.length > 0 && (
                    <div>
                      <span className="text-gray-600">五行缺失：</span>
                      <span className="font-medium text-red-600">{result.wuXingQueShi.join('、')}</span>
                    </div>
                  )}
                  {result.xiYongShen && (
                    <div>
                      <span className="text-gray-600">喜用神：</span>
                      <span className="font-medium text-purple-600">{result.xiYongShen}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 身强身弱判断 */}
              {result.shenQiangShenRuo && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">身强身弱判断</h3>

                  {/* 判断结果 */}
                  <div className="mb-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">💪</span>
                        <div>
                          <h4 className="text-2xl font-bold text-indigo-700">{result.shenQiangShenRuo.result}</h4>
                          <p className="text-sm text-gray-600 mt-1">综合评分：{result.shenQiangShenRuo.score > 0 ? '+' : ''}{result.shenQiangShenRuo.score}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">评分标准</div>
                        <div className="text-xs text-gray-500 mt-1">
                          &gt;10: 身强 | -10~10: 中和 | &lt;-10: 身弱
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <p className="text-sm text-gray-700 leading-relaxed">{result.shenQiangShenRuo.analysis}</p>
                    </div>
                  </div>

                  {/* 详细评分 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: '年干', key: 'yearGan', gan: result.yearGan },
                      { label: '月干', key: 'monthGan', gan: result.monthGan },
                      { label: '时干', key: 'hourGan', gan: result.hourGan },
                      { label: '年支', key: 'yearZhi', zhi: result.yearZhi },
                      { label: '月支', key: 'monthZhi', zhi: result.monthZhi },
                      { label: '日支', key: 'dayZhi', zhi: result.dayZhi },
                      { label: '时支', key: 'hourZhi', zhi: result.hourZhi }
                    ].map((item) => {
                      const detail = result.shenQiangShenRuo!.details[item.key as keyof typeof result.shenQiangShenRuo.details];
                      const isPositive = detail.score > 0;
                      return (
                        <div key={item.key} className={`p-3 rounded-lg border ${
                          isPositive
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                            : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                        }`}>
                          <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                          <div className="text-lg font-bold text-gray-800">{item.gan || item.zhi}</div>
                          <div className={`text-xs font-medium mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {detail.relation} ({isPositive ? '+' : ''}{detail.score})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 干支详情 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">天干</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">年干：</span><span className="font-medium">{result.yearGan}</span></div>
                    <div><span className="text-gray-600">月干：</span><span className="font-medium">{result.monthGan}</span></div>
                    <div><span className="text-gray-600">日干：</span><span className="font-medium">{result.dayGan}</span></div>
                    <div><span className="text-gray-600">时干：</span><span className="font-medium">{result.hourGan}</span></div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">地支</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">年支：</span><span className="font-medium">{result.yearZhi}</span></div>
                    <div><span className="text-gray-600">月支：</span><span className="font-medium">{result.monthZhi}</span></div>
                    <div><span className="text-gray-600">日支：</span><span className="font-medium">{result.dayZhi}</span></div>
                    <div><span className="text-gray-600">时支：</span><span className="font-medium">{result.hourZhi}</span></div>
                  </div>
                </div>
              </div>

              {/* 胎元、胎息、命宫、身宫 */}
              {(result.taiYuan || result.taiXi || result.mingGong || result.shenGong) && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">特殊宫位</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {result.taiYuan && (
                      <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-200 text-center">
                        <div className="text-xs text-gray-600 mb-2">胎元</div>
                        <div className="text-2xl font-bold text-pink-700">{result.taiYuan}</div>
                        <div className="text-xs text-gray-500 mt-2">受孕月份</div>
                      </div>
                    )}
                    {result.taiXi && (
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200 text-center">
                        <div className="text-xs text-gray-600 mb-2">胎息</div>
                        <div className="text-2xl font-bold text-purple-700">{result.taiXi}</div>
                        <div className="text-xs text-gray-500 mt-2">胎儿呼吸</div>
                      </div>
                    )}
                    {result.mingGong && (
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 text-center">
                        <div className="text-xs text-gray-600 mb-2">命宫</div>
                        <div className="text-2xl font-bold text-blue-700">{result.mingGong}</div>
                        <div className="text-xs text-gray-500 mt-2">命运宫位</div>
                      </div>
                    )}
                    {result.shenGong && (
                      <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border border-teal-200 text-center">
                        <div className="text-xs text-gray-600 mb-2">身宫</div>
                        <div className="text-2xl font-bold text-teal-700">{result.shenGong}</div>
                        <div className="text-xs text-gray-500 mt-2">身体宫位</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 神煞系统 */}
              {result.shenSha && result.shenSha.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">神煞分析</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: '年柱', ganZhi: result.baZi[0], shenSha: result.shenSha[0] },
                      { label: '月柱', ganZhi: result.baZi[1], shenSha: result.shenSha[1] },
                      { label: '日柱', ganZhi: result.baZi[2], shenSha: result.shenSha[2] },
                      { label: '时柱', ganZhi: result.baZi[3], shenSha: result.shenSha[3] }
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                        <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                        <div className="text-xl font-bold text-gray-800 mb-2">{item.ganZhi}</div>
                        <div className="space-y-1">
                          {item.shenSha && item.shenSha.length > 0 ? (
                            item.shenSha.map((ss, idx) => (
                              <div key={idx} className="text-xs bg-white/60 rounded px-2 py-1 text-rose-700">
                                {ss}
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-400">无</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 神煞汇总 */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">神煞汇总</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(result.shenSha.flat())).map((ss, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-amber-700 border border-amber-300">
                          {ss}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 九星系统 */}
              {result.jiuXing && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">九星系统</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: '年柱', data: result.jiuXing.year, ganZhi: result.baZi[0] },
                      { label: '月柱', data: result.jiuXing.month, ganZhi: result.baZi[1] },
                      { label: '日柱', data: result.jiuXing.day, ganZhi: result.baZi[2] },
                      { label: '时柱', data: result.jiuXing.hour, ganZhi: result.baZi[3] }
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                        <div className="text-center mb-3">
                          <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                          <div className="text-xl font-bold text-gray-800">{item.ganZhi}</div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center p-2 bg-white/60 rounded">
                            <span className="text-gray-600">五行</span>
                            <span className="font-medium text-violet-700">{item.data.wuXing}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white/60 rounded">
                            <span className="text-gray-600">方位</span>
                            <span className="font-medium text-violet-700">{item.data.position}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white/60 rounded">
                            <span className="text-gray-600">玄空</span>
                            <span className="font-medium text-violet-700">{item.data.xuanKong}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white/60 rounded">
                            <span className="text-gray-600">北斗</span>
                            <span className="font-medium text-violet-700">{item.data.beiDou}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white/60 rounded">
                            <span className="text-gray-600">奇门</span>
                            <span className="font-medium text-violet-700">{item.data.qiMen}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white/60 rounded">
                            <span className="text-gray-600">太乙</span>
                            <span className="font-medium text-violet-700">{item.data.taiYi}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded border border-green-200">
                            <span className="text-gray-600">吉凶</span>
                            <span className="font-medium text-green-700">{item.data.xuanKongLuck}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 五行生克关系 */}
              {result.wuXingShengKe && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">五行生克关系</h3>

                  {/* 天干五合 */}
                  {result.wuXingShengKe.tianGanWuHe && result.wuXingShengKe.tianGanWuHe.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">🤝</span>
                        天干五合
                      </h4>
                      <div className="space-y-2">
                        {result.wuXingShengKe.tianGanWuHe.map((item, idx) => (
                          <div key={idx} className="text-sm bg-white/60 rounded px-3 py-2">
                            <span className="font-medium text-green-700">{item.position1}</span>
                            <span className="text-gray-600"> {item.gan1} </span>
                            <span className="text-green-600">合</span>
                            <span className="font-medium text-green-700"> {item.position2}</span>
                            <span className="text-gray-600"> {item.gan2}</span>
                            {item.heHua && <span className="text-green-600"> → 化{item.heHua}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 地支三合 */}
                  {result.wuXingShengKe.diZhiSanHe && result.wuXingShengKe.diZhiSanHe.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">🔷</span>
                        地支三合
                      </h4>
                      <div className="space-y-2">
                        {result.wuXingShengKe.diZhiSanHe.map((item, idx) => (
                          <div key={idx} className="text-sm bg-white/60 rounded px-3 py-2">
                            <span className="font-medium text-blue-700">
                              {item.positions.join('、')}
                            </span>
                            <span className="text-gray-600"> {item.zhis.join('、')} </span>
                            <span className="text-blue-600">
                              {item.isComplete ? '三合' : '半合'}{item.wuXing}局
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 地支三会 */}
                  {result.wuXingShengKe.diZhiSanHui && result.wuXingShengKe.diZhiSanHui.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">🔶</span>
                        地支三会
                      </h4>
                      <div className="space-y-2">
                        {result.wuXingShengKe.diZhiSanHui.map((item, idx) => (
                          <div key={idx} className="text-sm bg-white/60 rounded px-3 py-2">
                            <span className="font-medium text-purple-700">
                              {item.positions.join('、')}
                            </span>
                            <span className="text-gray-600"> {item.zhis.join('、')} </span>
                            <span className="text-purple-600">
                              {item.isComplete ? '三会' : '半会'}{item.wuXing}局
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 地支六合 */}
                  {result.wuXingShengKe.diZhiLiuHe && result.wuXingShengKe.diZhiLiuHe.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">💚</span>
                        地支六合
                      </h4>
                      <div className="space-y-2">
                        {result.wuXingShengKe.diZhiLiuHe.map((item, idx) => (
                          <div key={idx} className="text-sm bg-white/60 rounded px-3 py-2">
                            <span className="font-medium text-teal-700">{item.position1}</span>
                            <span className="text-gray-600"> {item.zhi1} </span>
                            <span className="text-teal-600">合</span>
                            <span className="font-medium text-teal-700"> {item.position2}</span>
                            <span className="text-gray-600"> {item.zhi2}</span>
                            {item.heHua && <span className="text-teal-600"> → 化{item.heHua}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 地支相冲 */}
                  {result.wuXingShengKe.diZhiXiangChong && result.wuXingShengKe.diZhiXiangChong.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        地支相冲
                      </h4>
                      <div className="space-y-2">
                        {result.wuXingShengKe.diZhiXiangChong.map((item, idx) => (
                          <div key={idx} className="text-sm bg-white/60 rounded px-3 py-2">
                            <span className="font-medium text-red-700">{item.position1}</span>
                            <span className="text-gray-600"> {item.zhi1} </span>
                            <span className="text-red-600">冲</span>
                            <span className="font-medium text-red-700"> {item.position2}</span>
                            <span className="text-gray-600"> {item.zhi2}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 地支相刑 */}
                  {result.wuXingShengKe.diZhiXiangXing && result.wuXingShengKe.diZhiXiangXing.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        地支相刑
                      </h4>
                      <div className="space-y-2">
                        {result.wuXingShengKe.diZhiXiangXing.map((item, idx) => (
                          <div key={idx} className="text-sm bg-white/60 rounded px-3 py-2">
                            <span className="font-medium text-orange-700">
                              {item.positions.join('、')}
                            </span>
                            <span className="text-gray-600"> {item.zhis.join('、')} </span>
                            <span className="text-orange-600">{item.xingType}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 地支相害 */}
                  {result.wuXingShengKe.diZhiXiangHai && result.wuXingShengKe.diZhiXiangHai.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-300">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">🔸</span>
                        地支相害
                      </h4>
                      <div className="space-y-2">
                        {result.wuXingShengKe.diZhiXiangHai.map((item, idx) => (
                          <div key={idx} className="text-sm bg-white/60 rounded px-3 py-2">
                            <span className="font-medium text-gray-700">{item.position1}</span>
                            <span className="text-gray-600"> {item.zhi1} </span>
                            <span className="text-gray-600">害</span>
                            <span className="font-medium text-gray-700"> {item.position2}</span>
                            <span className="text-gray-600"> {item.zhi2}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 地支相破 */}
                  {result.wuXingShengKe.diZhiXiangPo && result.wuXingShengKe.diZhiXiangPo.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-stone-50 to-neutral-50 rounded-lg border border-stone-300">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">💔</span>
                        地支相破
                      </h4>
                      <div className="space-y-2">
                        {result.wuXingShengKe.diZhiXiangPo.map((item, idx) => (
                          <div key={idx} className="text-sm bg-white/60 rounded px-3 py-2">
                            <span className="font-medium text-stone-700">{item.position1}</span>
                            <span className="text-gray-600"> {item.zhi1} </span>
                            <span className="text-stone-600">破</span>
                            <span className="font-medium text-stone-700"> {item.position2}</span>
                            <span className="text-gray-600"> {item.zhi2}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 格局判断系统 */}
              {result.geJu && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">格局判断</h3>

                  {/* 格局信息 */}
                  <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-300 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">🎯</span>
                      <div>
                        <h4 className="text-2xl font-bold text-indigo-700">{result.geJu.geJuName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{result.geJu.geJuMeaning}</p>
                      </div>
                    </div>

                    {/* 格局成败 */}
                    <div className="mt-4 p-4 bg-white/60 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">格局成败</h5>
                      <p className="text-sm text-gray-700">{result.geJu.geJuChengBai}</p>
                    </div>
                  </div>

                  {/* 用神系统 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span>✨</span>
                        用神
                      </h5>
                      <p className="text-lg font-bold text-green-700">{result.geJu.yongShen}</p>
                      <p className="text-xs text-gray-600 mt-1">命局的核心，最需要的五行</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span>💫</span>
                        喜神
                      </h5>
                      <p className="text-lg font-bold text-blue-700">{result.geJu.xiShen}</p>
                      <p className="text-xs text-gray-600 mt-1">辅助用神，有利的五行</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span>⚠️</span>
                        忌神
                      </h5>
                      <p className="text-lg font-bold text-orange-700">{result.geJu.jiShen}</p>
                      <p className="text-xs text-gray-600 mt-1">不利的五行，需要避免</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-300">
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span>🚫</span>
                        仇神
                      </h5>
                      <p className="text-lg font-bold text-gray-700">{result.geJu.chouShen}</p>
                      <p className="text-xs text-gray-600 mt-1">克制用神，最不利的五行</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 大运流年系统 */}
              {result.daYun && result.daYun.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">大运流年</h3>

                  {/* 起运信息 */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="text-sm">
                      <span className="text-gray-600">起运岁数：</span>
                      <span className="font-medium text-blue-700">{result.qiYunSui}岁</span>
                    </div>
                  </div>

                  {/* 当前大运和流年 */}
                  {(result.currentDaYun || result.currentLiuNian) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {result.currentDaYun && (
                        <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">当前大运</h4>
                          <div className="text-2xl font-bold text-purple-700 mb-1">{result.currentDaYun.ganZhi}</div>
                          <div className="text-sm text-purple-600 mb-1">{result.currentDaYun.shiShen}</div>
                          <div className="text-xs text-gray-600">
                            {result.currentDaYun.startAge}岁 - {result.currentDaYun.endAge}岁
                          </div>
                          {result.currentDaYun.shenSha && result.currentDaYun.shenSha.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-purple-200">
                              <div className="text-xs text-gray-600 mb-1">神煞</div>
                              <div className="flex flex-wrap gap-1">
                                {result.currentDaYun.shenSha.map((ss, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-purple-200 rounded text-xs text-purple-700">
                                    {ss}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {result.currentLiuNian && (
                        <div className="p-4 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg border-2 border-green-300">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">当前流年</h4>
                          <div className="text-2xl font-bold text-green-700 mb-1">{result.currentLiuNian.ganZhi}</div>
                          <div className="text-sm text-green-600 mb-1">{result.currentLiuNian.shiShen}</div>
                          <div className="text-xs text-gray-600">
                            {result.currentLiuNian.year}年（{result.currentLiuNian.age}岁）
                          </div>
                          {result.currentLiuNian.shenSha && result.currentLiuNian.shenSha.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-green-200">
                              <div className="text-xs text-gray-600 mb-1">神煞</div>
                              <div className="flex flex-wrap gap-1">
                                {result.currentLiuNian.shenSha.map((ss, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-green-200 rounded text-xs text-green-700">
                                    {ss}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 大运列表 */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-700 mb-3">大运详情</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {result.daYun.slice(0, 10).map((dy, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg text-center border ${
                            result.currentDaYun && dy.ganZhi === result.currentDaYun.ganZhi
                              ? 'bg-purple-100 border-purple-400 shadow-md'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="text-lg font-bold text-gray-800">{dy.ganZhi}</div>
                          <div className="text-xs text-indigo-600 my-1">{dy.shiShen}</div>
                          <div className="text-xs text-gray-500">
                            {dy.startAge}-{dy.endAge}岁
                          </div>
                          {dy.shenSha && dy.shenSha.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-300">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {dy.shenSha.slice(0, 3).map((ss, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 bg-indigo-100 rounded text-xs text-indigo-600">
                                    {ss}
                                  </span>
                                ))}
                                {dy.shenSha.length > 3 && (
                                  <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs text-gray-600">
                                    +{dy.shenSha.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 流年列表 */}
                  {result.liuNian && result.liuNian.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-3">近期流年</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {result.liuNian.map((ln, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg text-center border ${
                              result.currentLiuNian && ln.year === result.currentLiuNian.year
                                ? 'bg-green-100 border-green-400 shadow-md'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="text-sm font-bold text-gray-800">{ln.year}</div>
                            <div className="text-lg font-bold text-gray-800">{ln.ganZhi}</div>
                            <div className="text-xs text-teal-600 my-1">{ln.shiShen}</div>
                            <div className="text-xs text-gray-500">{ln.age}岁</div>
                            {ln.shenSha && ln.shenSha.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-300">
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {ln.shenSha.slice(0, 3).map((ss, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-teal-100 rounded text-xs text-teal-600">
                                      {ss}
                                    </span>
                                  ))}
                                  {ln.shenSha.length > 3 && (
                                    <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs text-gray-600">
                                      +{ln.shenSha.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 小运系统 */}
              {result.xiaoYun && result.xiaoYun.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">小运（未起运前）</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {result.xiaoYun.map((xy, index) => (
                      <div key={index} className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 text-center">
                        <div className="text-lg font-bold text-gray-800">{xy.ganZhi}</div>
                        <div className="text-xs text-orange-600 mt-1">{xy.age}岁</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 流月系统 */}
              {result.liuYue && result.liuYue.length > 0 && (
                <div className="mb-8">
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <span className="text-2xl">📅</span>
                          流月（点击展开）
                        </h3>
                        <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                      </div>
                    </summary>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
                      {result.liuYue.map((ly, index) => (
                        <div key={index} className={`p-3 rounded-lg text-center ${
                          ly.isCurrent
                            ? 'bg-gradient-to-br from-sky-200 to-cyan-200 border-2 border-sky-500 shadow-lg'
                            : 'bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200'
                        }`}>
                          <div className="text-xs text-gray-600 mb-1">{ly.monthName}</div>
                          <div className={`text-lg font-bold ${ly.isCurrent ? 'text-sky-700' : 'text-gray-800'}`}>{ly.ganZhi}</div>
                          <div className={`text-xs mt-1 ${ly.isCurrent ? 'text-sky-700 font-semibold' : 'text-sky-600'}`}>
                            {ly.month}月{ly.isCurrent && ' (当前)'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* 流日系统 */}
              {result.liuRi && result.liuRi.length > 0 && (
                <div className="mb-8">
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-lime-50 to-green-50 rounded-lg border border-lime-200 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <span className="text-2xl">📆</span>
                          流日（点击展开，共{result.liuRi.length}天）
                        </h3>
                        <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                      </div>
                    </summary>
                    <div className="mt-4 grid grid-cols-3 md:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
                      {result.liuRi.map((lr, index) => (
                        <div key={index} className={`p-2 rounded text-center ${
                          lr.isCurrent
                            ? 'bg-gradient-to-br from-lime-200 to-green-200 border-2 border-lime-500 shadow-lg'
                            : 'bg-gradient-to-br from-lime-50 to-green-50 border border-lime-200'
                        }`}>
                          <div className={`text-xs ${lr.isCurrent ? 'text-lime-700 font-semibold' : 'text-gray-600'}`}>
                            {lr.day}日{lr.isCurrent && ' (今天)'}
                          </div>
                          <div className={`text-sm font-bold ${lr.isCurrent ? 'text-lime-700' : 'text-gray-800'}`}>{lr.ganZhi}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* 流时系统 */}
              {result.liuShi && result.liuShi.length > 0 && (
                <div className="mb-8">
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-fuchsia-50 to-pink-50 rounded-lg border border-fuchsia-200 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <span className="text-2xl">🕐</span>
                          流时（点击展开）
                        </h3>
                        <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                      </div>
                    </summary>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
                      {result.liuShi.map((ls, index) => (
                        <div key={index} className={`p-3 rounded-lg text-center ${
                          ls.isCurrent
                            ? 'bg-gradient-to-br from-fuchsia-200 to-pink-200 border-2 border-fuchsia-500 shadow-lg'
                            : 'bg-gradient-to-br from-fuchsia-50 to-pink-50 border border-fuchsia-200'
                        }`}>
                          <div className={`text-xs mb-1 ${ls.isCurrent ? 'text-fuchsia-700 font-semibold' : 'text-gray-600'}`}>
                            {ls.hourName}{ls.isCurrent && ' (当前)'}
                          </div>
                          <div className={`text-lg font-bold ${ls.isCurrent ? 'text-fuchsia-700' : 'text-gray-800'}`}>{ls.ganZhi}</div>
                          <div className={`text-xs mt-1 ${ls.isCurrent ? 'text-fuchsia-700 font-semibold' : 'text-fuchsia-600'}`}>{ls.hour}时</div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
