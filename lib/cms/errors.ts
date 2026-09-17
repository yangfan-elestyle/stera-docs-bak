/**
 * `lib/cms/` 抛错误码, 由 `lib/admin/actions/` 翻成当前界面语言。
 *
 * MUST NOT 在 `lib/cms/*` 里直接调 `getAdminT()`: 这些模块被 `bun run import:seed`
 * 与空库首启复用, 把 `next/headers` 拉进去会直接炸 (和 locale.ts 早先踩的同一个坑)。
 */
export type CmsErrorCode =
  | 'unknownLocale'
  | 'slugExists'
  | 'slugInvalid'
  | 'uploadType'
  | 'uploadTooLarge';

export class CmsError extends Error {
  constructor(
    readonly code: CmsErrorCode,
    readonly vars?: Record<string, string | number>,
  ) {
    // message 落错误码本身: 没被 action 翻到时日志里仍然认得出是哪一条
    super(code);
    this.name = 'CmsError';
  }
}

/** 导航 JSON 的两类失败: 语法坏 vs schema 不过 */
export type NavIssue = { kind: 'json' | 'schema'; detail: string };
