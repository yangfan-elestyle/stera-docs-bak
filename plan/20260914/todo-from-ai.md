# TODO

> 子项 = 注意事项与解法; 结论来自 `fumadocs-core` 16.15.10 / `fumadocs-mdx` 安装包源码, 非文档推测。

1. 拆分内容集合: openapi 页留构建期, 手写文档交给运行时数据源
   - 现为单 collection 覆盖 `(home)` + `openapi/(generated)`, 不拆则 openapi 页被一起拖进运行时源
   - 只有 `openapi/(generated)/` 153 页 MUST 留构建期 -> 脚本产物, 手改会被 `generate:data` 覆盖
   - `error-codes.json` 留本地数据文件; 但嵌 `<ErrorCodeTable />` 的 3 个 `error-code.*.mdx` 页与 `openapi/index.*.mdx` 3 页都是手写页, 入 CMS

2. 设计 SQLite 内容表结构 (正文 + 导航)
   - MUST 带 locale 维度, 唯一键 = (slug, locale); ja / en / zh 各存一行, 互不派生
   - 导航 meta 同样三份 (`meta.json` / `meta.en.json` / `meta.zh.json`), MUST 含非标准字段 `sectionNotes`; `lib/plugins/section-notes.ts` 走 `storage.read(metaPath)` 取值, 读不到会静默失效
   - MUST NOT 加版本历史表 (见 11)

3. 存量内容迁移入库

4. 实现运行时数据源并接入 fumadocs
   - `dynamicLoader({ docs: 动态源, openapi: 静态源 }, opts)` 原生支持混用; 按 `files` 类型判别, 数组 = 静态, 函数 = 动态
   - `revalidate(name)` 只清动态源
   - 图片无改造量: 981 处引用全是 `/docs/xxx.png` 绝对路径, 0 处 MDX `import`, `remarkImageOptions.useImport` 已为 false; 后续 MUST NOT 新增 `import` 式引用 -> mdx-remote 不支持
   - `compile()` 返回的 `frontmatter` 不经校验 -> 补 zod

5. 全文搜索接入运行时数据源
   - 传函数 `createFromSource(getSource)`; 按 loader 实例 WeakMap 缓存, `revalidate()` 后自动重建索引, 无需手动失效

6. 改造 EHome 组件: 导航数据改为渲染时注入
   - MUST NOT `import { source }` -> 自引用正在渲染它的 loader
   - `lib/llm-postprocess.ts` 同样 `import { source }` 取 `source.pageTree[lang]`, 两处都要改
   - 照 `page.tsx` 现有 `getMDXComponents({ a: createRelativeLink(source, page) })` 模式绑定注入
   - 其余组件无改造需求: `Callout` 21 / `EMermaid` 6 (client) / `ErrorCodeTable` 3 (同步); `APIPage` 手写内容 0 处, 仅在构建期 openapi 页

7. 最終更新日改用数据库时间
   - `lastModified()` 是编译期插件, CMS 后不触发; `DocsPage` 的 `lastUpdate` 只要 `Date` -> `pageData` 自带即可, `page.tsx:64` 不动
   - openapi 生成页现已是 `undefined` (`(generated)/` gitignored, `git log` 返回空) -> 需补则取 `openapi.yaml` mtime

8. 开发在线编辑页面
   - `middleware.ts` matcher MUST 排除 `/admin` -> 否则被 i18n rewrite 成 `/{locale}/admin`

9. 开发用户权限系统, 编辑入口限受信账号
   - 两种角色: admin 可建账号与授权, editor 可编辑内容; 账号名即邮箱
   - MUST NOT 接邮件服务 -> 无邀请信 / 无邮箱验证 / 无找回密码, 账号由 admin 在后台直接创建
   - MUST NOT 开放自助注册: mdx-remote 默认允许代码执行, 拿到编辑权即等于可在站内执行代码
   - 待定: admin 如何把初始密码交给 editor, 以及首次登录是否强制改密

10. 多语言维持 ja / en / zh
   - `lib/i18n.ts` 不动, 存量 zh 内容全部保留入库
   - 编辑页 (见 8) MUST 支持三语言分别编辑, 各语言独立保存; MUST NOT 做联动翻译或改一处同步多语
   - 单语言缺失时按 `fallbackLanguage: 'ja'` 回退, 编辑页需能看出某 slug 缺哪些语言

11. ~~编辑器加内容版本历史~~ 不做

12. 清理 git 依赖 (Dockerfile / CI / README)
