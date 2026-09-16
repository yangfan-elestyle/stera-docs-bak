# 去除多租户，SMCC 独立

> SMCC 从原 elepay docs repo 独立成新 repo 并单独维护，不再有关联。

## 技术变化

- 修剪: 多租户等现有逻辑完全抛弃
- 迁移: cloudflare → Docker, smcc domain 对接公司内网服务
- 改造: 数据源改自建 CMS (SQLite) + 在线编辑 + 独立用户权限控制
- 改造项: openapi / errorcode / i18n / docker / 多租户 / sidebar 索引(支持 CMS)
- 新增项: CMS 数据建设 / 文本在线编辑 / 权限控制 / 在线检索重构

## 交付约束

- UI 上线定在 10/26, 排期按此倒推, 非核心项后置
- UI 排版 SMCC 侧仍在确认, 未回复前 MUST NOT 定稿前端布局

## 已定事项

- 手写文档全部入 CMS 开放 SMCC 人员编辑; 只有 `openapi*.yaml` 生成的 153 页与 `error-codes.json` 数据文件留构建期 markdown-as-code, 改动走发版
- 存储用 SQLite: 内容 210 行, 读多写极少, 不申请 MySQL 实例
- 语言维持 ja / en / zh 三种。不做联动翻译, 每种语言各自是一份独立内容, 由编辑人员分别修改
- 编辑不做版本历史与回滚
- 权限保留基础 role: 管理员可创建带编辑权限的账号, 账号名即邮箱, 不走邮件邀请与确认流程
- Chatbot 不在本 PJ 范围, 但 SMCC 要一个大致可对应的时期, 需要给出回复

## 待明确

- 权限流转细节: 管理员如何发放账号与初始密码、编辑者如何首次登录, 尚未定
- Chatbot 预估时间点
- UI 排版, 等 SMCC 回复

## 已验证 (fumadocs 能力)

- 运行时外部数据源: fumadocs 稳定基建, 当前用内置 MDX 预编译。https://www.fumadocs.dev/docs/integrations/content/mdx-remote
- 文本编辑框架: 引入库依赖, edit 能力嵌入 SMCC 自定义样式页。https://www.fumadocs.dev/docs/editor
- 权限 / 编辑页: fumadocs 基于 next.js, 直接用 react 开发
