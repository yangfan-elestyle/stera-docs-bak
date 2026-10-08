```When Editing
本文档: 工程总览 + 命令 + 硬约束; 调试 / 发布 -> workflow.md
只写违反即出错的约束, 一条一行
```

# stera smart one Docs

stera smart one (SMCC) 文档站 + 编辑后台 `/admin`。日 / 英 / 简三语。

<!-- prettier-ignore -->
| 环境 | URL |
|---|---|
| 本机 | <http://localhost:3000> |
| prod | <https://guides.sterasmartone.com> |

Next.js + Fumadocs + Bun。Docker 镜像 -> GHCR; 目标: ele-argocd-app 部署到 stg EKS (见 `plan/20261007/roadmap.md`)。

## 内容

- 手写文档存 `data/cms.db` (`node:sqlite`), 后台编辑即时生效; 空库首启从 `seed/docs` 灌入。
- API Reference 由 `openapi*.yaml` 构建期生成。
- 持久卷 `/app/data` = `cms.db` + `uploads/`。
- 健康检查 `/api/health` (只验 db 可读), 镜像内置 `HEALTHCHECK`。
- 账号表为空时自动建 `admin@sterasmartone.com` / `123456`, 首登强制改密。

```bash
bun run generate:data    # clone 后 / 改 openapi*.yaml 后必跑
bun run import:seed      # seed/docs -> data/cms.db, 清空重灌
bun run test             # 隔离库回归 + 全量 seed 编译
bun run scripts/verify-cms-http.ts stera-docs:local  # 自动创建/清理隔离 Docker 容器与卷, HTTP 验收
```

## 硬约束

- 取内容 MUST 走 `getSource()`, MUST NOT 直接 `source.get()`, 否则 `.md` / `llms.txt` 不随保存更新。
- 站点出口 (侧边栏 / 首页 / 页脚 / 搜索 / `llms*.txt` / EHome) MUST 走 `getSiteTree()` / `getSitePages()`, 否则 frontmatter `hidden: true` 页泄露; `/admin` 树与链接解析用原始树。
- `next build` MUST NOT 读 db -> 页面路由 MUST NOT 加 `generateStaticParams`。
- 新增静态资源路径 MUST 加进 `middleware.ts` matcher 排除, 否则 404。
- 文档页 MUST NOT 放 `/docs/*` (属 `public/docs` 静态资源); 站内链接 MUST NOT 带 `/ja` `/en` `/zh`。
- 上传文件 MUST 写 `data/uploads/`, MUST NOT 写 `public/`。
- 编辑权限 = 受信 MDX 代码执行权限; 账号只授予受信编辑人员。
- 三份 `openapi*.yaml` 结构 MUST 一致, 仅文案不同。
- 改导航 MUST 同步三语 `meta.[lang].json`。
- 新增 MDX 组件 MUST 登记 `mdx-components.tsx` / `source.config.ts` / `lib/cms/mdx.ts` / `lib/llm-postprocess.ts`。
- MUST NOT 手改生成物: `.source/` / `content/docs/openapi/(generated)/` / `data/`。
- `.mdx` 注释用 `{/* */}`, MUST NOT 用 `<!-- -->`。
