```When Editing
本文档作用: 工程工作流程 (可用工具 / 调试 / 发布); MUST NOT 写工程说明 (→ README.md) / LLM 约束 (→ AGENTS.md)
遵循 AGENTS.md 文档编写规范
- 所有段落均为条件段, 存在即为明确流程, MUST NOT 附加强度标记
- 发布内按顺序编号步骤; 顶部 TL;DR ≤ 5 行; 删除子段后重编号保持连续
- 风险点 / 不可逆操作用 `>` 引用块; 高危操作 MUST 标禁用条件
- MUST NOT 写账号名 / 邮箱 / org / plan 等账号细节
```

# 可用工具

- `gh` 已登录 — PR 操作 / 拉私有依赖
- `wrangler` 已登录, 仅可用不触网的本机命令 (`types` / `dev` / `deploy --dry-run`)
- `bun` / `bunx` — 包管理 + 脚本执行

# 调试

本机 workerd 预览 = AI 唯一验收方式 (贴近生产运行时, 不需 CF 账号; 无 CF 远端预览可用)。

```bash
bunx opennextjs-cloudflare build     # next build + OpenNext 打包 → .open-next/
bunx opennextjs-cloudflare preview   # 仅 wrangler dev, 读 .open-next/ 产物 → http://localhost:8787
```

验证： <http://localhost:8787> — Chrome DevTools MCP 检查页面

> 改代码后必须重跑 `build` + `preview` (无 HMR); 仅重跑 `preview` 跑的是旧产物。

# 发布

代码变更完成 + 本机验收后执行 (= 需求交付最后环节)。AI 仅本地 commit 收尾, MUST NOT push。

## TL;DR

依序执行:

1. 验证: `bun run types:check` + OpenNext 构建 + `bunx wrangler deploy --dry-run`
2. 写版本: `package.json#version` + `CHANGELOG.md` + `CHANGELOG.dev.md` 同步编辑
3. 发布: 本地 commit 收尾 (push / PR / 部署由人类执行, PR merge 自动触发 GHA 部署)

## 1. 验证

```bash
bun run generate:data              # 仅 clone 后 / 源数据 (openapi.yaml, 错误码) 变更时
bun run types:check                # fumadocs-mdx + next typegen + tsc --noEmit
bunx opennextjs-cloudflare build   # OpenNext 构建 → .open-next/
bunx wrangler deploy --dry-run     # 校验 wrangler.jsonc + bundle + bindings, 不上传
```

> 尾部 esbuild 警告 (第三方库, 非致命) 属预期。
> MUST NOT 跑 `opennextjs-cloudflare deploy` / `upload` / `wrangler deploy`。

## 2. 写版本

- 版本号: 默认递增 PATCH (第三位); 新功能 → MINOR; 不兼容改动 → MAJOR。
- `package.json#version` + `CHANGELOG.md` (用户向) + `CHANGELOG.dev.md` (镜像 + 技术子项) 三者同步编辑, 版本号一致。

## 3. 发布

仅本地 commit, 到此收尾。

```bash
git add <...>
git commit -m "release: vX.Y.Z"
```

> 部署触发规则见 `.github/workflows/deploy.yml` 头部注释 (develop merge → staging, develop → master merge → product)。AI MUST NOT 等待 / 轮询 CI 结果。
