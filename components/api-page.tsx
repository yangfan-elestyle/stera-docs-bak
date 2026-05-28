import { openapi } from '@/lib/openapi';
import { phpCodeSample } from '@/lib/openapi/php-code-sample.client';
import { createAPIPage } from 'fumadocs-openapi/ui';
import client from './api-page.client';
import { ResponsePanel } from './openapi-response';
import { ResponseMirrorProvider } from './openapi-response-store';

export const APIPage = createAPIPage(openapi, {
  client,
  generateCodeSamples: () => [
    {
      id: 'php',
      label: 'PHP',
      lang: 'php',
      source: phpCodeSample,
    },
  ],
  content: {
    // 接管右侧响应面板: 默认渲染示例 JSON (外观同原生), playground「Send」后镜像真实响应。
    // 见 components/openapi-response.tsx + openapi-response-store.tsx。
    renderResponseTabs(tabs, ctx) {
      return (
        <ResponsePanel
          tabs={tabs.map((tab) => {
            // 复刻默认: 取首个示例 (含 schema 自动生成的 sample), JSON 美化后 server 端染色。
            // 多示例 (examples > 1) 暂只取首个; 默认实现用 Accordion 切换, 本站接口多为单示例。
            const sample = tab.examples?.[0]?.sample;
            const example = sample !== undefined ? ctx.renderCodeBlock('json', JSON.stringify(sample, null, 2)) : null;
            return { code: tab.code, example };
          })}
        />
      );
    },
    // 自定义 renderOperationLayout 复刻默认布局, 但省略 parameters / body / authSchemes 三个 slot:
    // 前两者的输入框已内联到 playground 并带完整文档说明 (见 api-page.client.tsx + openapi-inline.tsx),
    // authSchemes (auth 板块) 在 playground 中也已有足够描述, 故均不在正文重复渲染。
    // 其余区块 (响应 / 回调) 维持默认顺序与渲染。
    // 注意: 复刻默认布局, fumadocs 升级改默认布局时需手动同步。
    // ResponseMirrorProvider 罩住 playground 与 apiExample, 打通「Send」响应 -> 右侧面板镜像。
    renderOperationLayout(slots) {
      return (
        <ResponseMirrorProvider>
          <div className="flex flex-col gap-x-6 gap-y-4 @4xl:flex-row @4xl:items-start">
            <div className="min-w-0 flex-1">
              {slots.header}
              {slots.apiPlayground}
              {slots.description}
              {slots.responses}
              {slots.callbacks}
            </div>
            <div className="@4xl:sticky @4xl:top-[calc(var(--fd-docs-row-1,2rem)+1rem)] @4xl:w-[400px]">
              {slots.apiExample}
            </div>
          </div>
        </ResponseMirrorProvider>
      );
    },
  },
});
