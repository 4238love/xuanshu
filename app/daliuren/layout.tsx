import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '大六壬排盘',
  description: '输入起课信息后生成天地盘、四课三传、神将与课式总览。',
};

export default function DaLiuRenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
