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
import { useRouter } from 'next/navigation';
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
import { uploadImageAction } from '@/lib/admin/actions/uploads';
import { Button } from '../ui/button';
import {
  Badge,
  Dialog,
  DialogClose,
  DialogContent,
  Tooltip,
} from '../ui/primitives';
import { useAdminI18n, useT } from '../i18n';
import { useWorkspaceLocale } from '../workspace/workspace';
import { CodeMirrorEditor, type CodeMirrorHandle } from './codemirror';
import {
  FrontmatterFields,
  type FrontmatterValues,
} from './frontmatter-fields';
import { EditorToolbar } from './toolbar';
import { insertText } from '@/lib/admin/insert-text';

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

/** 空文档的骨架。标题按内容语言给 —— 它会落进那个语言的 mdx 文件 */
function emptyDoc(contentLocale: string): string {
  return `---\ntitle: ${insertText(contentLocale).newPageTitle}\n---\n\n`;
}

export function DocEditor({
  slug,
  locales,
  defaultLocale,
}: {
  slug: string;
  locales: LocaleSeed[];
  defaultLocale: string;
}) {
  const { locale: uiLocale, t } = useAdminI18n();
  // 语言状态与左树共用: 切页签时左树也跟着换语言, 才像在操作同一个侧边栏
  const { locale: active, setLocale: setActive } =
    useWorkspaceLocale(defaultLocale);
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
  const router = useRouter();

  const [states, setStates] = useState<Record<string, LocaleState>>(() =>
    Object.fromEntries(
      locales.map((seed) => {
        const source = seed.content ?? '';
        const parts = splitDoc(source || emptyDoc(seed.locale));
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
        // 左树建在 layout 的 server 组件里, 不 refresh 的话标题改了树上还是旧的
        router.refresh();
        toast.success(t('editor.savedToast', { locale }), {
          description: t('editor.savedToastDesc'),
        });
      } else {
        patch(locale, { saving: false });
        if (result.conflictAt) setConflict({ locale, at: result.conflictAt });
        else toast.error(t('editor.saveFailed'), { description: result.error });
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

  /* ---------- 图片: 工具栏选择 / 粘贴截图 / 拖入文件 ---------- */
  const uploadFiles = useCallback(async (files: File[]) => {
    const id = toast.loading(t('editor.uploading', { count: files.length }));
    const inserted: string[] = [];
    for (const file of files) {
      const form = new FormData();
      form.set('file', file);
      const result = await uploadImageAction(form);
      if (result.ok) {
        const alt = file.name.replace(/\.[^.]+$/, '');
        inserted.push(`![${alt}](${result.url})`);
      } else {
        toast.error(t('editor.uploadFailed', { name: file.name }), {
          description: result.error,
          id,
        });
        return;
      }
    }
    editorRef.current?.insertBlock(inserted.join('\n\n'));
    toast.success(t('editor.uploaded', { count: inserted.length }), { id });
  }, [t]);

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
                    aria-label={t('editor.unsaved')}
                  />
                ) : missing ? (
                  <span
                    className="size-1.5 rounded-full bg-red-500"
                    aria-label={t('editor.localeMissing')}
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
              ? t('editor.savedAt', { time: formatRelative(state.updatedAt, uiLocale) })
              : t('editor.neverSaved')}
          </span>
          {dirtyLocales.length > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                dirtyLocales.forEach((locale) => void save(locale))
              }
            >
              {t('editor.saveAll', { count: dirtyLocales.length })}
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
            {t('editor.saveOne', { locale: active })}
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
            toast.info(t('editor.draftRestored'));
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
                placeholder={t('editor.titlePlaceholder')}
                aria-label={t('editor.titleLabel')}
                className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none placeholder:font-normal placeholder:text-fd-muted-foreground"
              />
              {!fm.title ? <Badge tone="danger">{t('editor.titleMissing')}</Badge> : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMetaOpen((open) => !open)}
                aria-expanded={metaOpen}
              >
                <Settings2 />
                {t('editor.moreSettings')}
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

            <EditorToolbar
              editor={editorRef}
              contentLocale={active}
              onPickImages={(files) => void uploadFiles(files)}
            />

            <div className="min-h-0 flex-1 overflow-hidden">
              <CodeMirrorEditor
                value={state.body}
                contentLocale={active}
                onChange={(body) => patch(active, { body })}
                onSave={() => void save(active)}
                onFiles={(files) => void uploadFiles(files)}
                placeholder={t('editor.bodyPlaceholder')}
                handleRef={editorRef}
                className="h-full overflow-auto"
              />
            </div>

            <div className="flex items-center gap-3 border-t border-fd-border px-4 py-1.5 text-[11px] text-fd-muted-foreground md:px-6">
              <span>{t('editor.words', { count: words })}</span>
              <span>{t('editor.lines', { count: state.body.split('\n').length })}</span>
              {dirty ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="size-1.5 rounded-full bg-current" />
                  {t('editor.dirty')}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Check className="size-3" />
                  {t('editor.clean')}
                </span>
              )}
              <Link
                href={publicUrl(slug)}
                target="_blank"
                className="ml-auto flex items-center gap-1 transition-colors hover:text-fd-foreground"
              >
                {t('editor.openOnSite')}
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
              {t('editor.previewNote')}
              {previewState === 'staging' ? (
                <Loader2 className="ml-auto size-3 animate-spin" />
              ) : null}
            </div>
            {previewError ? (
              <div className="m-4 flex gap-3 rounded-lg border border-red-500/30 bg-red-500/8 p-4 text-sm md:m-6">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-red-700 dark:text-red-400">
                    {t('editor.syntaxError')}
                  </p>
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-fd-muted-foreground">
                    {previewError}
                  </pre>
                </div>
              </div>
            ) : (
              <iframe
                key={`${active}-${previewVersion}`}
                title={t('editor.previewLabel')}
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
          title={t('editor.conflictTitle')}
          description={
            conflict
              ? t('editor.conflictDesc', {
                  locale: conflict.locale,
                  time: formatRelative(conflict.at, uiLocale),
                })
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
                {t('editor.discardMine')}
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
              {t('editor.overwrite')}
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
  const t = useT();
  const options = [
    { value: 'edit', icon: PenLine, label: t('editor.viewEdit') },
    { value: 'split', icon: Columns2, label: t('editor.viewSplit') },
    { value: 'preview', icon: Eye, label: t('editor.viewPreview') },
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
  const { locale, t } = useAdminI18n();
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-amber-500/30 bg-amber-500/8 px-4 py-2 text-sm md:px-6">
      <FileWarning className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>{t('editor.draftBanner', { time: formatRelative(at, locale) })}</span>
      <div className="ml-auto flex gap-2">
        <Button size="sm" variant="secondary" onClick={onRestore}>
          {t('editor.restoreDraft')}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDiscard}>
          {t('editor.discardDraft')}
        </Button>
      </div>
    </div>
  );
}
