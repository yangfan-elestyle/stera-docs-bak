'use client';

import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  type CompletionContext,
} from '@codemirror/autocomplete';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import {
  HighlightStyle,
  bracketMatching,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import {
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder as cmPlaceholder,
  rectangularSelection,
} from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';

export interface CodeMirrorHandle {
  /** 在光标处替换选区, 返回替换后的全文 */
  surround: (before: string, after?: string, placeholder?: string) => void;
  insertBlock: (text: string) => void;
  focus: () => void;
}

// 主题只引用 fumadocs 的 CSS 变量, 不写死颜色 -> 深浅色切换不需要重建 EditorState。
const theme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'var(--color-fd-foreground)',
    fontSize: '13.5px',
    height: '100%',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': {
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    lineHeight: '1.7',
    padding: '12px 0 40vh',
  },
  '.cm-content': { caretColor: 'var(--color-fd-primary)' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color:
      'color-mix(in oklab, var(--color-fd-muted-foreground) 55%, transparent)',
    border: 'none',
    paddingRight: '4px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--color-fd-foreground)',
  },
  '.cm-activeLine': {
    backgroundColor:
      'color-mix(in oklab, var(--color-fd-muted) 45%, transparent)',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection':
    {
      backgroundColor:
        'color-mix(in oklab, var(--color-fd-primary) 22%, transparent)',
    },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--color-fd-primary)' },
  '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
    backgroundColor:
      'color-mix(in oklab, var(--color-fd-primary) 18%, transparent)',
    outline: 'none',
  },
  '.cm-selectionMatch': {
    backgroundColor:
      'color-mix(in oklab, var(--color-fd-primary) 12%, transparent)',
  },
  '.cm-placeholder': { color: 'var(--color-fd-muted-foreground)' },
  '.cm-tooltip': {
    backgroundColor: 'var(--color-fd-popover)',
    border: '1px solid var(--color-fd-border)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--color-fd-accent)',
    color: 'var(--color-fd-accent-foreground)',
  },
});

