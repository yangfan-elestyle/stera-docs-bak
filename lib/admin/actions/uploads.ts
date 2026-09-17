'use server';

import { requireWriter } from '@/lib/auth/guard';
import { storeUpload } from '@/lib/cms/uploads';
import { getAdminT } from '@/lib/admin/i18n/server';
import { cmsMessage } from '@/lib/admin/cms-error';

export type UploadActionResult =
  | { ok: true; url: string; name: string }
  | { ok: false; error: string };

export async function uploadImageAction(
  formData: FormData,
): Promise<UploadActionResult> {
  await requireWriter();
  const t = await getAdminT();

  const file = formData.get('file');
  if (!(file instanceof File)) return { ok: false, error: t('error.noFile') };

  try {
    const result = await storeUpload(file);
    return { ok: true, url: result.url, name: file.name };
  } catch (error) {
    return { ok: false, error: cmsMessage(error, t) };
  }
}
