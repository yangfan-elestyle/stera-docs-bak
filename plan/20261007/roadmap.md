# stera smart one 后续路线图

目标: stera-docs 经 ele-argocd-app 部署到 stg EKS -> 公网链路 `guides.sterasmartone.com` -> stg ele-dispatcher -> Pod = 上线; ReadMe 废弃。SMCC 经该域名使用前台与 `/admin` 编辑。执行发布仍需人类明确指令。

期限: 10/26 上线; 1-5 + QA 页面内容测试全部在此之前完成 ([feature.md#交付约束](../20260914/feature.md))。

## 现状 (2026-10-07 核实)

- 内容: 正文派生自 elepay-docs; 目标内容 = [现网 ReadMe](https://guides.sterasmartone.com/) (SaaS 手册 / SaaS FAQ / 支付 API / SDK / EC 插件 / 支付 FAQ)。
- 域名: `sterasmartone.com` = 我司管理; 注册商 Onamae, DNS = 我司 Route53 zone `Z07455002YRBUXBNB689P`; `guides` 现 CNAME `ssl.readmessl.com` (ReadMe)。
  - ele-iac `jsonnet/route53/` 是快照, 无 Pulumi stack 引用 (线上 `org` 记录不在其中); 记录改动走 AWS 控制台。
- 部署先例 (ele-argocd-app):
  - 服务 workflow 带 `deploy-docker` step -> `repository_dispatch` -> `update-versions.yml` 写 `versions.json` (develop -> stg / master -> pro) -> ArgoCD sync。
  - `elepay-docs`: 只在 `stg.jsonnet`; `docs.elepay.io` + `docs-smcc.stg.elepay.dev` 由 stg ele-dispatcher 路由到 `elepay-docs.ele-toolbox.svc.cluster.local`; 无状态。
  - `oneqr-ai-svc-pro`: 生产实例搭 stg 集群, `image: e.getImageTag('pro', ...)` + `automated: false`; SQLite 落 EBS PVC (`ebs-stg`) + `replicas: 1` + `Recreate`。
  - `dashboard` / `business` / `org.sterasmartone.com` = CNAME -> `*.elepay.io` -> dispatcher NLB (先例为 pro dispatcher)。
- stg ele-dispatcher (`apps/ele-dispatcher/stg-base.libsonnet`):
  - NLB internet-facing; external-dns `domainFilters` 只含 `elepay.dev` / `elepay.io` / `sandbox-elepay.com` -> `sterasmartone.com` 记录须手工。
  - TLS: `dnsChallengeHosts` 外的域名按需签证书 (Google Trust Services; 实测 `stg-dashboard.sterasmartone.com` issuer `WR1`)。
  - `security.whitelist` `dryRun: true` -> 不拦截, SMCC 可经公网用 `/admin`。
- 存储: `ebs-stg` = stg 集群唯一 StorageClass; pro 集群无 PVC 先例 -> 只放 stg 集群。EBS = RWO + 单 AZ; 快照 / 备份策略未核实。
- 运行: 无部署实例。
- 应用: `/api/health` 只验 db 可读 (不可读 503); 无 sitemap / robots。
- CI: `docker-build.yml` push master -> 构建推 GHCR + job summary 输出镜像 digest (服务旧 ele-iac 方案); 无 `deploy-docker`; 未跑过。
- 数据: `/app/data` = `cms.db` + `uploads/`; MUST 块存储 (EBS), MUST NOT NFS / EFS (`Dockerfile:49`)。

## 1. 现网盘点 (P0)

- [x] 采集 ReadMe 页面 / 导航 / 图片 (`files.readme.io` 等外链) / 附件 / API 目录, 记来源 URL。
- [x] 对照 `seed/docs` / `public/docs` / `openapi*.yaml` / `error-codes.json`, 逐项标 新增 / 替换 / 保留 / 删除。
- [x] 旧 URL -> 新 slug 映射 (`/docs/*` / `/reference/*` / 下载入口)。
- 验收: 每页有迁移结论。 -> [smcc-migration.md](./smcc-migration.md)

## 2. 内容迁移 (P1)

- [x] 顺序: SaaS 手册 / FAQ -> 支付指南 -> SDK / 插件 -> API Reference。
- [x] 只写 `seed/docs`; 同步导航 / 首页索引 / 截图 (外链图下载入 `public/docs`) / `seed/updated-at.json`。
- [ ] ja 优先, en / zh 按来源核实或翻译; 清除不适用的 elepay 内容。
- [x] 技术标识按实际服务保留 (`api.elepay.io` 等), MUST NOT 机械替换; 三语 OpenAPI 同步 -> `bun run generate:data`。

## 3. stera-docs 改造 (P1)

- [ ] sitemap / 可索引 robots 只对 `guides.sterasmartone.com` 输出, 其他 host noindex。
- [ ] 旧 ReadMe URL 按 1 的映射逐页 301; MUST NOT 全量重写 `/docs/*` (已被 `public/docs` 图片占用)。

## 4. EKS 部署 (P1, 先例 `oneqr-ai-svc-pro` + `elepay-docs`)

ele-argocd-app 跨团队 PR, 须维护方 review (ele-dispatcher 为全公司共用入口)。

- [ ] stera-docs CI: `docker-build.yml` 加 `deploy-docker` step (`pat_token: secrets.DEPLOY_PAT_TOKEN`, 先确认 org secret 对本 repo 可见); 删 digest summary + 顶部 ele-iac 注释。触发仍只 push master。
- [ ] `apps/stera-docs/config.libsonnet` + `main.jsonnet` (照 `apps/oneqr-ai-svc-pro` + `apps/oneqr-ai-svc/main.jsonnet`):
  - `image: e.getImageTag('pro', 'stera-docs')`: master 构建写 `versions.json` pro key, stg 集群读之; develop 不触发部署。
  - namespace `ele-toolbox`; 端口 3000 -> Service 80。
  - PVC `ebs-stg` 5Gi 挂 `/app/data`; `fsGroup: 1001` (`Dockerfile` 的 `nextjs`), 否则空卷首启建库 EACCES。
  - `replicas: 1` + `strategy: Recreate`; MUST NOT 扩副本 (SQLite 单写)。
  - readiness / liveness = `/api/health`。
- [ ] `stg.jsonnet` 加 `stg-stera-docs` app, `automated: false` -> 生产发版 = ArgoCD 手动 sync (发布闸门)。
- [ ] `versions.json` pro 加 `stera-docs` key (首个 master 构建自动写入亦可)。
- [ ] `apps/ele-dispatcher/stg-base.libsonnet` 加 host 路由 -> `stera-docs.ele-toolbox.svc.cluster.local`:
  - `stera-docs.stg.elepay.dev` (QA 用, 走 `*.stg.elepay.dev` DNS challenge + external-dns 自动建记录)。
  - `guides.sterasmartone.com` (正式)。
  - `config.libsonnet` stg `dnsHostnames` 加 `stera-docs.stg.elepay.dev`; `guides` 不加 (external-dns 不管该 zone)。
- [ ] 备份: 先查 stg 账号有无 EBS 快照策略 (DLM); 无则补 (ele-iac stg stack, 人工 `pulumi up`) 按 PVC 卷打快照, 保留 >= 7 天; 做一次恢复演练 (快照 -> 新 PV -> 起 Pod -> 正文 / 上传图片在)。
- 验收: 空卷首启自动灌 seed; 删 Pod 重建后正文与上传图片保留; 经 `stera-docs.stg.elepay.dev` `/admin` 可登录编辑上传。
- MUST: 空卷首启会建固定初始管理员 (`lib/auth/guard.ts`), 首个登录者即可改密接管; dispatcher 白名单 `dryRun` 不拦截 -> 每次空卷首启 (含删 PVC 重建) 后先经 `kubectl port-forward` 完成首次登录改密, 再开放 dispatcher 路由; 路由已开放时重建 PVC 须先撤路由。
- 首启早于 2 完成时库内是旧内容: SMCC 开始编辑前可删 PVC 重新首启, 之后只能定向 upsert。
- 发版即短暂中断 (`Recreate`): 前台与 `/admin` 均不可用至新 Pod ready; 避开 SMCC 编辑时段。

## 5. 公网链路 (P1, 先例 `dashboard.sterasmartone.com`)

- [ ] 确认 dispatcher 回源保留原始 `Host`; 不保留则:
  - canonical / OG / `llms.txt` 绝对 URL 写成 svc 名 (应用按 `Host` 生成, `lib/request.ts`)。
  - `/admin` Server Action 的 Origin / Host 校验不一致 -> 保存失败。
- [ ] 切域名前降 TTL: `guides` 现 CNAME `ssl.readmessl.com` TTL 调低 (如 60s), 便于回退。
- 验收 (切域名前): 经 `stera-docs.stg.elepay.dev` 首页 / `.md` / `llms.txt` 绝对 URL = 该 host; `/admin` 登录、编辑、上传图片成功。
- 风险: `guides` 证书只能在 DNS 切换后按需签发 -> 切换后首个请求起数秒 TLS 可能失败; 切后立即 `curl -vI` 核对 issuer。

## 6. 上线 (P2, 10/26, 需明确发布指令)

- [ ] QA 页面内容测试: 在 `stera-docs.stg.elepay.dev` 上逐页核对正文 / 导航 / 图片 / 内链 / 三语言, 问题修完再切域名。
- [ ] Route53 (AWS 控制台): `guides.sterasmartone.com` 从 CNAME `ssl.readmessl.com` 改为 CNAME -> `docs.elepay.io` (stg dispatcher NLB, 同 `dashboard` -> `dashboard.elepay.io` 做法)。
- [ ] 外部验收: 证书 issuer = Google Trust Services; 首页 / 正文 / API / 搜索 / `.md` / `llms.txt` / 图片 / 旧 URL 跳转 / `/admin` 登录编辑。
- [ ] 上线后正式实例 CMS = 唯一内容信源, seed 只用于空库初始化。

## SMCC 已确认 (2026-10-07)

- 10/26 上线, 前置工作与 QA 全部此前完成。
- UI 排版无意见, 沿用现有设计。
- Chatbot 本期不做。

## 持续

- elepay-docs / `elepay-charge-api` 的 API / Webhook / SDK 事实修正按 v0.2.1 方式同步 (见 `CHANGELOG.dev.md`)。
- Chatbot (将来若做): 先建 stera smart one 独立知识源再接入, MUST NOT 复用 elepay 知识库。

下一步: 1 现网盘点; 3 / 4 / 5 可并行。
