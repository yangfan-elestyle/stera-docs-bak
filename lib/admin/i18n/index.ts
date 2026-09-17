// 客户端安全的公共入口。两条 MUST NOT:
//   1. 服务端解析 (`./locale`, `./server`) 拉 `next/headers`, 不从这里导出 ——
//      一导出就会被客户端组件顺着 barrel 拖进浏览器包, turbopack 直接 500。
//   2. `DICTS` 也不从这里导出 —— 它是三份字典的值, 任何客户端的值导入都会把三份
//      全打进 bundle。客户端只拿 `import type`, 实际字典由 provider 以 prop 传入。
export type { AdminDict, AdminDictKey } from './dict';
export {
  ADMIN_DEFAULT_LOCALE,
  ADMIN_LOCALES,
  ADMIN_LOCALE_COOKIE,
  ADMIN_LOCALE_NAMES,
  isAdminLocale,
  type AdminLocale,
} from './shared';
export { translate, type T, type Vars } from './translate';
