# 去除多租户，SMCC 独立

> SMCC 从原 elepay docs repo 独立成新 repo 并单独维护，不再有关联。

## 技术变化

- 修剪: 多租户等现有逻辑完全抛弃
- 迁移: cloudflare → Docker, smcc domain 对接公司内网服务
- 改造: 数据源改自建 CMS (SQLite) + 在线编辑 + 独立用户权限控制
- 改造项: openapi / errorcode / i18n / docker / 多租户 / sidebar 索引(支持 CMS)
- 新增项: CMS 数据建设 / 文本在线编辑 / 权限控制 / 在线检索重构 / 健康检查

## 交付约束

- 10/26 正式上线 (SMCC 10/07 确认); 上线前完成全部工作, 含 QA 页面内容测试
- UI 排版 SMCC 无意见, 沿用现有设计

## 已定事项

- 手写文档全部入 CMS 开放 SMCC 人员编辑; 只有 `openapi*.yaml` 生成的 153 页与 `error-codes.json` 数据文件留构建期 markdown-as-code, 改动走发版
- 存储用 SQLite: 当前 seed 正文 213 行, 读多写极少, 不申请 MySQL 实例
- 语言维持 ja / en / zh 三种。不做联动翻译, 每种语言各自是一份独立内容, 由编辑人员分别修改
- 编辑不做版本历史与回滚
- 权限保留基础 role: 管理员可创建带编辑权限的账号, 账号名即邮箱, 不走邮件邀请与确认流程
- Chatbot 本期不做 (SMCC 10/07 确认)
- 权限流转: admin 当场设初始密码、线下交付, 首次登录强制改密
- 首个管理员在空账号表中用代码固定值初始化; 不引入环境变量配置 (10/07 确认)

## 已验证 (fumadocs 能力)

- 运行时外部数据源: fumadocs 稳定基建, 当前用内置 MDX 预编译。https://www.fumadocs.dev/docs/integrations/content/mdx-remote
- 文本编辑框架: 引入库依赖, edit 能力嵌入 SMCC 自定义样式页。https://www.fumadocs.dev/docs/editor
- 权限 / 编辑页: fumadocs 基于 next.js, 直接用 react 开发
