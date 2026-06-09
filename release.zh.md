# 发版流程

由用户主动触发。AI MUST NOT 自启 release。用户在功能验收通过后主动要求时, AI 按下方步骤升版本号 + 写两份 CHANGELOG。

> 预览部署是另一条流程 -> [deploy.md](./deploy.md)。

## TL;DR

1. 决定 SemVer bump: 默认 PATCH; 新功能 -> MINOR; 不兼容 -> MAJOR
2. `CHANGELOG.md` (用户向) 新版段 + 镜像到 `CHANGELOG` (开发者向, 每条加一行技术子项)
3. 同步 `package.json#version`
4. AI 执行 `git add` + `git commit -m "release: vX.Y.Z"` (仅此为 [AGENTS.md](./AGENTS.md) staging 硬约束在 release 流程下的例外); 用户执行 `git push`。不打 tag。

## 1. 触发条件

- 用户明确要求 (如 "release"、"发版"、"写 changelog 并 bump 版本")
- AI MUST NOT 自行提议 / 自启, 哪怕大 feature 已落地或已验收
- 在此之前不动 `CHANGELOG.md` / `CHANGELOG` / `package.json#version`

## 2. 写版本 (AI)

- `CHANGELOG.md` 顶部插入 `## [X.Y.Z] - YYYY-MM-DD` 段, 列用户可感知条目, 底部追加 `[X.Y.Z]:` 对比链接
- `CHANGELOG`: 镜像同一段, 每条加一行缩进的技术子项 (文件 / 函数 / 机制级)
- 两文件 MUST 同步推进, 写法 -> [llm-doc-style.md](./llm-doc-style.md)
- `package.json#version` = `X.Y.Z`

## 3. Commit (AI)

仅此步是 [AGENTS.md](./AGENTS.md) staging / commit 硬约束在 release 流程下的例外。release 之外 AI MUST NOT 动 staging。

```bash
git add CHANGELOG CHANGELOG.md package.json
git commit -m "release: vX.Y.Z"
```

## 4. Push (用户)

```bash
git push origin <branch>
```

> 不打 tag: 文档站无 `release.yml`, tag 仅会沦为无消费的历史锚点。AI MUST NOT push。
