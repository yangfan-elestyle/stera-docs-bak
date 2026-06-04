// fumadocs-openapi@10.8.1 的 playground 输入控件 inputs.js 未随包发 .d.ts
// (该子路径经 patch 放出, 见 patches/fumadocs-openapi@10.8.1.patch 的 package.json exports)。
// 本文件无 top-level import/export, 保持为全局脚本, 使下面的 ambient module 声明对「无真实 .d.ts」的
// inputs 模块生效 (schema 模块另见 fumadocs-openapi-schema-augment.d.ts 走 augmentation)。
declare module 'fumadocs-openapi/playground/components/inputs' {
  import type { ComponentType, ReactNode } from 'react';
  import type { FieldKey } from '@fumari/stf';

  interface FieldSetProps {
    field: unknown;
    fieldName: FieldKey;
    name?: ReactNode;
    isRequired?: boolean;
    collapsible?: boolean;
    depth?: number;
    toolbar?: ReactNode;
    slotType?: unknown;
  }
  export const FieldSet: ComponentType<FieldSetProps>;
  export const FieldInput: ComponentType<{ field: unknown; fieldName: FieldKey; isRequired?: boolean }>;
  export const ObjectInput: ComponentType<{ field: unknown; fieldName: FieldKey }>;
  export const JsonInput: ComponentType<{ fieldName: FieldKey }>;
}
