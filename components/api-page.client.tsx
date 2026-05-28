'use client';
import { defineClientConfig } from 'fumadocs-openapi/ui/client';
import { DefaultResultDisplay, type ResultDisplayProps } from 'fumadocs-openapi/playground/client';
import { useEffect } from 'react';
import { BodyFields, ParameterField, type ParamLike } from './openapi-inline';
import { useResponseMirror } from './openapi-response-store';

// 由 Content-Type 推断染色语言; API 响应绝大多数为 JSON, 未知类型按 json 兜底。
function inferLang(contentType: string): string {
  const mime = (contentType.split(';')[0] ?? '').trim().toLowerCase();
  if (mime === 'application/json' || mime.endsWith('+json')) return 'json';
  if (mime === 'application/xml' || mime === 'text/xml' || mime.endsWith('+xml')) return 'xml';
  if (mime === 'text/html') return 'html';
  return 'json';
}

// 自定义 playground 结果展示: 成功响应只镜像到右侧响应面板 (openapi-response.tsx), 不在 playground 内原位重复展示;
// client_error (网络 / CORS 等无 HTTP 响应, 无法镜像) 仍用原生块就地反馈错误。卸载 / 重新 Send 时清镜像。
function MirroringResultDisplay({ data, reset, ...rest }: ResultDisplayProps) {
  const { setResult } = useResponseMirror();
  useEffect(() => {
    if (data.type === 'client_error') {
      setResult(null);
      return;
    }
    const lang = inferLang(data.headers.get('content-type') ?? '');
    let bodyText = new TextDecoder('utf-8').decode(data.body);
    if (lang === 'json') {
      try {
        bodyText = JSON.stringify(JSON.parse(bodyText), null, 2); // 美化, 与示例外观一致
      } catch {
        /* 非合法 JSON: 保留原始文本原样染色 */
      }
    }
    setResult({ status: data.status, code: String(data.status), bodyText, lang });
    return () => setResult(null);
  }, [data, setResult]);
  // 成功响应已镜像到右侧面板, 不在 playground 内重复展示; client_error 无法镜像, 保留原生块就地反馈。
  if (data.type === 'client_error') return <DefaultResultDisplay data={data} reset={reset} {...rest} />;
  return null;
}

// playground 参数 / body 输入框旁内联完整文档说明 (见 components/openapi-inline.tsx),
// 配合 api-page.tsx 隐藏正文 parameters / body 文档区, 消除两处重复。
export default defineClientConfig({
  playground: {
    // 认证框默认值: fumadocs 对 http bearer 硬编码 "Bearer " (playground/client.js useAuthInputs),
    // 不读 yaml securityScheme。这里预填示例提示密钥格式; 用 sk_... 占位 (非真实 token 格式) 避免 GitHub secret scanning 误报。
    transformAuthInputs(inputs) {
      return inputs.map((input) =>
        input.defaultValue === 'Bearer ' ? { ...input, defaultValue: 'Bearer sk_...' } : input,
      );
    },
    // 自定义结果展示, 把 Send 响应镜像到右侧响应面板。
    components: {
      ResultDisplay: MirroringResultDisplay,
    },
    renderParameterField(fieldName, param) {
      // fumadocs 的 ParameterItem 在 .map() 里直接返回本回调结果, 默认分支用 stringifyFieldKey
      // 作 key, 自定义分支不补 key, 故此处自带 key 避免 React list key 警告。
      return <ParameterField key={fieldName.join('.')} fieldName={fieldName} param={param as unknown as ParamLike} />;
    },
    renderBodyField(_fieldName, info) {
      return <BodyFields rawSchema={info.schema} />;
    },
  },
});
