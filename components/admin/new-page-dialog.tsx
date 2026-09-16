'use client';

import { FilePlus2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createPageAction } from '@/lib/admin/actions/content';
import { cn } from '@/lib/admin/cn';
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
}: {
  dirs: string[];
  locales: string[];
  defaultLocale: string;
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

  const slug = [dir, name].filter(Boolean).join('/');

  const submit = () => {
    startTransition(async () => {
      const result = await createPageAction({ slug, title, locales: picked });
      if (result.ok) {
        toast.success('页面已创建', {
          description: '已自动挂到所在分组的导航末尾',
        });
        setOpen(false);
        router.push(`/admin/content/${result.slug}`);
      } else {
        toast.error('创建失败', { description: result.error });
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
        <Button variant="primary" size="sm">
          <FilePlus2 />
          新建页面
        </Button>
      </DialogTrigger>
      <DialogContent
        title="新建页面"
        description="新页面会自动挂到所属分组的导航末尾, 位置之后可以在「导航」里调整。"
      >
        <div className="space-y-3">
          <Field label="所属分组" hint="决定页面在侧边栏的位置">
            <DirSelect value={dir} onChange={setDir} dirs={dirs} />
          </Field>

          <Field
            label="页面路径"
            required
            hint={slug ? `完整路径: ${slug}` : '英文小写, 用 - 连接单词'}
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

          <Field label="标题" required hint="可以之后在编辑器里改">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例: 新しいガイド"
            />
          </Field>

          <Field label="创建哪些语言" hint="没创建的语言在前台会回退到默认语言">
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
                    {locale === defaultLocale ? ' (默认)' : ''}
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
              取消
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={pending}
              disabled={!name || !title || picked.length === 0}
              onClick={submit}
            >
              创建并编辑
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
            <span className="font-mono text-xs">{dir || '(根目录)'}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
