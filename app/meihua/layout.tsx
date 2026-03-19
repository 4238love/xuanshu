import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '梅花易数',
  description: '输入起卦信息后生成本卦、变卦、互卦、错卦、综卦与体用分析。',
};

export default function MeiHuaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
