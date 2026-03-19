import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '八字排盘',
  description: '输入出生信息后生成四柱、格局、喜用神、大运流年与扩展分析。',
};

export default function BaZiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
