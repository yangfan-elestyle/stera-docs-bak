# 20260914 质量复盘

本期代码质量复盘通过，可进入 SMCC 内容迁移 + EKS 部署里程碑；v0.2.1 之后的 commit (含 `2de589c` 健康检查、`c61a6b0` 本轮修复) 未 push / 未发布。

- 11 项回归测试 / 252 条断言通过；849 项 Docker HTTP 断言通过，含三语 369 页 HTML + Markdown 全量验收；typecheck / `git diff --check` 通过。
- 工作树与无 `.git` 导出上下文构建的镜像 ID 相同：`sha256:976f92886f6580e4f4fda0943da18b1a0fb5b2e370eab7b7324220ee7a79823f`；Docker 构建断言 `data/cms.db` 不存在。
- 原始门禁输出：[verification.txt](./verification.txt)。

## 范围与决定

- 信源：`feature.md` / `actions.md` / `completed.md` / `todo-from-ai.md` + 当前工作树。
- 覆盖 A–E / G / H；F 已归入 `plan/20261007/roadmap.md`，本轮只核验本机 Docker 构建；GHCR workflow `docker-build.yml` 未成功跑过 (唯一一次 9/16 run 为 cancelled)。
- 当前初始内容：`seed/docs` 71 slug × ja/en/zh = 213 篇正文 + 39 份导航；构建期 API Reference 52 页 × 三语 = 156 页。三语共 369 页。
- 初始化账号：按 10/07 用户确认，空账号表使用代码固定值；首次登录强制改密，改密前禁止写入；不使用 `.env.example` / 初始化环境变量。
- 维持受信 MDX、独立三语、admin/editor、无邮件流程、无版本历史、单实例 SQLite、手写内容运行期刷新、OpenAPI/错误码数据构建期更新。
- 质量验收时未写入 Git staging；随后按用户指令本机 commit，未 push / 发布；项目现有 `data/cms.db` 未被测试重置。

## 修复

- `lib/admin/actions/content.ts` / `lib/cms/mdx.ts` / `lib/content-schema.ts`：发布前校验 YAML/schema + MDX 编译 + 组件引用；拒绝空标题和非法 redirect。
- `lib/cms/source.ts` / `db-provider.ts`：非法 YAML/JSON 记录单独跳过并记录路径，避免 loader 缓存失败导致整站不可用。
- `components/admin/editor/doc-editor.tsx`：初始加载保留待恢复草稿；纯编辑模式也暂存；非法 MDX 草稿可恢复；忽略已取消预览请求的响应；保存异常解除 loading；丢弃草稿刷新预览。
- `lib/cms/content.ts`：正文版本原子比对；同时新建语言、删除后保存均报冲突；修改时间单调递增；拒绝系统路径、路径穿越、URL 别名与构建期 OpenAPI 写入。
- `lib/cms/db.ts` / `version.ts`：migration 事务 + 全局单例 + 初始化标记 + trigger revision；失败关连接；删除全部内容后重启不重灌；同毫秒或低于最大时间戳的写入仍刷新数据源。
- `lib/auth/guard.ts` / `lib/source.ts` / `Dockerfile`：读取 request cookie / `connection()` 后才初始化账号或加载正文；构建期不创建 `cms.db`，Docker 构建加入文件不存在断言。
- `lib/admin/actions/navigation.ts` / `components/admin/nav-editor/nav-editor.tsx`：原始 JSON 比对防止覆盖他人修改；JSON → 结构保留修改；非法 JSON 留在编辑页；输入不因每次改字重建 DOM。
- `lib/admin/frontmatter.ts`：替换多行字段时移除对应续行，保留其他字段。
- `next.config.mjs` / `app/uploads/[name]/route.ts`：Server Action 上限匹配 8 MB 图片限制；上传响应加 `nosniff` + CSP sandbox，禁止独立打开 SVG 执行脚本。
- `components/ai/page-actions.tsx`：Copy Markdown 每次取最新正文，HTTP/clipboard 失败可重试，移除永久 Promise 缓存，清理提示计时器。
- `components/admin/editor/page-actions.tsx` / `doc-editor.tsx`：打开前台时设置当前内容语言，避免显示其他语言版本。
- `app/(admin)/admin/preview/[...slug]/page.tsx`：预览要求改密后写权限；按虚拟文件路径匹配含 route group 的页面，保留相对链接渲染。
- `components/admin/workspace/workspace.tsx`：窄屏提供内容树、新建页面、导航编辑入口；选页后收起树。
- `components/DocsTitleBar.tsx`：门户拆分后，文档总览/API Reference 的互跳路径改为 `/overview` / `/openapi`。
- `lib/auth/session.ts`：创建会话时清除已过期会话；`middleware.ts` 补齐静态图片类型；本期计划修正数量、初始化账号、API Reference 范围与部署状态。

## 逐项验收

