import {
  getPageDescription,
  getPageImage,
  isPageVisibleForHost,
  source,
} from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { headers } from 'next/headers';
import { detectTenantByHost, getRequestHost, type Tenant } from '@/lib/tenant';
import { getTextValue } from '@/lib/tenant-config';

export const revalidate = false;

// 按租户切换配色(背景统一深蓝,仅强调色/底部渐变线区分品牌)。
// 不设 fonts:沿用 next/og 运行时回退以正常渲染 CJK(显式 fonts 仅含拉丁字形会导致豆腐块)。
const THEME: Record<Tenant, { accent: string; gradient: string }> = {
  default: {
    accent: '#1098FF',
    gradient: 'linear-gradient(90deg, #1098FF 0%, #0F44EC 55%, #6366F1 100%)',
  },
  smcc: {
    accent: '#14B8A6',
    gradient: 'linear-gradient(90deg, #2DD4BF 0%, #0EA5A4 55%, #0F766E 100%)',
  },
};

export async function GET(
  _req: Request,
  { params }: RouteContext<'/[lang]/og/[...slug]'>,
) {
  const { slug, lang } = await params;
  const page = source.getPage(slug.slice(0, -1), lang);
  if (!page) notFound();

  const host = getRequestHost(await headers());
  if (!isPageVisibleForHost(page, lang, host)) notFound();

  const theme = THEME[detectTenantByHost(host)];
  const brand = getTextValue('elepay', host);
  const title = page.data.title;
  const description = getPageDescription(page);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0A1628',
          padding: '72px 80px',
        }}
      >
        {/* 顶部品牌 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 6,
              height: 34,
              borderRadius: 3,
              marginRight: 18,
              backgroundColor: theme.accent,
            }}
          />
          <div style={{ display: 'flex', fontSize: 32 }}>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{brand}</span>
            <span style={{ marginLeft: 12, color: '#7E8DA6', fontWeight: 500 }}>
              Docs
            </span>
          </div>
        </div>

        {/* 标题 + 描述(描述自动回退,缺省时仅留标题) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#FFFFFF',
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                display: 'flex',
                marginTop: 28,
                fontSize: 34,
                lineHeight: 1.4,
                color: '#9BA8BD',
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        {/* 底部品牌渐变线 */}
        <div
          style={{
            display: 'flex',
            height: 10,
            borderRadius: 5,
            backgroundImage: theme.gradient,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // OG 内容按 host 过滤 (SMCC 专属页隐藏于主站),跨 host 不可共享;明确 no-store
      // 防止中间 CDN 误缓存把 SMCC 内容透给主站。
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
