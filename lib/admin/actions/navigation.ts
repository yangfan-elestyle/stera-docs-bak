'use server';

import { requireUser } from '@/lib/auth/guard';
import { saveNav, validateNavSource } from '@/lib/cms/content';
import { revalidateContent } from '@/lib/cms/revalidate';

export async function saveNavAction(input: {
  dir: string;
  locale: string;
  json: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireUser();

  const invalid = validateNavSource(input.json);
  if (invalid) return { ok: false, error: invalid };

  saveNav(input.dir, input.locale, input.json);
  revalidateContent();
  return { ok: true };
}
