'use client';

import {
  ArrowDown,
  ArrowUp,
  Braces,
  FileText,
  ListTree,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/admin/cn';
import { saveNavAction } from '@/lib/admin/actions/navigation';
import { Button } from '../ui/button';
import { Field, Input, Textarea, inputClass } from '../ui/field';
import {
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
} from '../ui/primitives';
import { insertText } from '@/lib/admin/insert-text';
import { useT } from '../i18n';

export interface NavSeed {
  dir: string;
  locale: string;
  json: string;
}

interface MetaShape {
  title?: string;
  root?: boolean;
  defaultOpen?: boolean;
  collapsible?: boolean;
  description?: string;
  icon?: string;
  pages?: string[];
  sectionNotes?: Record<string, string>;
}

const SEPARATOR = /^---(.*)---$/;

export function NavPanel({
  dir,
  locale,
  json,
}: {
  dir: string;
  locale: string;
  json: string;
}) {
  const [meta, setMeta] = useState<MetaShape>(() => JSON.parse(json));
  const [raw, setRaw] = useState(() =>
    JSON.stringify(JSON.parse(json), null, 2),
  );
  const [mode, setMode] = useState('form');
  const t = useT();
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [rawError, setRawError] = useState<string>();

  // 表单改了就同步进 raw, 切到 JSON 页签看到的永远是当前状态
  useEffect(() => {
    if (mode === 'form') setRaw(JSON.stringify(meta, null, 2));
  }, [meta, mode]);

  const pages = meta.pages ?? [];
  const setPages = (next: string[]) =>
    setMeta((prev) => ({ ...prev, pages: next }));

  const move = (index: number, delta: number) => {
    const next = [...pages];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setPages(next);
  };

  const renameSeparator = (index: number, label: string) => {
    const next = [...pages];
    const old = pages[index].replace(SEPARATOR, '$1');
    next[index] = `---${label}---`;
    setPages(next);
    // sectionNotes 以分隔符文字为键, 改名不搬 key 的话描述会静默失联
    setMeta((prev) => {
      const notes = { ...(prev.sectionNotes ?? {}) };
      if (old in notes) {
        notes[label] = notes[old];
        delete notes[old];
      }
      return { ...prev, pages: next, sectionNotes: notes };
    });
  };

  const setNote = (label: string, value: string) => {
    setMeta((prev) => {
      const notes = { ...(prev.sectionNotes ?? {}) };
      if (value) notes[label] = value;
      else delete notes[label];
      return {
        ...prev,
        sectionNotes: Object.keys(notes).length ? notes : undefined,
      };
    });
  };

  const save = async () => {
    setSaving(true);
    let payload = raw;
    if (mode === 'form') payload = JSON.stringify(meta, null, 2);
    else {
      try {
        JSON.parse(raw);
      } catch (error) {
        setSaving(false);
        setRawError((error as Error).message);
        return;
      }
    }
    const result = await saveNavAction({ dir, locale, json: payload });
    setSaving(false);
    if (result.ok) {
      setRawError(undefined);
      if (mode === 'raw') setMeta(JSON.parse(payload));
      router.refresh();
      toast.success(t('navEditor.saved'), { description: t('navEditor.savedDesc') });
    } else {
      toast.error(t('navEditor.saveFailed'), { description: result.error });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList>
            <TabsTrigger value="form">
              <ListTree className="size-3.5" />
              {t('navEditor.structure')}
            </TabsTrigger>
            <TabsTrigger value="raw">
              <Braces className="size-3.5" />
              JSON
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          className="ml-auto"
          size="sm"
          variant="primary"
          loading={saving}
          onClick={() => void save()}
        >
          {!saving ? <Save /> : null}
          {t('common.save')}
        </Button>
      </div>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsContent value="form" className="space-y-5 outline-none">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('navEditor.groupTitle')} hint={t('navEditor.groupTitleHint')}>
              <Input
                value={meta.title ?? ''}
                onChange={(event) =>
                  setMeta((prev) => ({
                    ...prev,
                    title: event.target.value || undefined,
                  }))
                }
              />
            </Field>
            <Field label={t('navEditor.groupDesc')} hint={t('navEditor.optional')}>
              <Input
                value={meta.description ?? ''}
                onChange={(event) =>
                  setMeta((prev) => ({
                    ...prev,
                    description: event.target.value || undefined,
                  }))
                }
              />
            </Field>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{t('navEditor.order')}</p>
              <p className="text-xs text-fd-muted-foreground">
                {t('navEditor.orderHint')}
              </p>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  // 这串会写进 meta.json, 按正在编辑的那个语言取, 不按界面语言
                  onClick={() =>
                    setPages([...pages, insertText(locale).newSeparator])
                  }
                >
                  <Plus />
                  {t('navEditor.addSeparator')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPages([...pages, ''])}
                >
                  <Plus />
                  {t('navEditor.addItem')}
                </Button>
              </div>
            </div>

            <ul className="divide-y divide-fd-border overflow-hidden rounded-xl border border-fd-border">
              {pages.map((item, index) => {
                const separator = SEPARATOR.exec(item);
                const label = separator?.[1] ?? '';
                return (
                  <li
                    key={`${index}-${item}`}
                    className={cn(
                      'px-3 py-2',
                      separator ? 'bg-fd-card/50' : '',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {separator ? (
                        <Badge tone="info">{t('navEditor.separatorBadge')}</Badge>
                      ) : (
                        <FileText className="size-3.5 shrink-0 text-fd-muted-foreground" />
                      )}
                      {separator ? (
                        <input
                          value={label}
                          onChange={(event) =>
                            renameSeparator(index, event.target.value)
                          }
                          className={cn(inputClass, 'h-8 flex-1 font-medium')}
                        />
                      ) : (
                        <input
                          value={item}
                          onChange={(event) => {
                            const next = [...pages];
                            next[index] = event.target.value;
                            setPages(next);
                          }}
                          placeholder={t('navEditor.pathPlaceholder')}
                          className={cn(
                            inputClass,
                            'h-8 flex-1 font-mono text-xs',
                          )}
                        />
                      )}
                      <div className="flex shrink-0 gap-0.5">
                        <Tooltip content={t('common.moveUp')}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => move(index, -1)}
                            aria-label={t('common.moveUp')}
                          >
                            <ArrowUp />
                          </Button>
                        </Tooltip>
                        <Tooltip content={t('common.moveDown')}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => move(index, 1)}
                            aria-label={t('common.moveDown')}
                          >
                            <ArrowDown />
                          </Button>
                        </Tooltip>
                        <Tooltip content={t('common.delete')}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t('common.delete')}
                            onClick={() =>
                              setPages(pages.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>

                    {separator ? (
                      <Textarea
                        rows={2}
                        value={meta.sectionNotes?.[label] ?? ''}
                        onChange={(event) => setNote(label, event.target.value)}
                        placeholder={t('navEditor.notePlaceholder')}
                        className="mt-2 text-xs"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="raw" className="space-y-2 outline-none">
          <p className="text-xs text-fd-muted-foreground">
            {t('navEditor.jsonHint')}
          </p>
          <textarea
            value={raw}
            onChange={(event) => {
              setRaw(event.target.value);
              setRawError(undefined);
            }}
            rows={24}
            spellCheck={false}
            className={cn(
              inputClass,
              'h-auto py-2 font-mono text-xs leading-relaxed',
            )}
          />
          {rawError ? <p className="text-xs text-red-600">{rawError}</p> : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
