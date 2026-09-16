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

export function NavEditor({
  entries,
  locales,
}: {
  entries: NavSeed[];
  locales: string[];
}) {
  const dirs = useMemo(
    () => [...new Set(entries.map((entry) => entry.dir))],
    [entries],
  );
  const [dir, setDir] = useState(dirs[0] ?? '');
  const [locale, setLocale] = useState(locales[0]);

  const seed = entries.find(
    (entry) => entry.dir === dir && entry.locale === locale,
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        <p className="px-2 pb-1 text-xs font-medium text-fd-muted-foreground">
          导航文件
        </p>
        {dirs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setDir(item)}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors',
              dir === item
                ? 'bg-fd-primary/10 text-fd-primary'
                : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
            )}
          >
            <ListTree className="size-3.5 shrink-0" />
            {/* 只显示末两段: 整条路径一截断, (other-sdks) 与 (other-sdks)/javascript 就长得一样了 */}
            <span
              className="truncate font-mono text-xs"
              title={item || '(根目录)'}
            >
              {item ? item.split('/').slice(-2).join('/') : '(根目录)'}
            </span>
          </button>
        ))}
      </aside>

      {seed ? (
        <NavForm
          key={`${dir}:${locale}`}
          seed={seed}
          locales={locales}
          onLocale={setLocale}
          locale={locale}
        />
      ) : (
        <p className="text-sm text-fd-muted-foreground">
          该目录下没有这一语言的导航文件。
        </p>
      )}
    </div>
  );
}

function NavForm({
  seed,
  locale,
  locales,
  onLocale,
}: {
  seed: NavSeed;
  locale: string;
  locales: string[];
  onLocale: (locale: string) => void;
}) {
  const [meta, setMeta] = useState<MetaShape>(() => JSON.parse(seed.json));
  const [raw, setRaw] = useState(() =>
    JSON.stringify(JSON.parse(seed.json), null, 2),
  );
  const [mode, setMode] = useState('form');
  const [saving, setSaving] = useState(false);
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
    let json = raw;
    if (mode === 'form') json = JSON.stringify(meta, null, 2);
    else {
      try {
        JSON.parse(raw);
      } catch (error) {
        setSaving(false);
        setRawError((error as Error).message);
        return;
      }
    }
    const result = await saveNavAction({ dir: seed.dir, locale, json });
    setSaving(false);
    if (result.ok) {
      setRawError(undefined);
      if (mode === 'raw') setMeta(JSON.parse(json));
      toast.success('导航已保存', { description: '侧边栏与站点已同步更新' });
    } else {
      toast.error('保存失败', { description: result.error });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-lg bg-fd-muted p-1">
          {locales.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onLocale(item)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                locale === item
                  ? 'bg-fd-card text-fd-foreground shadow-sm'
                  : 'text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <Tabs value={mode} onValueChange={setMode}>
          <TabsList>
            <TabsTrigger value="form">
              <ListTree className="size-3.5" />
              结构
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
          保存
        </Button>
      </div>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsContent value="form" className="space-y-5 outline-none">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="分组标题" hint="显示在侧边栏顶部">
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
            <Field label="分组描述" hint="可选">
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
              <p className="text-sm font-medium">条目顺序</p>
              <p className="text-xs text-fd-muted-foreground">
                侧边栏就按这个顺序显示; 分隔符用来分段
              </p>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPages([...pages, '---新分段---'])}
                >
                  <Plus />
                  分隔符
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPages([...pages, ''])}
                >
                  <Plus />
                  条目
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
                        <Badge tone="info">分段</Badge>
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
                          placeholder="页面或文件夹路径, 如 get-started 或 ../openapi"
                          className={cn(
                            inputClass,
                            'h-8 flex-1 font-mono text-xs',
                          )}
                        />
                      )}
                      <div className="flex shrink-0 gap-0.5">
                        <Tooltip content="上移">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => move(index, -1)}
                            aria-label="上移"
                          >
                            <ArrowUp />
                          </Button>
                        </Tooltip>
                        <Tooltip content="下移">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => move(index, 1)}
                            aria-label="下移"
                          >
                            <ArrowDown />
                          </Button>
                        </Tooltip>
                        <Tooltip content="删除">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="删除"
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
                        placeholder="这一分段的说明文字(显示在侧边栏分隔符下方), 可留空"
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
            结构编辑器覆盖不到的字段可以在这里直接改。保存时会做 schema 校验。
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
