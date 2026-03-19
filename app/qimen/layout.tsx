import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '奇门遁甲排盘',
  description: '输入时间与占事后生成奇门遁甲局式、九宫盘、值符值使与盘面说明。',
};

export default function QiMenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
