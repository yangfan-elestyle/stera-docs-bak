import type { StaticImageData } from 'next/image';
import { TENANT_IMAGES, TENANT_TEXTS } from '@/lib/tenant-config.data';
import { detectTenantByHost, type Tenant } from '@/lib/tenant';

export type TenantConfig = {
  texts?: Record<string, string>;
  images?: Record<string, StaticImageData>;
};

export const CONFIG_MAP: Record<Tenant, TenantConfig> = {
  default: {
    texts: TENANT_TEXTS.default,
    images: TENANT_IMAGES.default,
  },
  smcc: {
    texts: TENANT_TEXTS.smcc,
    images: TENANT_IMAGES.smcc,
  },
};

export function getTenantConfigForHost(host?: string | null): TenantConfig {
  const tenant = detectTenantByHost(host ?? undefined);
  const base = CONFIG_MAP.default;
  const override = CONFIG_MAP[tenant];
  return {
    texts: { ...(base.texts ?? {}), ...(override.texts ?? {}) },
    images: { ...(base.images ?? {}), ...(override.images ?? {}) },
  };
}

export function getTextValue(
  key: string,
  host?: string | null,
): string | undefined {
  const tenant = detectTenantByHost(host ?? undefined);
  const baseTexts = CONFIG_MAP.default.texts ?? {};
  if (tenant === 'default') return baseTexts[key];
  const tenantTexts = CONFIG_MAP[tenant]?.texts ?? {};
  // Fallback
  return tenantTexts[key] ?? baseTexts[key];
}

export function getImageAsset(
  key: string,
  host?: string | null,
): StaticImageData | undefined {
  const tenant = detectTenantByHost(host ?? undefined);
  const baseImages = CONFIG_MAP.default.images ?? {};
  if (tenant === 'default') return baseImages[key];
  const tenantImages = CONFIG_MAP[tenant]?.images ?? {};
  // Fallback
  return tenantImages[key] ?? baseImages[key];
}
