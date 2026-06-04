'use client';
// playground「Send」后服务端返回的真实响应, 镜像到右侧响应示例面板 (openapi-response.tsx) 用的状态桥。
// 自定义 ResultDisplay (api-page.client.tsx) 写入, 响应面板订阅; Provider 在 api-page.tsx 的
// renderOperationLayout 外层, 同时罩住 playground 与 apiExample, 故无需 patch fumadocs-openapi。
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface MirrorResult {
  status: number; // HTTP 状态码
  code: string; // String(status), 用于匹配响应 tab
  bodyText: string; // 已解码的响应体文本
  lang: string; // 染色语言 (json / xml / html / text ...)
}

interface MirrorCtx {
  result: MirrorResult | null;
  setResult: (r: MirrorResult | null) => void;
}

const ResponseMirrorContext = createContext<MirrorCtx | null>(null);

export function ResponseMirrorProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<MirrorResult | null>(null);
  return <ResponseMirrorContext.Provider value={{ result, setResult }}>{children}</ResponseMirrorContext.Provider>;
}

// Provider 缺失时退化为空实现, 使响应面板可独立渲染 (无 playground 的纯示例场景)。
export function useResponseMirror(): MirrorCtx {
  return useContext(ResponseMirrorContext) ?? { result: null, setResult: () => {} };
}
