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

const COMPONENTS = [
  {
    label: '提示框 Callout',
    body: '<Callout title="标题">\n  内容\n</Callout>',
  },
  {
    label: '警告框 Callout(warn)',
    body: '<Callout type="warn" title="注意">\n  内容\n</Callout>',
  },
  {
    label: '流程图 EMermaid',
    body: '<EMermaid chart={`graph TD;\n  A[开始] --> B[结束];\n`} />',
  },
  { label: '错误码表 ErrorCodeTable', body: '<ErrorCodeTable />' },
];

export function EditorToolbar({
  editor,
  disabled,
  onPickImages,
}: {
  editor: React.RefObject<CodeMirrorHandle | null>;
  disabled?: boolean;
  onPickImages?: (files: File[]) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const run = (fn: (handle: CodeMirrorHandle) => void) => () => {
    if (editor.current) fn(editor.current);
  };

  const actions = [
    {
      icon: Bold,
      label: '粗体 ⌘B',
      run: run((e) => e.surround('**', '**', '粗体')),
    },
    {
      icon: Italic,
      label: '斜体 ⌘I',
      run: run((e) => e.surround('_', '_', '斜体')),
    },
    {
      icon: Link2,
      label: '链接',
      run: run((e) => e.surround('[', '](/get-started/set-up)', '链接文字')),
    },
    {
      icon: Code2,
      label: '行内代码',
      run: run((e) => e.surround('`', '`', 'code')),
    },
    null,
    {
      icon: Heading1,
      label: '一级标题',
      run: run((e) => e.insertBlock('# 标题')),
    },
    {
      icon: Heading2,
      label: '二级标题',
      run: run((e) => e.insertBlock('## 标题')),
    },
    {
      icon: Heading3,
      label: '三级标题',
      run: run((e) => e.insertBlock('### 标题')),
    },
    null,
    {
      icon: List,
      label: '无序列表',
      run: run((e) => e.insertBlock('- 项目一\n- 项目二')),
    },
    {
      icon: ListOrdered,
      label: '有序列表',
      run: run((e) => e.insertBlock('1. 第一步\n2. 第二步')),
    },
    {
      icon: Quote,
      label: '引用',
      run: run((e) => e.insertBlock('> 引用内容')),
    },
    {
      icon: Table,
      label: '表格',
      run: run((e) =>
        e.insertBlock('| 列一 | 列二 |\n| --- | --- |\n| 内容 | 内容 |'),
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

      <Tooltip content="插入图片 · 也可直接粘贴截图或拖入文件">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label="插入图片"
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
            组件
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          <DropdownMenuLabel>插入站内组件</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {COMPONENTS.map((component) => (
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
