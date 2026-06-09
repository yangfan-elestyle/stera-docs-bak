# 部署流程 (AI 预览 & 验证)

AI 改完用本机已登录的 `wrangler` 部署到 CF 预览, 禁止 `bun run dev` localhost 访问。

站点按请求 host 选租户 (`lib/tenant.ts`): host 含 `smcc` 渲染 **smcc** 租户, 否则 **default**。要同时验证两者: 照常部署 default URL, 再把同一份构件以 `smcc` preview alias 发布一次。

```bash
bun run generate:data                                   # clone 后 / 源数据变更后才需重跑
bunx opennextjs-cloudflare build                        # OpenNext 构建 → .open-next/
bunx opennextjs-cloudflare deploy                       # default 租户 → elepay-docs.<cloudflare-name>.workers.dev
bunx opennextjs-cloudflare upload --preview-alias smcc  # smcc 租户   → smcc-elepay-docs.<cloudflare-name>.workers.dev
```

> 预览 URL:
>
> - default: `https://elepay-docs.<cloudflare-name>.workers.dev`
> - smcc: `https://smcc-elepay-docs.<cloudflare-name>.workers.dev`
>
> alias 只是同一个 Worker 换个 host 访问, 靠前缀 `smcc-` 选租户 — 不新增 Worker, 不改配置。
>
> `deploy` 末尾大量 esbuild 警告 (第三方库, 非致命) 属正常
