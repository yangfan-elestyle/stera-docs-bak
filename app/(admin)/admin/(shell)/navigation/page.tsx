import { redirect } from 'next/navigation';

// 导航编辑已并进内容工作区: 左树里点分组旁的齿轮即可。旧地址保留一次跳转。
export default function LegacyNavigationPage() {
  redirect('/admin/content');
}
