// schema.js 运行时导出 anyFields/useResolvedSchema, 但 schema.d.ts 仅导出 SchemaScope。
// 该子路径经 patch 放出 (见 patches/fumadocs-openapi@10.8.1.patch)。
// 这里用 module augmentation 给现有 schema 模块补这两个导出 —— 故本文件必须是模块 (export {}),
// 与 inputs 的 ambient 声明 (fumadocs-openapi-internal.d.ts, 须为脚本) 分文件放置。
export {};

declare module 'fumadocs-openapi/playground/schema' {
  export const anyFields: Record<string, unknown>;
  export function useResolvedSchema(raw: unknown): Record<string, unknown>;
  export function useSchemaScope(): { readOnly: boolean; writeOnly: boolean };
  export function useSchemaUtils(): {
    schemaToString(schema: unknown, level?: number): string;
    generateDefault(schema: unknown): unknown;
  };
}
