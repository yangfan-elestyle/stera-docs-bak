import { ImageResponse } from 'next/og';
import { landingCopy } from '@/lib/landing';
import { SITE } from '@/lib/site';

// 落地页是站点门面, 分享出去要有图。文档页的 OG 走 app/[lang]/og/[...slug],
// 那条路由只认文档 slug, 这里用 Next 的 opengraph-image 约定单独出一张。
export const alt = `${SITE.brand} Docs`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// 不指定 fonts: 沿用 next/og 的运行时回退, 显式字体只含拉丁字形会让 CJK 变豆腐块。
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const copy = landingCopy((await params).lang);

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 6,
              height: 34,
              borderRadius: 3,
              marginRight: 18,
              backgroundColor: '#14B8A6',
            }}
          />
          <div style={{ display: 'flex', fontSize: 32 }}>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{SITE.brand}</span>
            <span style={{ marginLeft: 12, color: '#7E8DA6', fontWeight: 500 }}>Docs</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#FFFFFF',
            }}
          >
            {copy.title}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.4,
              color: '#9BA8BD',
            }}
          >
            {copy.lead[0].slice(0, 80)}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            height: 10,
            borderRadius: 5,
            backgroundImage:
              'linear-gradient(90deg, #2DD4BF 0%, #0EA5A4 55%, #0F766E 100%)',
          }}
        />
      </div>
    ),
    size,
  );
}
