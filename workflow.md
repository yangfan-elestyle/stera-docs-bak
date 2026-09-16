```When Editing
本文档作用: 工程工作流程 (可用工具 / 调试 / 发布); MUST NOT 写工程说明 (→ README.md) / LLM 约束 (→ AGENTS.md)
遵循 AGENTS.md 文档编写规范
- 所有段落均为条件段, 存在即为明确流程, MUST NOT 附加强度标记
- 发布内按顺序编号步骤; 顶部 TL;DR ≤ 5 行; 删除子段后重编号保持连续
- 风险点 / 不可逆操作用 `>` 引用块; 高危操作 MUST 标禁用条件
- MUST NOT 写账号名 / 邮箱 / org / plan 等账号细节
```

# 可用工具

- `gh` 已登录 — PR 操作
- `docker` 可用 — 本机构建 + 运行验收
- `bun` / `bunx` — 包管理 + 脚本执行

# 调试

迭代用 dev server (有 HMR):

```bash
bun run dev    # http://localhost:3000
```

验收用本机 docker 运行 (= AI 唯一交付判定, 与生产同一镜像):

```bash
docker build --build-arg DOCS_ENV=staging -t stera-docs:local .
docker run --rm -p 3000:3000 -v stera-data:/app/data stera-docs:local
```

单租户, 任意 Host 内容一致; 冒烟四条:

```bash
curl -sI http://localhost:3000/                 # 200
curl -sI http://localhost:3000/favicon.ico      # 200, 非 404 (matcher 漏排除会 404)
curl -s  http://localhost:3000/llms.txt | head  # 绝对 URL 正常
curl -sI http://localhost:3000/get-started/set-up.md   # 200
```

> 改代码后必须重跑 `docker build` (镜像无 HMR); 仅重跑 `docker run` 跑的是旧镜像。
> `DOCS_ENV` 是构建期参数, `docker run -e DOCS_ENV=` 改不动已构建产物。

# 发布

代码变更完成 + 本机验收后执行 (= 需求交付最后环节)。AI 仅本地 commit 收尾, MUST NOT push。

## TL;DR

依序执行:

1. 验证: `bun run types:check` + `docker build`
2. 写版本: `package.json#version` + `CHANGELOG.md` + `CHANGELOG.dev.md` 同步编辑
3. 发布: 本地 commit 收尾 (push / PR 由人类执行, PR merge 自动触发 GHA 构建 + 部署)

## 1. 验证

```bash
bun run generate:data              # 仅 clone 后 / openapi*.yaml 变更时
bun run types:check                # fumadocs-mdx + next typegen + tsc --noEmit
docker build --build-arg DOCS_ENV=staging -t stera-docs:local .
```

> MUST NOT 跑 `docker push` / 手动推 GHCR; 镜像只由 GHA 构建推送。

## 2. 写版本

- 版本号: 默认递增 PATCH (第三位); 新功能 → MINOR; 不兼容改动 → MAJOR。
- `package.json#version` + `CHANGELOG.md` (用户向) + `CHANGELOG.dev.md` (镜像 + 技术子项) 三者同步编辑, 版本号一致。

## 3. 发布

仅本地 commit, 到此收尾。

```bash
git add <...>
git commit -m "release: vX.Y.Z"
```

> 部署触发规则见 `.github/workflows/docker-build.yml` 头部注释 (push develop → staging, push master → product; 两分支仅经 PR merge 产生 push)。AI MUST NOT 等待 / 轮询 CI 结果。
