'use client';

import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Table,
  Sparkles,
} from 'lucide-react';
import { useRef } from 'react';
import { insertText } from '@/lib/admin/insert-text';
import { useT } from '../i18n';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
} from '../ui/primitives';
import type { CodeMirrorHandle } from './codemirror';

export function EditorToolbar({
  editor,
  contentLocale,
  disabled,
  onPickImages,
}: {
  editor: React.RefObject<CodeMirrorHandle | null>;
  /** 正在编辑的那个语言文件。插入正文的占位词按它取, 不按界面语言 */
  contentLocale: string;
  disabled?: boolean;
  onPickImages?: (files: File[]) => void;
}) {
  const t = useT();
  const ins = insertText(contentLocale);
  const fileInput = useRef<HTMLInputElement>(null);
  const run = (fn: (handle: CodeMirrorHandle) => void) => () => {
    if (editor.current) fn(editor.current);
  };

  // 按钮文案 (t) 跟界面语言, 插进正文的文字 (ins) 跟内容语言 —— 两者是不同的东西
  const components = [
    {
      label: t('toolbar.calloutLabel'),
      body: `<Callout title="${ins.calloutTitle}">\n  ${ins.calloutBody}\n</Callout>`,
    },
    {
      label: t('toolbar.calloutWarnLabel'),
      body: `<Callout type="warn" title="${ins.warnTitle}">\n  ${ins.calloutBody}\n</Callout>`,
    },
    {
      label: t('toolbar.mermaidLabel'),
      body: `<EMermaid chart={\`graph TD;\n  A[${ins.mermaidStart}] --> B[${ins.mermaidEnd}];\n\`} />`,
    },
    { label: t('toolbar.errorCodeLabel'), body: '<ErrorCodeTable />' },
  ];

  const actions = [
    {
      icon: Bold,
      label: t('toolbar.bold'),
      run: run((e) => e.surround('**', '**', ins.bold)),
    },
    {
      icon: Italic,
      label: t('toolbar.italic'),
      run: run((e) => e.surround('_', '_', ins.italic)),
    },
    {
      icon: Link2,
      label: t('toolbar.link'),
      run: run((e) => e.surround('[', '](/get-started/set-up)', ins.linkText)),
    },
    {
      icon: Code2,
      label: t('toolbar.code'),
      run: run((e) => e.surround('`', '`', 'code')),
    },
    null,
    {
      icon: Heading1,
      label: t('toolbar.h1'),
      run: run((e) => e.insertBlock(`# ${ins.heading}`)),
    },
    {
      icon: Heading2,
      label: t('toolbar.h2'),
      run: run((e) => e.insertBlock(`## ${ins.heading}`)),
    },
    {
      icon: Heading3,
      label: t('toolbar.h3'),
      run: run((e) => e.insertBlock(`### ${ins.heading}`)),
    },
    null,
    {
      icon: List,
      label: t('toolbar.ul'),
      run: run((e) =>
        e.insertBlock(`- ${ins.listItem1}\n- ${ins.listItem2}`),
      ),
    },
    {
      icon: ListOrdered,
      label: t('toolbar.ol'),
      run: run((e) =>
        e.insertBlock(`1. ${ins.step1}\n2. ${ins.step2}`),
      ),
    },
    {
      icon: Quote,
      label: t('toolbar.quote'),
      run: run((e) => e.insertBlock(`> ${ins.quote}`)),
    },
    {
      icon: Table,
      label: t('toolbar.table'),
      run: run((e) =>
        e.insertBlock(
          `| ${ins.tableCol1} | ${ins.tableCol2} |\n| --- | --- |\n| ${ins.tableCell} | ${ins.tableCell} |`,
        ),
      ),
    },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-fd-border px-2 py-1.5">
      {actions.map((action, i) =>
        action === null ? (
          <span key={`sep-${i}`} className="mx-1 h-5 w-px bg-fd-border" />
        ) : (
          <Tooltip key={action.label} content={action.label}>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={action.run}
              aria-label={action.label}
            >
              <action.icon />
            </Button>
          </Tooltip>
        ),
      )}

      <span className="mx-1 h-5 w-px bg-fd-border" />

      <Tooltip content={t('toolbar.imageHint')}>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label={t('toolbar.image')}
          onClick={() => fileInput.current?.click()}
        >
          <ImageIcon />
        </Button>
      </Tooltip>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        multiple
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = '';
          if (files.length > 0) onPickImages?.(files);
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={disabled}>
            <Sparkles />
            {t('toolbar.components')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          <DropdownMenuLabel>{t('toolbar.componentsLabel')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {components.map((component) => (
            <DropdownMenuItem
              key={component.label}
              onSelect={() => editor.current?.insertBlock(component.body)}
            >
              {component.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
