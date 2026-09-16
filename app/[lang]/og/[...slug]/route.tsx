import { getPageDescription, getPageImage, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

export const revalidate = false;

// 不设 fonts:沿用 next/og 运行时回退以正常渲染 CJK(显式 fonts 仅含拉丁字形会导致豆腐块)。
const THEME = {
  accent: '#14B8A6',
  gradient: 'linear-gradient(90deg, #2DD4BF 0%, #0EA5A4 55%, #0F766E 100%)',
};

export async function GET(
  _req: Request,
  { params }: RouteContext<'/[lang]/og/[...slug]'>,
) {
  const { slug, lang } = await params;
  const page = (await source.get()).getPage(slug.slice(0, -1), lang);
  if (!page) notFound();

  const theme = THEME;
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
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
              {SITE.brand}
            </span>
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
    },
  );
}

export async function generateStaticParams() {
  return (await source.get()).getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
