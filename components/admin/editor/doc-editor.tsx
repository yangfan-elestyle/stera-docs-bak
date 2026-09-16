'use client';

import {
  AlertTriangle,
  Check,
  Columns2,
  Eye,
  ExternalLink,
  FileWarning,
  Loader2,
  PenLine,
  RotateCcw,
  Save,
  Settings2,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/admin/cn';
import {
  joinDoc,
  setFrontmatterValue,
  splitDoc,
} from '@/lib/admin/frontmatter';
import { countWords, formatRelative, publicUrl } from '@/lib/admin/text';
import {
  discardDraftAction,
  saveDocAction,
  stageDraftAction,
} from '@/lib/admin/actions/content';
import { Button } from '../ui/button';
import {
  Badge,
  Dialog,
  DialogClose,
  DialogContent,
  Tooltip,
} from '../ui/primitives';
import { CodeMirrorEditor, type CodeMirrorHandle } from './codemirror';
import {
  FrontmatterFields,
  type FrontmatterValues,
} from './frontmatter-fields';
import { EditorToolbar } from './toolbar';

export interface LocaleSeed {
  locale: string;
  label: string;
  content: string | null;
  updatedAt: number | null;
  draft: { content: string; updatedAt: number } | null;
}

interface LocaleState {
  matter: string;
  body: string;
  saved: string | null;
  updatedAt: number | null;
  draftAt: number | null;
  saving: boolean;
}

type ViewMode = 'edit' | 'split' | 'preview';

const EMPTY_DOC = '---\ntitle: 新页面\n---\n\n';

export function DocEditor({
  slug,
  locales,
  defaultLocale,
}: {
  slug: string;
  locales: LocaleSeed[];
  defaultLocale: string;
}) {
  const [active, setActive] = useState(defaultLocale);
  const [view, setView] = useState<ViewMode>('split');
  const [previewVersion, setPreviewVersion] = useState(0);
  const [previewState, setPreviewState] = useState<
    'idle' | 'staging' | 'error'
  >('idle');
  const [previewError, setPreviewError] = useState<string>();
  const [conflict, setConflict] = useState<{
    locale: string;
    at: number;
  } | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);
  const editorRef = useRef<CodeMirrorHandle>(null);

  const [states, setStates] = useState<Record<string, LocaleState>>(() =>
    Object.fromEntries(
      locales.map((seed) => {
        const source = seed.content ?? '';
        const parts = splitDoc(source || EMPTY_DOC);
        return [
          seed.locale,
          {
            matter: source ? parts.matter : '',
            body: source ? parts.body : '',
            saved: seed.content,
            updatedAt: seed.updatedAt,
            draftAt:
              seed.draft && seed.draft.content !== seed.content
                ? seed.draft.updatedAt
                : null,
            saving: false,
          } satisfies LocaleState,
        ];
      }),
    ),
  );

  const state = states[active];
  const content = state.matter + state.body;
  const dirty =
    state.saved === null ? content.trim().length > 0 : content !== state.saved;
  const dirtyLocales = useMemo(
    () =>
      locales
        .map((seed) => seed.locale)
        .filter((locale) => {
          const item = states[locale];
          const text = item.matter + item.body;
          return item.saved === null
            ? text.trim().length > 0
            : text !== item.saved;
        }),
    [locales, states],
  );

  useEffect(() => {
    const stored = localStorage.getItem('admin:editor-view');
    if (stored === 'edit' || stored === 'split' || stored === 'preview')
      setView(stored);
  }, []);
  const changeView = (next: ViewMode) => {
    setView(next);
    localStorage.setItem('admin:editor-view', next);
  };

  // 离开前拦一道: 编辑器不做自动保存, 未保存内容只存在草稿里
  useEffect(() => {
    if (dirtyLocales.length === 0) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirtyLocales.length]);

  const patch = useCallback((locale: string, next: Partial<LocaleState>) => {
    setStates((prev) => ({ ...prev, [locale]: { ...prev[locale], ...next } }));
  }, []);

  /* ---------- 预览: 防抖把草稿落库, 再让 iframe 重载 ---------- */
  const stageTimer = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => {
    if (view === 'edit') return;
    if (stageTimer.current) clearTimeout(stageTimer.current);
    setPreviewState('staging');
    stageTimer.current = setTimeout(async () => {
      const result = await stageDraftAction({ slug, locale: active, content });
      if (result.ok) {
        setPreviewError(undefined);
        setPreviewState('idle');
        setPreviewVersion((v) => v + 1);
      } else {
        setPreviewError(result.error);
        setPreviewState('error');
      }
    }, 600);
    return () => {
      if (stageTimer.current) clearTimeout(stageTimer.current);
    };
  }, [slug, active, content, view]);

  /* ---------- 保存 ---------- */
  const save = useCallback(
    async (locale: string, force = false) => {
      const item = states[locale];
      const text = item.matter + item.body;
      if (item.saving) return;
      patch(locale, { saving: true });

      const result = await saveDocAction({
        slug,
        locale,
        content: text,
        expectedUpdatedAt: force ? undefined : item.updatedAt ?? undefined,
      });

      if (result.ok) {
        patch(locale, {
          saving: false,
          saved: text,
          updatedAt: result.updatedAt,
          draftAt: null,
        });
        toast.success(`${locale} 已保存`, {
          description: '前台页面与搜索已同步更新',
        });
      } else {
        patch(locale, { saving: false });
        if (result.conflictAt) setConflict({ locale, at: result.conflictAt });
        else toast.error('保存失败', { description: result.error });
      }
    },
    [patch, slug, states],
  );

  const saveRef = useRef(save);
  saveRef.current = save;
  const activeRef = useRef(active);
  activeRef.current = active;
  const dirtyRef = useRef(dirtyLocales);
  dirtyRef.current = dirtyLocales;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's')
        return;
      event.preventDefault();
      if (event.shiftKey)
        dirtyRef.current.forEach((locale) => void saveRef.current(locale));
      else void saveRef.current(activeRef.current);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---------- frontmatter 字段 ---------- */
  const fm = useMemo<FrontmatterValues>(() => {
    const { data } = splitDoc(content);
    return {
      title: typeof data.title === 'string' ? data.title : '',
      description: typeof data.description === 'string' ? data.description : '',
      tocMaxDepth:
        typeof data.tocMaxDepth === 'number' ? String(data.tocMaxDepth) : '',
      redirect: typeof data.redirect === 'string' ? data.redirect : '',
      full: data.full === true,
    };
  }, [content]);

  const changeField = (
    key: keyof FrontmatterValues,
    value: string | boolean,
  ) => {
    const next =
      key === 'tocMaxDepth'
        ? value === ''
          ? undefined
          : Number(value)
        : typeof value === 'boolean'
        ? value || undefined
        : value === ''
        ? undefined
        : value;
    patch(active, {
      matter: setFrontmatterValue(state.matter || '---\n---\n\n', key, next),
    });
  };

  const words = countWords(state.body);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 语言切换 + 保存 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-fd-border px-4 py-2 md:px-6">
        <div className="inline-flex items-center gap-1 rounded-lg bg-fd-muted p-1">
          {locales.map((seed) => {
            const item = states[seed.locale];
            const text = item.matter + item.body;
            const isDirty =
              item.saved === null
                ? text.trim().length > 0
                : text !== item.saved;
            const missing = item.saved === null;
            return (
              <button
                key={seed.locale}
                type="button"
                onClick={() => setActive(seed.locale)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  active === seed.locale
                    ? 'bg-fd-card text-fd-foreground shadow-sm'
                    : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {seed.label}
                {isDirty ? (
                  <span
                    className="size-1.5 rounded-full bg-amber-500"
                    aria-label="有未保存修改"
                  />
                ) : missing ? (
                  <span
                    className="size-1.5 rounded-full bg-red-500"
                    aria-label="缺此语言"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <ViewSwitch view={view} onChange={changeView} />

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-fd-muted-foreground sm:inline">
            {state.updatedAt
              ? `保存于 ${formatRelative(state.updatedAt)}`
              : '尚未保存过'}
          </span>
          {dirtyLocales.length > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                dirtyLocales.forEach((locale) => void save(locale))
              }
            >
              保存全部 ({dirtyLocales.length})
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="primary"
            loading={state.saving}
            disabled={!dirty}
            onClick={() => void save(active)}
          >
            {!state.saving ? <Save /> : null}
            保存 {active}
            <kbd className="ml-1 hidden rounded border border-white/25 px-1 font-mono text-[10px] md:inline">
              ⌘S
            </kbd>
          </Button>
        </div>
      </div>

      {state.draftAt ? (
        <DraftBanner
          at={state.draftAt}
          onRestore={() => {
            const seed = locales.find((item) => item.locale === active)!;
            if (!seed.draft) return;
            const parts = splitDoc(seed.draft.content);
            patch(active, {
              matter: parts.matter,
              body: parts.body,
              draftAt: null,
            });
            toast.info('已恢复草稿');
          }}
          onDiscard={() => {
            void discardDraftAction({ slug, locale: active });
            patch(active, { draftAt: null });
          }}
        />
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        {view !== 'preview' ? (
          <div
            className={cn(
              'flex min-h-0 flex-col border-fd-border',
              view === 'split' ? 'lg:border-r' : 'lg:col-span-2',
            )}
          >
            {/* 标题常驻可见: 它是每次编辑都要看的字段, 塞进折叠面板会把编辑区挤到屏幕外 */}
            <div className="flex items-start gap-2 border-b border-fd-border px-4 py-2.5 md:px-6">
              <input
                value={fm.title}
                onChange={(event) => changeField('title', event.target.value)}
                placeholder="页面标题（必填）"
                aria-label="页面标题"
                className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none placeholder:font-normal placeholder:text-fd-muted-foreground"
              />
              {!fm.title ? <Badge tone="danger">缺标题</Badge> : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMetaOpen((open) => !open)}
                aria-expanded={metaOpen}
              >
                <Settings2 />
                更多设置
                <ChevronDown
                  className={cn(
                    'transition-transform',
                    metaOpen && 'rotate-180',
                  )}
                />
              </Button>
            </div>

            {metaOpen ? (
              <div className="border-b border-fd-border bg-fd-card/40 px-4 py-4 md:px-6">
                <FrontmatterFields values={fm} onChange={changeField} />
              </div>
            ) : null}

            <EditorToolbar editor={editorRef} />

            <div className="min-h-0 flex-1 overflow-hidden">
              <CodeMirrorEditor
                value={state.body}
                onChange={(body) => patch(active, { body })}
                onSave={() => void save(active)}
                placeholder="用 Markdown 写正文, 输入 < 可插入站内组件…"
                handleRef={editorRef}
                className="h-full overflow-auto"
              />
            </div>

            <div className="flex items-center gap-3 border-t border-fd-border px-4 py-1.5 text-[11px] text-fd-muted-foreground md:px-6">
              <span>{words} 字</span>
              <span>{state.body.split('\n').length} 行</span>
              {dirty ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="size-1.5 rounded-full bg-current" />
                  未保存
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Check className="size-3" />
                  已保存
                </span>
              )}
              <Link
                href={publicUrl(slug)}
                target="_blank"
                className="ml-auto flex items-center gap-1 transition-colors hover:text-fd-foreground"
              >
                在站点打开
                <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>
        ) : null}

        {view !== 'edit' ? (
          <div
            className={cn(
              'relative flex min-h-0 flex-col bg-fd-card/30',
              view === 'preview' && 'lg:col-span-2',
            )}
          >
            <div className="flex items-center gap-2 border-b border-fd-border px-4 py-1.5 text-[11px] text-fd-muted-foreground md:px-6">
              <Eye className="size-3" />
              实时预览 · 与站点同一套渲染
              {previewState === 'staging' ? (
                <Loader2 className="ml-auto size-3 animate-spin" />
              ) : null}
            </div>
            {previewError ? (
              <div className="m-4 flex gap-3 rounded-lg border border-red-500/30 bg-red-500/8 p-4 text-sm md:m-6">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-red-700 dark:text-red-400">
                    内容有语法错误
                  </p>
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-fd-muted-foreground">
                    {previewError}
                  </pre>
                </div>
              </div>
            ) : (
              <iframe
                key={`${active}-${previewVersion}`}
                title="预览"
                src={`/admin/preview/${slug}?locale=${active}&v=${previewVersion}`}
                className="min-h-0 flex-1 border-0 bg-fd-background"
              />
            )}
          </div>
        ) : null}
      </div>

      <Dialog
        open={conflict !== null}
        onOpenChange={(open) => !open && setConflict(null)}
      >
        <DialogContent
          title="内容已被其他人改动"
          description={
            conflict
              ? `${conflict.locale} 这份内容在 ${formatRelative(
                  conflict.at,
                )}被改过。继续保存会覆盖对方的修改。`
              : undefined
          }
        >
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => location.reload()}
              >
                <RotateCcw />
                放弃我的修改, 重新载入
              </Button>
            </DialogClose>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (conflict) void save(conflict.locale, true);
                setConflict(null);
              }}
            >
              仍然覆盖保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ViewSwitch({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}) {
  const options = [
    { value: 'edit', icon: PenLine, label: '只看编辑器' },
    { value: 'split', icon: Columns2, label: '分栏' },
    { value: 'preview', icon: Eye, label: '只看预览' },
  ] as const;

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-fd-muted p-1">
      {options.map((option) => (
        <Tooltip key={option.value} content={option.label}>
          <button
            type="button"
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'grid size-7 place-items-center rounded-md transition-colors',
              view === option.value
                ? 'bg-fd-card text-fd-foreground shadow-sm'
                : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            <option.icon className="size-3.5" />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

function DraftBanner({
  at,
  onRestore,
  onDiscard,
}: {
  at: number;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-amber-500/30 bg-amber-500/8 px-4 py-2 text-sm md:px-6">
      <FileWarning className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>
        有一份 {formatRelative(at)}的未保存草稿, 可能来自上次意外关闭页面。
      </span>
      <div className="ml-auto flex gap-2">
        <Button size="sm" variant="secondary" onClick={onRestore}>
          恢复草稿
        </Button>
        <Button size="sm" variant="ghost" onClick={onDiscard}>
          丢弃
        </Button>
      </div>
    </div>
  );
}
