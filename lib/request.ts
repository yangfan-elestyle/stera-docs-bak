type HeaderLike = {
  get(name: string): string | null;
};

function firstHeaderValue(value?: string | null) {
  return value?.split(',')[0]?.trim() ?? '';
}

export function getRequestHost(headers: HeaderLike): string {
  return firstHeaderValue(headers.get('host'));
}

// Trust host: 入口层 (ALB / ingress) 终止 TLS 并透传原始 Host;
// ignore X-Forwarded-Proto for the same reason getRequestHost ignores XFH.
//
// 内网直连的主机名一律判成 http: mDNS 的 `*.local` 与不带点的裸主机名都拿不到公网证书。
// 判成 https 会连累两处 —— canonical / OG / llms 的绝对 URL 打不开, 且会话 cookie 带上
// Secure, 浏览器在 http 源上直接丢弃它, 表现为「登录后每次操作都退回登录页」。
export function getRequestProtocol(host: string) {
  const hostname = host.split(':')[0];
  if (
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    !hostname.includes('.') // localhost 与内网裸主机名
  ) {
    return 'http';
  }
  return 'https';
}

export function getRequestOrigin(host?: string | null): string | undefined {
  const value = firstHeaderValue(host);
  if (!value) return undefined;

  try {
    return new URL(`${getRequestProtocol(value)}://${value}`).origin;
  } catch {
    return undefined;
  }
}
