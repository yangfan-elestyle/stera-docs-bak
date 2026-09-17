import { CmsError } from '@/lib/cms/errors';
import type { T } from './i18n';

/**
 * lib/cms 抛的是错误码, 在这一层翻; 其余异常原样透出 (多半是 bug, 不该被本地化掩盖)。
 *
 * 放这里而不是 `actions/content.ts`: 那是 `'use server'` 文件, 只允许导出 async 函数,
 * 导出一个同步 helper 会让整个模块编译失败 (tsc 看不出来, 只有 Next 编译期报)。
 */
export function cmsMessage(error: unknown, t: T): string {
  if (error instanceof CmsError) return t(`cms.${error.code}`, error.vars);
  return (error as Error).message;
}