- A1/A3：`tests/cms.test.ts` 验证隔离 SQLite、schema v4、migration 重跑、DDL 失败整体回滚；Docker 运行 Node 内置 SQLite。
- A2/A4：隔离空卷导入 213 篇正文/39 份导航；API Reference 不入 CMS；全量 213 篇 seed 通过运行期 schema/编译。
- B1/B2：三语各 123 页 HTML + Markdown 全量验收；非法 YAML/JSON 不影响健康页面与搜索。
- B3：导航 `sectionNotes` 保存后 `/overview` 立即出现新说明；浏览器 JSON/结构切换保留修改。
- B4/C4：seed 携带时间戳导入；保存返回的新时间戳严格递增；前台更新日期来自 CMS。
- C1/C2/C3/C6/E5：同一运行实例先读取旧数据，再保存；HTML / `.md` / `llms.txt` / `llms-full.txt` / 搜索 / 导航立即更新；表格、Callout、三語 fallback 可用。
- C5/D1/D2：动态 OG 三语返回 200；构建期未连接 CMS；无 `.git` 的当前工作树导出上下文可以构建 Docker。
- E1/E2/E3：匿名页面重定向、匿名 action 禁止写入、初始密码禁止写入；改密轮换会话；editor 可发布/不可建号；admin 自删/自降级拒绝；密码重置撤销旧会话与旧密码；删号清会话；注销立即失效。
- E4：新建页面 → CodeMirror 编辑 → 真实 iframe 预览 → 刷新保留草稿 → 恢复 → ⌘S 保存；英文页独立保存/按英文打开前台；Copy Markdown 不刷新即可取新正文；390px 下内容树可选页且无横向溢出。
- E4：正文 stale write / 同时新建语言 / 导航 stale write / 非法 MDX / 保留路径拒绝；2 MB SVG 上传成功，超过 8 MB 被应用拒绝；资源响应限制脚本。
- E5：重启后正文、上传图片、会话仍可用；删除页面移除所有语言与导航引用、公开页 404；丢弃草稿清除对应记录。
- G1–G4：当前运行代码不含多租户、Cloudflare、legacy redirects、elepay chatbot、构建期 git 插件；README/workflow/本期计划同步。
- G5：Docker health 为 healthy；坏库启动 `/api/health` 返回 503，连续 25 次失败不增长数据库文件句柄；探针只验证库可读。
- H1：首页三主入口指向 `/` / `/overview` / `/openapi`；导航生成栏目；桌面/390px 首页视觉检查通过，无横向溢出。

## 可复跑门禁

```bash
bun run test
bun run types:check
docker build -t stera-docs:review .
bun run scripts/verify-cms-http.ts stera-docs:review
git diff --check
```

- 自动化只使用自己的 `.tmp/cms-test-*` 或 Docker 容器/卷，结束清理；HTTP 脚本含正常路径、授权失败、并发冲突、非法内容与真实重启。
- HTTP 脚本读取当前镜像 `server-reference-manifest.json` 取得 action ID；不硬编码跨构建 ID。
- 浏览器使用同一 ego-browser TaskSpace；复制功能用该测试页的 clipboard mock 捕获应用输出，未读取系统剪贴板。

## 终验 (10/07)

- 复跑门禁全绿: `bun run test` 11 / 252; `types:check`; `git diff --check`; `docker build` 镜像 ID 同上 (全层命中缓存, 构建期断言沿用原始运行); HTTP 849 断言。
- 隔离容器补测 UI: 「只看缺语言」计数与筛选; 分隔符改名后 `sectionNotes` key 随迁、`/overview` 即时更新; 选文件上传恰好 8 MiB 成功; 粘贴 / 拖入上传成功。
- 结论: A–E / G / H 代码范围落地; `feature.md` 的 10/26 上线范围 (内容迁移 / 部署 / QA / 域名) 未落地, 由 `plan/20261007/roadmap.md` 承接。

## 下一里程碑

- 按 `plan/20261007/roadmap.md` 推进 ReadMe 盘点、SMCC 正文/图片/链接迁移；本轮只验证现有内容可渲染，不证明派生自 elepay 的业务文案适合 SMCC。
- ele-argocd-app stg EKS 部署、SQLite/上传备份与恢复验证、stg ele-dispatcher 公网链路实测、SMCC 业务内容 QA、域名切换留下一阶段。
- 本机验收通过不代表现网部署完成；正式发布需明确发布指令。

## 技术信源

- [Fumadocs MDX Remote](https://www.fumadocs.dev/docs/integrations/content/mdx-remote)：MDX 内容必须受信；编辑权限包含服务端代码执行能力。
- [Next.js Data Security](https://nextjs.org/docs/app/guides/data-security)：Server Action 可经直接 POST 调用，鉴权与输入验证保留在服务端 action。
- [SQLite Transaction](https://www.sqlite.org/lang_transaction.html)：migration 采用显式事务，正文更新采用原子条件写入。
- [Next.js connection](https://nextjs.org/docs/app/api-reference/functions/connection)：同步数据库读取前等待真实请求，阻止 prerender 执行。
