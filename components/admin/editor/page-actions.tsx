'use client';

import { ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { deletePageAction } from '@/lib/admin/actions/content';
import { publicUrl } from '@/lib/admin/text';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/primitives';

export function PageActions({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant="secondary" size="sm" asChild>
        <Link href={publicUrl(slug)} target="_blank">
          在站点查看
          <ExternalLink />
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="更多操作">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem destructive onSelect={() => setOpen(true)}>
            <Trash2 />
            删除整页
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title="删除整页"
          description={`${slug} 的全部语言版本会被删除, 侧边栏里的入口也一并移除。此操作不可撤销。`}
        >
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deletePageAction({ slug });
                  if (result.ok) {
                    toast.success('页面已删除');
                    router.push('/admin/content');
                  } else {
                    toast.error('删除失败', { description: result.error });
                  }
                })
              }
            >
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
