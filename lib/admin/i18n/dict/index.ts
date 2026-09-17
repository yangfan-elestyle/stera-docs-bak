import { ja } from './ja';
import { en } from './en';
import { zh } from './zh';
import type { AdminLocale } from '../shared';

/** ja 是键的唯一真源, en / zh 显式标注这个类型 -> 漏键即编译错误 */
export type AdminDict = typeof ja;
export type AdminDictKey = keyof AdminDict;

export const DICTS: Record<AdminLocale, AdminDict> = { ja, en, zh };

export { ja, en, zh };
