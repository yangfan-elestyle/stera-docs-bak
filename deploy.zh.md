# 部署流程 (AI 预览 & 验证)

AI 改完用本机已登录的 `wrangler` 部署到 CF 预览, 禁止 `bun run dev` localhost 访问。

```bash
bun run generate:data              # clone 后 / 源数据变更后才需重跑
bunx opennextjs-cloudflare build   # OpenNext 构建 → .open-next/
bunx opennextjs-cloudflare deploy  # 本机 wrangler 登录态推送, 输出 *.workers.dev 预览 URL
```

> Preview URL: `https://elepay-docs.<cloudflare-name>.workers.dev`
>
> `deploy` 末尾大量 esbuild 警告刷屏 (第三方库, 非致命) 属正常