const highlight = HighlightStyle.define([
  { tag: t.heading, color: 'var(--color-fd-primary)', fontWeight: '700' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  {
    tag: [t.link, t.url],
    color: 'var(--color-fd-primary)',
    textDecoration: 'underline',
  },
  {
    tag: [t.monospace, t.meta],
    color:
      'color-mix(in oklab, var(--color-fd-primary) 80%, var(--color-fd-foreground))',
  },
  {
    tag: t.quote,
    color: 'var(--color-fd-muted-foreground)',
    fontStyle: 'italic',
  },
  {
    tag: [t.list, t.processingInstruction],
    color: 'var(--color-fd-muted-foreground)',
  },
  {
    tag: [t.comment],
    color: 'var(--color-fd-muted-foreground)',
    fontStyle: 'italic',
  },
  { tag: [t.keyword, t.tagName], color: '#c026d3' },
  { tag: [t.attributeName, t.propertyName], color: '#0284c7' },
  { tag: [t.string, t.attributeValue], color: '#059669' },
  { tag: [t.number, t.bool, t.null], color: '#d97706' },
]);

// 站内自定义组件的补全: 输入 `<` 即可挑, MDX 作者不用记语法。
const SNIPPETS = [
  {
    label: '<Callout>',
    detail: '提示框',
    body: '<Callout title="标题">\n  内容\n</Callout>',
  },
  {
    label: '<Callout type="warn">',
    detail: '警告框',
    body: '<Callout type="warn" title="注意">\n  内容\n</Callout>',
  },
  {
    label: '<EMermaid>',
    detail: '流程图',
    body: '<EMermaid chart={`graph TD;\n  A-->B;\n`} />',
  },
  {
    label: '<ErrorCodeTable />',
    detail: '错误码表',
    body: '<ErrorCodeTable />',
  },
];

function imageFiles(list: FileList | null | undefined): File[] {
  return [...(list ?? [])].filter((file) => file.type.startsWith('image/'));
}

function mdxCompletions(context: CompletionContext) {
  const word = context.matchBefore(/<[\w"= ]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return {
    from: word.from,
    options: SNIPPETS.map((snippet) => ({
      label: snippet.label,
      detail: snippet.detail,
      type: 'class',
      apply: snippet.body,
    })),
  };
}

export function CodeMirrorEditor({
  value,
  onChange,
  onSave,
  onFiles,
  placeholder,
  handleRef,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  /** 拖入 / 粘贴的图片文件, 由调用方上传并插入 */
  onFiles?: (files: File[]) => void;
  placeholder?: string;
  handleRef?: Ref<CodeMirrorHandle>;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const onFilesRef = useRef(onFiles);
  onChangeRef.current = onChange;
  onSaveRef.current = onSave;
  onFilesRef.current = onFiles;

  useEffect(() => {
    if (!host.current) return;

    const saveKey = new Compartment();
    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      highlightSelectionMatches(),
      autocompletion({ override: [mdxCompletions] }),
      EditorView.lineWrapping,
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      syntaxHighlighting(highlight),
      theme,
      cmPlaceholder(placeholder ?? ''),
      saveKey.of(
        keymap.of([
          {
            key: 'Mod-s',
            preventDefault: true,
            run: () => {
              onSaveRef.current?.();
              return true;
            },
          },
        ]),
      ),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        ...completionKeymap,
        indentWithTab,
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChangeRef.current(update.state.doc.toString());
      }),
      // 截图直接粘进来 / 从访达拖进来就能上传, 这是写文档时最高频的动作
      EditorView.domEventHandlers({
        paste(event) {
          const files = imageFiles(event.clipboardData?.files);
          if (files.length === 0 || !onFilesRef.current) return false;
          event.preventDefault();
          onFilesRef.current(files);
          return true;
        },
        drop(event) {
          const files = imageFiles(event.dataTransfer?.files);
          if (files.length === 0 || !onFilesRef.current) return false;
          event.preventDefault();
          onFilesRef.current(files);
          return true;
        },
      }),
    ];

    const instance = new EditorView({
      state: EditorState.create({ doc: value, extensions }),
      parent: host.current,
    });
    view.current = instance;
    return () => {
      instance.destroy();
      view.current = null;
    };
    // 只在挂载时建一次: value 的外部变更走下面的同步 effect, 重建会丢光标与撤销历史
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 外部值变化 (切换语言 tab / 放弃修改) 时同步进编辑器, 相同则不动, 避免打断输入
  useEffect(() => {
    const instance = view.current;
    if (!instance) return;
    const current = instance.state.doc.toString();
    if (current === value) return;
    instance.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      selection: {
        anchor: Math.min(instance.state.selection.main.anchor, value.length),
      },
    });
  }, [value]);

  useImperativeHandle(
    handleRef,
    (): CodeMirrorHandle => ({
      focus: () => view.current?.focus(),
      surround: (before, after = before, placeholderText = '') => {
        const instance = view.current;
        if (!instance) return;
        const { from, to } = instance.state.selection.main;
        const selected = instance.state.sliceDoc(from, to) || placeholderText;
        instance.dispatch({
          changes: { from, to, insert: `${before}${selected}${after}` },
          selection: {
            anchor: from + before.length,
            head: from + before.length + selected.length,
          },
        });
        instance.focus();
      },
      insertBlock: (text) => {
        const instance = view.current;
        if (!instance) return;
        const { from } = instance.state.selection.main;
        const line = instance.state.doc.lineAt(from);
        const atLineStart = from === line.from;
        const prefix = atLineStart ? '' : '\n';
        instance.dispatch({
          changes: { from: line.to, insert: `${prefix}\n${text}\n` },
          selection: { anchor: line.to + prefix.length + 1 + text.length },
        });
        instance.focus();
      },
    }),
    [],
  );

  return <div ref={host} className={className} />;
}
