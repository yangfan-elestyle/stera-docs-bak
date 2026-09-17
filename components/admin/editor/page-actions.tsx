'use client';

import { ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { deletePageAction } from '@/lib/admin/actions/content';
import { publicUrl } from '@/lib/admin/text';
import { useT } from '../i18n';
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
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant="secondary" size="sm" asChild>
        <Link href={publicUrl(slug)} target="_blank">
          {t('pageActions.viewOnSite')}
          <ExternalLink />
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={t('common.more')}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem destructive onSelect={() => setOpen(true)}>
            <Trash2 />
            {t('pageActions.deletePage')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title={t('pageActions.deletePage')}
          description={t('pageActions.deleteDesc', { slug })}
        >
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deletePageAction({ slug });
                  if (result.ok) {
                    toast.success(t('pageActions.deleted'));
                    router.push('/admin/content');
                    router.refresh();
                  } else {
                    toast.error(t('pageActions.deleteFailed'), { description: result.error });
                  }
                })
              }
            >
              {t('common.confirmDelete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
