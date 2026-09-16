import { revalidatePath } from 'next/cache';
import { source } from '@/lib/source';

/**
 * 保存后刷新前台。两步缺一不可:
 *   1. source.revalidate('docs') 清 dynamicLoader 的 sourceCache, 下次 get() 重读库
 *   2. revalidatePath 清 Next 的路由缓存 —— 页面路由是 `revalidate = false`,
 *      不清的话前台会继续发旧 HTML, 表现成「保存没生效」
 *
 * 两者都是进程内的。能代表全局的前提是 replicas=1 (SQLite 只挂一块 RWO 卷,
 * 本来也只能单副本), MUST NOT 当成扩容开关。
 */
export function revalidateContent(): void {
  source.revalidate('docs');
  revalidatePath('/', 'layout');
}
