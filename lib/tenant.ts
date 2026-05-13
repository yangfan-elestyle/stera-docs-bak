export type Tenant = 'smcc' | 'default';

type HeaderLike = {
  get(name: string): string | null;
};

function firstHeaderValue(value?: string | null) {
  return value?.split(',')[0]?.trim() ?? '';
}

export function getRequestHost(headers: HeaderLike): string {
  return firstHeaderValue(headers.get('host'));
}

// Trust host (CF Custom Domain terminates TLS at edge);
// ignore X-Forwarded-Proto for the same reason getRequestHost ignores XFH.
export function getRequestProtocol(host: string) {
  const hostname = host.split(':')[0];
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost')
  ) {
    return 'http';
  }
  return 'https';
}

// Detect tenant from host. Current rule: host containing "smcc" -> smcc
export function detectTenantByHost(host?: string | null): Tenant {
  if (!host) return 'default';
  const h = String(host).toLowerCase();
  return h.includes('smcc') ? 'smcc' : 'default';
}
