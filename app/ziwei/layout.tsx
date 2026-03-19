import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '紫微斗数排盘',
  description: '输入出生信息后生成十二宫、四化、命主身主与大限小限分析。',
};

export default function ZiWeiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
