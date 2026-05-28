'use client';
// 把正文 parameters / body 文档区的字段说明「内联」进 playground 输入框旁,
// 从而隐藏正文重复区块。复用 fumadocs 导出的输入控件 (绑定 playground 表单状态),
// 外加 FieldDoc 补 description / format / 约束 / example。
import { FieldSet, FieldInput } from 'fumadocs-openapi/playground/components/inputs';
import { anyFields, useResolvedSchema, useSchemaScope, useSchemaUtils } from 'fumadocs-openapi/playground/schema';
import type { FieldKey } from '@fumari/stf';
import { useEffect, useState, type ReactNode } from 'react';

export interface ParamLike {
  name: string;
  required?: boolean;
  description?: ReactNode;
  schema?: unknown;
}

type AnySchema = Record<string, unknown> | undefined;

// 输入控件依赖 playground 运行时表单状态 (useFieldValue): 其值在 SSR 与 hydration 首帧不一致
// (面板默认展开后进入 SSR), 导致「清除值」按钮 server 不渲染 / client 渲染 -> hydration mismatch。
// 故输入控件仅在客户端挂载后渲染, 静态的 FieldDoc 说明保持 SSR。
function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
}

function formatRange(min: unknown, max: unknown): string | null {
  if (min != null && max != null) return `${min}–${max}`;
  if (min != null) return `≥ ${min}`;
  if (max != null) return `≤ ${max}`;
  return null;
}

function stringify(v: unknown): string {
  return typeof v === 'string' ? v : JSON.stringify(v);
}

// 输入框旁的字段说明: 输入控件只渲染名称/类型/控件, 这里补 description 与约束等元信息。
function FieldDoc({ rawSchema, description }: { rawSchema?: unknown; description?: ReactNode }) {
  const schema = useResolvedSchema(rawSchema ?? false) as AnySchema;
  const desc = description ?? (schema?.description as ReactNode | undefined);

  const meta: string[] = [];
  if (schema) {
    if (schema.format) meta.push(`format: ${String(schema.format)}`);
    if (schema.pattern) meta.push(`pattern: ${String(schema.pattern)}`);
    const numRange = formatRange(schema.minimum ?? schema.exclusiveMinimum, schema.maximum ?? schema.exclusiveMaximum);
    if (numRange) meta.push(`value ${numRange}`);
    const lenRange = formatRange(schema.minLength, schema.maxLength);
    if (lenRange) meta.push(`length ${lenRange}`);
    const itemRange = formatRange(schema.minItems, schema.maxItems);
    if (itemRange) meta.push(`items ${itemRange}`);
    if (schema.default !== undefined) meta.push(`default: ${stringify(schema.default)}`);
    const ex = schema.example ?? (Array.isArray(schema.examples) ? schema.examples[0] : undefined);
    if (ex !== undefined) meta.push(`example: ${stringify(ex)}`);
  }

  if (!desc && meta.length === 0) return null;
  return (
    <div className="mt-1.5 space-y-1 text-xs text-fd-muted-foreground">
      {desc ? <div className="whitespace-pre-wrap">{desc}</div> : null}
      {meta.length > 0 ? <div className="font-mono opacity-80">{meta.join(' · ')}</div> : null}
    </div>
  );
}

// 「可单行展示」的标量: 对象 / 数组 / 联合 (oneOf/anyOf/allOf) / 多 type 需展开, 不算标量。
function isScalarSchema(s: AnySchema): boolean {
  if (!s) return true;
  if (s.oneOf || s.anyOf || s.allOf) return false;
  if (Array.isArray(s.type)) return false;
  return s.type !== 'object' && s.type !== 'array';
}

// 标量字段横排: name + type 左对齐, 输入控件靠右单行; 非标量委托原生 FieldSet 竖排展开。
// 复用 fumadocs 导出的 FieldInput (只依赖 playground 级 context, 可独立渲染), 故无需 patch FieldSet 布局。
function InlineField({
  name,
  fieldName,
  field,
  isRequired,
}: {
  name?: ReactNode;
  fieldName: FieldKey;
  field: unknown;
  isRequired?: boolean;
}) {
  const schema = useResolvedSchema(field ?? anyFields) as AnySchema;
  const { readOnly, writeOnly } = useSchemaScope();
  const { schemaToString } = useSchemaUtils();

  if (!isScalarSchema(schema)) {
    return <FieldSet name={name} fieldName={fieldName} field={field ?? anyFields} isRequired={isRequired} collapsible={false} />;
  }
  // 照搬 FieldSet 的 scope 过滤: 不渲染当前 read/write scope 之外的字段。
  if (schema && ((schema.readOnly && !readOnly) || (schema.writeOnly && !writeOnly))) return null;

  return (
    <fieldset className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1.5">
      <label className="inline-flex shrink-0 items-center gap-1.5 font-mono">
        <span className="text-sm font-medium text-fd-foreground">
          {name}
          {isRequired ? <span className="ms-0.5 text-red-400/80">*</span> : null}
        </span>
        {schema ? <code className="text-xs text-fd-muted-foreground">{schemaToString(schema)}</code> : null}
      </label>
      <div className="ms-auto w-1/2 min-w-[10rem]">
        <FieldInput field={schema ?? anyFields} fieldName={fieldName} isRequired={isRequired} />
      </div>
    </fieldset>
  );
}

// 单个参数 (path/query/header/cookie): 输入控件 + 说明。
export function ParameterField({ fieldName, param }: { fieldName: FieldKey; param: ParamLike }) {
  return (
    <div className="border-t py-3 first:border-t-0 first:pt-0">
      <ClientOnly>
        <InlineField name={param.name} fieldName={fieldName} field={param.schema ?? anyFields} isRequired={param.required} />
      </ClientOnly>
      <FieldDoc rawSchema={param.schema} description={param.description} />
    </div>
  );
}

// request body: 拆顶层 properties, 每个字段「输入控件 + 说明」; 嵌套层由 FieldSet 自行展开。
// renderBodyField 回调给的标识是字面量 'body', 真实表单 FieldKey 为 ['body'], 故内部固定该前缀。
export function BodyFields({ rawSchema }: { rawSchema: unknown }) {
  const schema = useResolvedSchema(rawSchema ?? false) as AnySchema;
  const properties = schema?.type === 'object' ? (schema.properties as Record<string, unknown> | undefined) : undefined;
  const base: Array<string | number> = ['body'];

  if (!properties) {
    return (
      <div>
        <ClientOnly>
          <InlineField fieldName={base as unknown as FieldKey} field={rawSchema ?? anyFields} isRequired />
        </ClientOnly>
        <FieldDoc rawSchema={rawSchema} />
      </div>
    );
  }

  const required = (schema?.required as string[] | undefined) ?? [];
  return (
    <div className="flex flex-col">
      {Object.entries(properties).map(([key, propSchema]) => (
        <div key={key} className="border-t py-3 first:border-t-0 first:pt-0">
          <ClientOnly>
            <InlineField name={key} fieldName={[...base, key] as unknown as FieldKey} field={propSchema} isRequired={required.includes(key)} />
          </ClientOnly>
          <FieldDoc rawSchema={propSchema} />
        </div>
      ))}
    </div>
  );
}
