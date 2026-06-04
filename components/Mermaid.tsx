'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

/**
 * Mermaid 图表组件。mermaid 在客户端动态 import，不打进 SSR / Worker bundle。
 * MDX 用法: <Mermaid chart={`flowchart TD; A-->B;`} />
 */
export function Mermaid({ chart }: { chart: string }) {
  const id = useId();
  const [svg, setSvg] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let active = true;

    void renderChart();

    async function renderChart() {
      const { default: mermaid } = await import('mermaid');
      // securityLevel 'strict': mermaid 对渲染输出做净化。chart 内容均为文档内硬编码、
      // 无外部输入，下方 dangerouslySetInnerHTML 注入的是受信任来源 + 净化后的 SVG。
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        fontFamily: 'inherit',
        themeCSS: 'margin: 1.5rem auto 0;',
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      });

      try {
        const { svg } = await mermaid.render(
          id.replaceAll(':', '-'),
          chart.replaceAll('\\n', '\n'),
          containerRef.current ?? undefined,
        );
        if (active) setSvg(svg);
      } catch (error) {
        console.error('Failed to render mermaid chart', error);
      }
    }

    return () => {
      active = false;
    };
  }, [chart, id, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      role="img"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default Mermaid;
