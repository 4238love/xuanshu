import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '六爻排盘',
  description: '输入占事与起卦信息后生成本卦、变卦、六亲六神与神煞分析。',
};

export default function LiuYaoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
