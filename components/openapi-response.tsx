'use client';
// 右侧响应示例面板, 替换 fumadocs-openapi 默认 renderResponseTabs。
// - 默认: 渲染 server 端预生成的示例 JSON (外观与原生一致)。
// - playground「Send」后: 若真实响应 status 命中某 tab, 该 tab 改用 DynamicCodeBlock
//   客户端染色渲染真实响应体 (镜像), 数据来自 openapi-response-store。
// - 高度: 动态跟随视口底, 见 useViewportFitHeight。
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tab, Tabs as FumaTabs } from 'fumadocs-ui/components/tabs';
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { useResponseMirror } from './openapi-response-store';
import styles from './openapi-response.module.css';

// fumadocs 高层 Tabs 在类型上 Omit 了 value/onValueChange (简化为非受控), 但其内部把这两者透传
// 底层 radix Tabs 且 ...props 展开在后 (见 fumadocs-ui/components/tabs 源码), 传入即可覆盖受控。
// 补回类型以受控选中: Send 返回后自动切到实际响应状态码对应 tab。
const Tabs = FumaTabs as (
  props: ComponentProps<typeof FumaTabs> & { value?: string; onValueChange?: (value: string) => void },
) => ReturnType<typeof FumaTabs>;

const BOTTOM_GAP = 16; // 面板底部与视口底的留白
const MIN_HEIGHT = 240; // 面板最小高度, 防止上方内容很高时算出过小值

// 桌面 sticky 布局下, 让响应代码块底部始终贴视口底 (高度 = 视口高 - 代码块当前顶部 - 留白),
// 故未钉住 / 已钉住的任何滚动位置都不溢出视口。
// 稳定关键: 滚动时在 rAF 里「直接写 CSS 变量」(element.style), 不经 React state -> 零重渲染,
// 由浏览器原生重算高度, 跟手且不抖动; 仅在值真正变化时写, 避免无谓回流。
// 移动端 (右栏非 sticky 堆叠) 移除变量, 回退 module.css 默认 600px。
function useViewportFitHeight(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const panel = ref.current;
    const sticky = panel?.closest<HTMLElement>('[class*="@4xl:sticky"]');
    if (!panel || !sticky) return;

    let raf = 0;
    let last = -1; // 上次写入值 (px); -2 表示已按移动端清除
    const apply = () => {
      raf = 0;
      if (getComputedStyle(sticky).position !== 'sticky') {
        if (last !== -2) {
          last = -2;
          panel.style.removeProperty('--resp-max-h');
        }
        return;
      }
      // 以内部滚动容器顶部为基准 (它与面板顶之间隔着 Tabs 标签栏 + 代码块头部)。
      const stickyTop = sticky.getBoundingClientRect().top;
      const scroller = panel.querySelector('.fd-scroll-container') ?? panel;
      const offsetWithin = scroller.getBoundingClientRect().top - stickyTop; // scroller 相对右栏顶, 不随滚动变
      // 滚到文档底部时右栏 sticky 触底、整体上移 (stickyTop < 钉住 top), 若用实时位置算会得到
      // 过大高度、令面板突然暴涨; 故 clamp 到钉住位置, 高度封顶为钉住时的稳定值, 消除突变。
      const pinnedTop = parseFloat(getComputedStyle(sticky).top) || 0;
      const effectiveTop = Math.max(stickyTop, pinnedTop) + offsetWithin;
      const h = Math.max(MIN_HEIGHT, Math.round(window.innerHeight - effectiveTop - BOTTOM_GAP));
      if (h !== last) {
        last = h;
        panel.style.setProperty('--resp-max-h', `${h}px`);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const ro = new ResizeObserver(schedule); // cURL 切语言、auth 展开等改变上方高度时重算
    ro.observe(sticky);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

export interface ResponseTabData {
  code: string; // 响应状态码 "200" / "400" ...
  example: ReactNode; // server 端预渲染的示例染色块 (无示例时为 null)
}

export function ResponsePanel({ tabs }: { tabs: ResponseTabData[] }) {
  const { result } = useResponseMirror();
  const ref = useRef<HTMLDivElement>(null);
  useViewportFitHeight(ref);

  const codes = tabs.map((t) => t.code);
  // 实际响应状态码未在已声明响应中 (如仅声明 200/201, 实际返回 500) 时追加该状态码 tab,
  // 使任意真实响应 (2xx 成功 / 4xx·5xx 错误) 都能在面板内呈现, 不再被丢弃。
  const extraCode = result && !codes.includes(result.code) ? result.code : null;
  const items = extraCode ? [...codes, extraCode] : codes;

  // 受控选中: Send 返回真实响应后自动切到其状态码 tab (成功 / 失败一致); 用户仍可手动切换。
  const [active, setActive] = useState(codes[0]);
  useEffect(() => {
    if (result) setActive(result.code);
  }, [result]);

  if (tabs.length === 0) return null;

  // active 可能指向已消失的追加 tab (result 清空后 extraCode 没了), 回退首个避免面板空白。
  const value = items.includes(active) ? active : items[0];

  return (
    <div ref={ref} className={styles.panel}>
      <Tabs items={items} value={value} onValueChange={setActive}>
        {tabs.map((tab) => {
          // 真实响应 status 命中该已声明 tab 时镜像真实响应体; 否则渲染预生成示例。
          const live = result && result.code === tab.code ? result : null;
          return (
            <Tab key={tab.code} value={tab.code}>
              {live ? <DynamicCodeBlock lang={live.lang} code={live.bodyText} /> : tab.example}
            </Tab>
          );
        })}
        {extraCode && result && (
          // 声明外状态码 (如未声明的 500): 直接染色渲染真实响应体。
          <Tab key={extraCode} value={extraCode}>
            <DynamicCodeBlock lang={result.lang} code={result.bodyText} />
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
