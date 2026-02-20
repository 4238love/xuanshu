'use client';

import Link from 'next/link';
import { useState } from 'react';

interface PaiPanCard {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  href: string;
  features: string[];
}

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const paiPanTypes: PaiPanCard[] = [
    {
      id: 'bazi',
      name: '八字排盘',
      icon: '☯',
      description: '四柱八字，推算命理',
      color: 'from-purple-500 to-pink-500',
      href: '/bazi',
      features: ['年柱月柱', '日柱时柱', '十神分析']
    },
    {
      id: 'liuyao',
      name: '六爻排盘',
      icon: '☷',
      description: '六爻占卜，预测吉凶',
      color: 'from-blue-500 to-cyan-500',
      href: '/liuyao',
      features: ['本卦变卦', '六神配置', '世应分析']
    },
    {
      id: 'daliuren',
      name: '大六壬',
      icon: '⚌',
      description: '三式之首，神机妙算',
      color: 'from-green-500 to-emerald-500',
      href: '/daliuren',
      features: ['四课三传', '十二神将', '贵神分析']
    },
    {
      id: 'qimen',
      name: '奇门遁甲',
      icon: '⚍',
      description: '帝王之学，运筹帷幄',
      color: 'from-orange-500 to-red-500',
      href: '/qimen',
      features: ['九宫八卦', '八门九星', '神煞配置']
    },
    {
      id: 'meihua',
      name: '梅花易数',
      icon: '☲',
      description: '心易占卜，随机应变',
      color: 'from-indigo-500 to-purple-500',
      href: '/meihua',
      features: ['本卦互卦', '变卦分析', '卦象解读']
    },
    {
      id: 'ziwei',
      name: '紫微斗数',
      icon: '★',
      description: '星曜命盘，推演人生',
      color: 'from-pink-500 to-rose-500',
      href: '/ziwei',
      features: ['十二宫位', '星曜分布', '大运流年']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* 头部 */}
      <header className="sticky top-0 z-50 border-b border-purple-100 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-pulse">☯</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  易学排盘工具
                </h1>
                <p className="text-sm text-gray-500">传统易学 · 现代呈现</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-pink-100/30 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              探索中国传统
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                易学文化
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              集成六大排盘系统，传承千年智慧
              <br />
              以现代科技呈现古老玄学，精准算法，即时呈现
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                <span className="text-purple-500">✓</span>
                <span>算法精准</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                <span className="text-pink-500">✓</span>
                <span>界面精美</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                <span className="text-blue-500">✓</span>
                <span>即时计算</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 排盘卡片网格 */}
      <main className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {paiPanTypes.map((type, index) => (
            <Link
              key={type.id}
              href={type.href}
              onMouseEnter={() => setHoveredCard(type.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideUp 0.6s ease-out forwards'
              }}
            >
              {/* 渐变背景层 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* 装饰性光晕 */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${type.color} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

              {/* 内容区域 */}
              <div className="relative z-10 p-8">
                {/* 图标 */}
                <div className="mb-6 flex items-center justify-between">
                  <div className={`text-7xl transform transition-all duration-500 ${
                    hoveredCard === type.id ? 'scale-110 rotate-12' : 'scale-100'
                  }`}>
                    {type.icon}
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${type.color} opacity-20 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center`}>
                    <span className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">→</span>
                  </div>
                </div>

                {/* 标题和描述 */}
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-white mb-3 transition-colors duration-500">
                  {type.name}
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 mb-6 transition-colors duration-500">
                  {type.description}
                </p>

                {/* 特性列表 */}
                <div className="space-y-2 mb-6">
                  {type.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-white/80 transition-colors duration-500"
                      style={{
                        transitionDelay: `${idx * 50}ms`
                      }}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${type.color} group-hover:bg-white`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* 操作按钮 */}
                <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${type.color} bg-clip-text text-transparent group-hover:text-white transition-colors duration-500`}>
                  开始排盘
                  <span className="transform group-hover:translate-x-2 transition-transform duration-500">→</span>
                </div>
              </div>

              {/* 底部装饰条 */}
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${type.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
            </Link>
          ))}
        </div>

        {/* 特色说明 */}
        <div className="mt-24 max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            为什么选择我们
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                ✓
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">功能完整</h4>
              <p className="text-gray-600 leading-relaxed">
                六大排盘系统，功能齐全，算法精准，涵盖传统易学核心体系
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                ✨
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">界面精美</h4>
              <p className="text-gray-600 leading-relaxed">
                现代化设计，流畅交互，视觉体验优秀，让传统文化焕发新生
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-3xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                ⚡
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">快速便捷</h4>
              <p className="text-gray-600 leading-relaxed">
                即时计算，结果详尽，操作简单易用，随时随地进行排盘分析
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-purple-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">☯</span>
            <span className="text-lg font-semibold text-gray-700">易学排盘工具</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            © 2024 易学排盘工具 · 仅供参考学习使用
          </p>
          <p className="text-xs text-gray-400">
            基于 Next.js 构建 · 传承传统文化 · 弘扬中华智慧
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}
