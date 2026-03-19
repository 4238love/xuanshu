'use client';

import Link from 'next/link';
import { PageBackground, PageIntro, PageTopBar } from '@/components/ui/page-layout';

interface PaiPanCard {
  id: string;
  name: string;
  icon: string;
  description: string;
  href: string;
  features: string[];
}

const PAI_PAN_TYPES: PaiPanCard[] = [
  {
    id: 'bazi',
    name: '八字排盘',
    icon: '☯',
    description: '四柱、十神、格局与流运的完整命盘档案。',
    href: '/bazi',
    features: ['四柱总览', '五行计量', '流年流运'],
  },
  {
    id: 'liuyao',
    name: '六爻排盘',
    icon: '☷',
    description: '本卦、变卦、六亲与神煞的占断工作台。',
    href: '/liuyao',
    features: ['本变互综', '六神六亲', '神煞筛选'],
  },
  {
    id: 'daliuren',
    name: '大六壬',
    icon: '⚌',
    description: '天地盘、四课三传与神将结构的课式舞台。',
    href: '/daliuren',
    features: ['天地盘', '四课三传', '神将总览'],
  },
  {
    id: 'qimen',
    name: '奇门遁甲',
    icon: '⚍',
    description: '九宫局式、八门九星与八神的综合盘面。',
    href: '/qimen',
    features: ['九宫布局', '值符值使', '高级起局'],
  },
  {
    id: 'meihua',
    name: '梅花易数',
    icon: '☲',
    description: '本卦、互卦、错综与体用分析的轻量盘面。',
    href: '/meihua',
    features: ['本变互错综', '体用关系', '卦象注记'],
  },
  {
    id: 'ziwei',
    name: '紫微斗数',
    icon: '★',
    description: '十二宫、四化与大限小限的星曜盘册。',
    href: '/ziwei',
    features: ['十二宫位', '四化星', '大限小限'],
  },
];

export default function Home() {
  return (
    <PageBackground>
      <PageTopBar kicker="XuanShu Workspace" title="玄数排盘" homeLabel="主页" />

      <main className="relative z-10 mx-auto max-w-[1500px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <PageIntro
            eyebrow="Divination Workspace"
            title="六大排盘，直接进入各自盘面"
            description="保留统一的基础质感与交互标准，但不再强行套用同一套首页叙事、结果顺序和页面壳层。每个模块回到更直接的使用方式。"
            badges={['六大体系', '前端重构', '独立模块']}
          />

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {PAI_PAN_TYPES.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group rounded-[30px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.84)] p-6 shadow-[0_30px_60px_-36px_rgba(61,37,15,0.5)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#b98c5e] hover:shadow-[0_38px_70px_-42px_rgba(61,37,15,0.62)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="text-4xl">{item.icon}</div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a6239]">Divination System</p>
                      <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[0.05em] text-[#2f2118]">{item.name}</h2>
                    </div>
                  </div>
                  <div className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-3 py-1 text-xs text-[#5b4430] transition group-hover:border-[#a27140] group-hover:bg-[#fff7ed]">
                    进入
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-[#66584d]">{item.description}</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {item.features.map((feature) => (
                    <div
                      key={feature}
                      className="rounded-[18px] border border-[#d8cab6] bg-white/70 px-4 py-3 text-sm text-[#4b3a2c]"
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[rgba(117,76,40,0.12)] pt-4">
                  <span className="text-sm text-[#7b6b5f]">独立排盘模块</span>
                  <span className="text-sm font-medium text-[#5b4430] transition group-hover:translate-x-1">开始排盘 →</span>
                </div>
              </Link>
            ))}
          </section>

        </div>
      </main>
    </PageBackground>
  );
}
