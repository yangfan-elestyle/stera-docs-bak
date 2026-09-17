```When Editing
本文档作用: 工程工作流程 (可用工具 / 调试 / 内网预览部署 / 发布); MUST NOT 写工程说明 (→ README.md) / LLM 约束 (→ AGENTS.md)
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
bun run import:seed   # 只在 data/cms.db 缺失或要重置内容时跑
bun run dev           # http://localhost:3000
```

验收用本机 docker 运行 (= AI 唯一交付判定, 与生产同一镜像):

```bash
docker build --build-arg DOCS_ENV=staging -t stera-docs:local .
docker run --rm -p 3000:3000 -v stera-data:/app/data \
  -e ADMIN_EMAIL=ops@example.com -e ADMIN_PASSWORD='<12 位以上, 含大小写与数字>' \
  stera-docs:local
```

单租户, 任意 Host 内容一致; 冒烟六条:

```bash
curl -sI http://localhost:3000/                        # 200
curl -sI http://localhost:3000/favicon.ico             # 200, 非 404 (matcher 漏排除会 404)
curl -s  http://localhost:3000/llms.txt | head         # 绝对 URL 正常
curl -sI http://localhost:3000/get-started/set-up.md   # 200
curl -s  'http://localhost:3000/api/search?query=stera&locale=ja' | head -c 80   # 有结果
curl -sI http://localhost:3000/admin/login             # 200, 未登录不 500
```

> 改代码后必须重跑 `docker build` (镜像无 HMR); 仅重跑 `docker run` 跑的是旧镜像。
> `DOCS_ENV` 是构建期参数, `docker run -e DOCS_ENV=` 改不动已构建产物。
> 空卷首启会自动灌 `seed/docs`; 卷里已有数据则不再灌, 编辑结果不会被覆盖。
> `ADMIN_EMAIL` / `ADMIN_PASSWORD` 只在账号表为空时生效, 之后改它们没有任何作用。

# 内网预览部署

给同事看效果用, 目标 `http://ele-qa-autopilot.local:3000`。与下面的发布流程各自独立, 不用发版、不碰 GHA。人类说「部署给同事看」时执行:

```bash
git push deploy develop                                                      # deploy = ele-qa-autopilot:/Users/ele/git/stera-docs.git
ssh ele-qa-autopilot '/Users/ele/Documents/stera-docs-project/run.sh update' # git pull + docker build + 换容器
ssh ele-qa-autopilot '/Users/ele/Documents/stera-docs-project/run.sh status' # 容器 running + HTTP 200 + 落后上游 0
curl -sI http://ele-qa-autopilot.local:3000/                                 # 200; 从本机发, 只有它验到 mDNS + 端口映射
```

- `deploy` remote 不存在: `git remote add deploy ele-qa-autopilot:/Users/ele/git/stera-docs.git`。
- 连发多条 ssh 复用连接: `-o ControlMaster=auto -o ControlPath=/tmp/cm-%r@%h:%p -o ControlPersist=600`。
- `run.sh` 先构建再停旧容器, 构建失败时旧容器保持在服务。

> 那台机的内容库是 docker volume `stera-docs-data`, 与本机 `data/cms.db` 各自独立; 同事在那边后台的编辑不回流, 本机内容也不会自动同步过去。
> 重灌那边的内容库是破坏性操作 (丢掉同事的全部编辑), 步骤与排障见该机 `/Users/ele/Documents/stera-docs-project/README.md`, MUST NOT 凭记忆拼命令。

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
