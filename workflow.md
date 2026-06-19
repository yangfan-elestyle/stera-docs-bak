```When Editing
本文档作用: 工程工作流程 (可用工具 / 调试 / 发布); MUST NOT 写工程说明 (→ README.md) / LLM 约束 (→ AGENTS.md)
遵循 AGENTS.md 文档编写规范
- 所有段落均为条件段, 存在即为明确流程, MUST NOT 附加强度标记
- 发布内按顺序编号步骤; 顶部 TL;DR ≤ 5 行; 删除子段后重编号保持连续
- 风险点 / 不可逆操作用 `>` 引用块; 高危操作 MUST 标禁用条件
- MUST NOT 写账号名 / 邮箱 / org 等账号细节; 个人 CF 账号名用 `<cf-name>` 占位
```

# 可用工具

- `wrangler` 已登录 — Cloudflare 预览部署
- `gh` 已登录 — PR 操作 / 拉私有依赖

# 调试

`bun run dev` → <http://localhost:3000>: 本机调试, Chrome DevTools MCP 检查页面。

# 发布

代码变更完成 + 预览验收后执行 (= 需求交付最后环节)。AI 仅本地 commit 收尾, MUST NOT push;

## TL;DR

依序执行:

1. 验证: `bun run types:check`
2. 预部署: 本机 `wrangler` 部署 CF 预览, 到预览 URL 验收 (default + smcc 两租户)
3. 写版本: `package.json#version` + `CHANGELOG.md` + `CHANGELOG.dev.md` 同步编辑
4. 发布: 本地 commit 收尾 (AI MUST NOT push; push / PR / 部署由人类执行)

## 1. 验证

```bash
bun run types:check    # fumadocs-mdx + next typegen + tsc --noEmit
```

## 2. 预部署

用本机 `wrangler` 部署到 CF 预览, 到预览 URL 验收 (AI 验收唯一方式); default + smcc 两租户都要验。

```bash
bun run generate:data                                   # 仅 clone 后 / 源数据变更时
bunx opennextjs-cloudflare build                        # OpenNext 构建 → .open-next/
bunx opennextjs-cloudflare deploy                       # 默认租户 → elepay-docs.<cf-name>.workers.dev
bunx opennextjs-cloudflare upload --preview-alias smcc  # smcc 租户   → smcc-elepay-docs.<cf-name>.workers.dev
```

> 尾部 esbuild 警告 (第三方库, 非致命) 属预期。

## 3. 写版本

- 版本号: 默认递增 PATCH (第三位); 新功能 → MINOR; 不兼容改动 → MAJOR。
- `package.json#version` + `CHANGELOG.md` (用户向) + `CHANGELOG.dev.md` (镜像 + 技术子项) 三者同步编辑, 版本号一致。

## 4. 发布

仅本地 commit, 到此收尾。

```bash
git add <...>
git commit -m "release: vX.Y.Z"
```
