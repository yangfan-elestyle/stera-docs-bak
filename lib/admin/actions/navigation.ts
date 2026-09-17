'use server';

import { requireWriter } from '@/lib/auth/guard';
import { saveNav, validateNavSource } from '@/lib/cms/content';
import { revalidateContent } from '@/lib/cms/revalidate';
import { getAdminT } from '@/lib/admin/i18n/server';

export async function saveNavAction(input: {
  dir: string;
  locale: string;
  json: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireWriter();

  const invalid = validateNavSource(input.json);
  if (invalid) {
    const t = await getAdminT();
    return {
      ok: false,
      error: t(
        invalid.kind === 'json' ? 'error.invalidNavJson' : 'error.invalidNav',
        { detail: invalid.detail },
      ),
    };
  }

  saveNav(input.dir, input.locale, input.json);
  revalidateContent();
  return { ok: true };
}
