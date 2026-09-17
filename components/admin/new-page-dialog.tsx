'use client';

import { FilePlus2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createPageAction } from '@/lib/admin/actions/content';
import { cn } from '@/lib/admin/cn';
import { useT } from './i18n';
import { Button } from './ui/button';
import { Field, Input, useFieldId } from './ui/field';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/primitives';

export function NewPageDialog({
  dirs,
  locales,
  defaultLocale,
  compact,
}: {
  dirs: string[];
  locales: string[];
  defaultLocale: string;
  /** 放在左树头部时只留图标, 省出横向空间 */
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState(
    dirs.find((item) => item.startsWith('(home)')) ?? dirs[0] ?? '',
  );
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [picked, setPicked] = useState<string[]>([...locales]);
  const [pending, startTransition] = useTransition();
  const t = useT();

  const slug = [dir, name].filter(Boolean).join('/');

  const submit = () => {
    startTransition(async () => {
      const result = await createPageAction({ slug, title, locales: picked });
      if (result.ok) {
        toast.success(t('newPage.created'), {
          description: t('newPage.createdDesc'),
        });
        setOpen(false);
        router.push(`/admin/content/${result.slug}`);
        router.refresh();
      } else {
        toast.error(t('newPage.createFailed'), { description: result.error });
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName('');
          setTitle('');
          setPicked([...locales]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={compact ? 'ghost' : 'primary'}
          size={compact ? 'icon-sm' : 'sm'}
          aria-label={t('newPage.button')}
          title={t('newPage.button')}
        >
          <FilePlus2 />
          {compact ? null : t('newPage.button')}
        </Button>
      </DialogTrigger>
      <DialogContent
        title={t('newPage.button')}
        description={t('newPage.dialogDesc')}
      >
        <div className="space-y-3">
          <Field label={t('newPage.group')} hint={t('newPage.groupHint')}>
            <DirSelect value={dir} onChange={setDir} dirs={dirs} />
          </Field>

          <Field
            label={t('newPage.path')}
            required
            hint={slug ? t('newPage.pathFull', { slug }) : t('newPage.pathHint')}
          >
            <Input
              value={name}
              onChange={(event) =>
                setName(event.target.value.replace(/\s+/g, '-').toLowerCase())
              }
              placeholder="new-guide"
              className="font-mono"
            />
          </Field>

          <Field label={t('newPage.title')} required hint={t('newPage.titleHint')}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('newPage.titlePlaceholder')}
            />
          </Field>

          <Field label={t('newPage.locales')} hint={t('newPage.localesHint')}>
            <div className="flex gap-2">
              {locales.map((locale) => {
                const on = picked.includes(locale);
                return (
                  <button
                    key={locale}
                    type="button"
                    onClick={() =>
                      setPicked((prev) =>
                        on
                          ? prev.filter((item) => item !== locale)
                          : [...prev, locale],
                      )
                    }
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                      on
                        ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
                        : 'border-fd-border text-fd-muted-foreground hover:bg-fd-accent',
                    )}
                  >
                    {locale}
                    {locale === defaultLocale ? t('newPage.defaultSuffix') : ''}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={pending}
              disabled={!name || !title || picked.length === 0}
              onClick={submit}
            >
              {t('newPage.submit')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DirSelect({
  value,
  onChange,
  dirs,
}: {
  value: string;
  onChange: (value: string) => void;
  dirs: string[];
}) {
  const t = useT();
  const id = useFieldId();
  return (
    <Select
      value={value || '(root)'}
      onValueChange={(next) => onChange(next === '(root)' ? '' : next)}
    >
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72 overflow-y-auto">
        {dirs.map((dir) => (
          <SelectItem key={dir || '(root)'} value={dir || '(root)'}>
            <span className="font-mono text-xs">{dir || t('common.rootDir')}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
