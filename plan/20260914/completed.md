# 2026.09.14 周期已完成项

> stera-docs 已从 elepay-docs 独立，完成 CMS 化改造与后台在线编辑；本机 + Docker 验收通过；正式部署与域名切换未开始，目标 10/26 上线。
> 版本：v0.2.0（9/17）、v0.2.1（10/5）

## 架构与独立

- 独立为 stera-docs 仓库，与 elepay-docs 解耦，各自演进
- 去除多租户，收敛为 stera smart one 单站点
- 部署从 Cloudflare 改为 Docker 容器（GHCR 镜像），构建不再依赖 git
- OpenAPI 与错误码改为仓库内本地源文件
- 健康检查 `/api/health`（只验 db 可读，不可读返回 503），镜像内置 `HEALTHCHECK`

## 内容 CMS

- 手写文档（69 页 × ja/en/zh = 207 篇）+ 侧边栏导航入库（SQLite），支持在线编辑
- API Reference（OpenAPI 生成的 153 页 + 概要页）与错误码数据随发版更新，不进后台
- 三语言各自独立维护，不做联动翻译；某语言缺失时回退 ja
- 保存后前台即时生效：页面 / 侧边栏 / 全文搜索 / `.md` / `llms.txt` / 最終更新日
- 空库首次启动自动导入初始内容

## 后台 `/admin`

- 账号权限：admin / editor 两角色，账号名即邮箱；admin 建号并设初始密码，首次登录强制改密；无自助注册、无邮件流程
- 编辑工作区：左侧即站点侧边栏，点页面改正文，点分组调排序与分段说明
- 编辑器：Markdown 编辑 + 格式工具栏 + 实时预览（与站点渲染一致）+ 三语言页签 + frontmatter 表单 + 草稿 + 并发保护
- 新建 / 删除页面（自动维护导航），图片上传（粘贴 / 拖入 / 选文件）
- 缺语言标记 + 「只看缺语言」筛选
- 后台界面支持 ja / en / zh 切换

## 前台站点

- 首页改为文档门户版式，对齐 SMCC 现网 guides.sterasmartone.com；栏目由导航自动生成
- 文档总览移至 `/overview`；顶部导航 = 首页 / 文档 / API 参考
- 移除 elepay chatbot（连的是 elepay 知识库）与导航栏 GitHub 链接

## 内容同步

- 同步 elepay-docs 上游修正：WeChat 小程序支付 V3 最佳实践、Webhook 重试 / 签名说明

## SMCC 已确认（10/7）

- 10/26 上线；此前完成全部工作，含 QA 页面内容测试
- UI 排版无意见，沿用现有设计
- Chatbot 本期不做

## 未完成（10/26 前完成）

- 现网 ReadMe 内容盘点与迁移（当前正文仍派生自 elepay-docs）
- 内网部署（ele-iac）+ 数据备份
- QA 页面内容测试
- `guides.sterasmartone.com` 域名切换
