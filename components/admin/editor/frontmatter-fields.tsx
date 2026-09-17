'use client';

import { useT } from '../i18n';
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
  const t = useT();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field
        label={t('fm.description')}
        hint={t('fm.descriptionHint')}
        className="md:col-span-2"
      >
        <Textarea
          rows={2}
          value={values.description}
          disabled={disabled}
          onChange={(event) => onChange('description', event.target.value)}
        />
      </Field>

      <Field label={t('fm.tocDepth')} hint={t('fm.tocDepthHint')}>
        <TocDepthSelect
          value={values.tocMaxDepth}
          disabled={disabled}
          onChange={(value) => onChange('tocMaxDepth', value)}
        />
      </Field>

      <Field label={t('fm.redirect')} hint={t('fm.redirectHint')}>
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
  const t = useT();
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
        <SelectItem value="auto">{t('fm.tocAuto')}</SelectItem>
        <SelectItem value="1">{t('fm.tocH1')}</SelectItem>
        <SelectItem value="2">{t('fm.tocH2')}</SelectItem>
        <SelectItem value="3">{t('fm.tocH3')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
