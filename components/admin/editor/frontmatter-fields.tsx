'use client';

import { Field, Input, Textarea, useFieldId } from '../ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/primitives';

export interface FrontmatterValues {
  title: string;
  description: string;
  tocMaxDepth: string;
  redirect: string;
  full: boolean;
}

export function FrontmatterFields({
  values,
  onChange,
  disabled,
}: {
  values: FrontmatterValues;
  onChange: (key: keyof FrontmatterValues, value: string | boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field
        label="摘要"
        hint="留空时自动取正文首段, 用于搜索结果与分享卡片"
        className="md:col-span-2"
      >
        <Textarea
          rows={2}
          value={values.description}
          disabled={disabled}
          onChange={(event) => onChange('description', event.target.value)}
        />
      </Field>

      <Field label="目录层级" hint="右侧目录最深显示到第几级标题, 默认全部">
        <TocDepthSelect
          value={values.tocMaxDepth}
          disabled={disabled}
          onChange={(value) => onChange('tocMaxDepth', value)}
        />
      </Field>

      <Field label="跳转到" hint="填写后本页会 302 到该站内路径, 一般留空">
        <Input
          value={values.redirect}
          disabled={disabled}
          onChange={(event) => onChange('redirect', event.target.value)}
          placeholder="/get-started/set-up"
        />
      </Field>
    </div>
  );
}

// Select 的 trigger 要拿 Field 的 id, 而 useFieldId 必须在 Field 的 provider 之下调用
function TocDepthSelect({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const id = useFieldId();
  return (
    <Select
      value={value || 'auto'}
      disabled={disabled}
      onValueChange={(next) => onChange(next === 'auto' ? '' : next)}
    >
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">默认(全部)</SelectItem>
        <SelectItem value="1">只到 # 一级</SelectItem>
        <SelectItem value="2">到 ## 二级</SelectItem>
        <SelectItem value="3">到 ### 三级</SelectItem>
      </SelectContent>
    </Select>
  );
}
