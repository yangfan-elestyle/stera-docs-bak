import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

// 落地页用 HomeLayout: 只有顶部导航, 没有文档侧边栏 —— 先给一个开阔的入口,
// 点进去才是文档那套三栏布局。
export default async function LandingLayout({
  params,
  children,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  return <HomeLayout {...baseOptions(lang)}>{children}</HomeLayout>;
}
