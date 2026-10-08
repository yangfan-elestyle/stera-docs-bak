# stera smart one 后续路线图

目标: stera-docs 三环境 (sandbox / stg / pro, 见 [环境与域名](#环境与域名-2026-10-08-决定)) 经 ele-argocd-app 部署到 stg EKS; pro = 公网链路 `guides.sterasmartone.com` -> stg ele-dispatcher -> Pod = 上线; ReadMe 废弃。SMCC 经该域名使用前台与 `/admin` 编辑。执行发布仍需人类明确指令。

期限: 10/26 上线; 1-5 (sandbox 实例除外) + QA 页面内容测试全部在此之前完成 ([feature.md#交付约束](../20260914/feature.md))。

## 现状 (2026-10-07 核实)

- 内容: 正文派生自 elepay-docs; 目标内容 = [现网 ReadMe](https://guides.sterasmartone.com/) (SaaS 手册 / SaaS FAQ / 支付 API / SDK / EC 插件 / 支付 FAQ)。
- 域名: `sterasmartone.com` = 我司管理; 注册商 Onamae, DNS = 我司 Route53 zone `Z07455002YRBUXBNB689P`; `guides` 现 CNAME `ssl.readmessl.com` (ReadMe)。
  - ele-iac `jsonnet/route53/` 是快照, 无 Pulumi stack 引用 (线上 `org` 记录不在其中); 记录改动走 AWS 控制台。
- 部署先例 (ele-argocd-app):
  - 服务 workflow 带 `deploy-docker` step -> `repository_dispatch` -> `update-versions.yml` 写 `versions.json` (develop -> stg / master -> pro / 其他分支名原样 = 同名环境) -> ArgoCD sync。
  - `elepay-docs`: 只在 `stg.jsonnet`; `docs.elepay.io` + `docs-smcc.stg.elepay.dev` 由 stg ele-dispatcher 路由到 `elepay-docs.ele-toolbox.svc.cluster.local`; 无状态。
  - `oneqr-ai-svc`: sandbox / stg 共用 `apps/oneqr-ai-svc` (`main.jsonnet` 按 env); 生产 = `apps/oneqr-ai-svc-pro` 搭 stg 集群, 独立镜像 `oneqr-ai-svc-pro` + 独立 namespace `oneqr-ai-pro` + `automated: false`; SQLite 落 EBS PVC (`ebs-stg`) + `replicas: 1` + `Recreate`。
  - `dashboard` / `business` / `org.sterasmartone.com` = CNAME -> `*.elepay.io` -> dispatcher NLB (先例为 pro dispatcher)。
- stg ele-dispatcher (`apps/ele-dispatcher/stg-base.libsonnet`):
  - NLB internet-facing; stg 集群 external-dns `domainFilters` 只含 `elepay.dev` / `elepay.io` / `sandbox-elepay.com` -> `sterasmartone.com` 记录须手工。
  - TLS: `dnsChallengeHosts` 外的域名按需签证书 (Google Trust Services; 实测 `stg-dashboard.sterasmartone.com` issuer `WR1`)。
  - `security.whitelist` `dryRun: true` -> 不拦截, SMCC 可经公网用 `/admin`。
- sandbox ele-dispatcher (`sandbox-base.libsonnet`): 同在 stg 集群 (ns `epsandbox`), 独立 NLB; 证书 = `*.sandbox-elepay.com` DNS challenge; 记录 = `config.libsonnet` baseConfig `dnsHostnames` -> stg external-dns。
- 存储: `ebs-stg` = stg 集群唯一 StorageClass; pro 集群无 PVC 先例 -> 只放 stg 集群。EBS = RWO + 单 AZ; 快照 / 备份策略未核实。
- 运行: 无部署实例。
- 应用: `/api/health` 只验 db 可读 (不可读 503); 无 sitemap / robots。
- CI: `docker-build.yml` push master -> 构建推 GHCR + job summary 输出镜像 digest (服务旧 ele-iac 方案); 无 `deploy-docker`; 未跑过。
- 数据: `/app/data` = `cms.db` + `uploads/`; MUST 块存储 (EBS), MUST NOT NFS / EFS (`Dockerfile:49`)。

## 环境与域名 (2026-10-08 决定)

公司无成文域名规范; 以下事实规范取自 ele-argocd-app dispatcher / app 配置:

- sandbox = `<name>.sandbox-elepay.com` (先例 `oneqr-ai.sandbox-elepay.com`)。
- stg = `<name>.stg.elepay.dev`; 新服务不带 `stg-` 前缀 (`org` / `oneqr-ai` / `docs-smcc`); `*.stg.elepay.dev` 已有通配记录 + 通配证书。
- pro = `*.elepay.io`; 白标 = `<svc>.sterasmartone.com`; stg 白标 = `stg-<svc>.sterasmartone.com`; sandbox 无 `sterasmartone.com` 域。
- 分支: `sandbox` -> sandbox / `develop` -> stg / `master` -> pro (`oneqr-ai-svc/.github/workflows/docker-publish.yml:11`)。

<!-- prettier-ignore -->
| 环境 | 域名 | 分支 | ArgoCD app | namespace |
|---|---|---|---|---|
| sandbox | `stera-docs.sandbox-elepay.com` | `sandbox` | `sandbox-stera-docs` | `epsandbox` |
| stg | `stera-docs.stg.elepay.dev` | `develop` | `stg-stera-docs` | `elepay-api` |
| pro | `guides.sterasmartone.com` | `master` | `stg-stera-docs-pro` | `stera-docs-pro` |

- 用途: sandbox = 对外预览 + SMCC `/admin` 操作演练 (P2, 不阻塞 10/26); stg = 开发验证 + QA 页面内容测试; pro = 正式。
- `docs-smcc.stg.elepay.dev` 已被 elepay-docs SMCC 租户占用 (`stg-base.libsonnet:244`), MUST NOT 复用。
- 三实例各自一库 (`cms.db` + `uploads/`), 内容互不同步; pro 上线后 = 唯一内容信源。

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

- [ ] sitemap / 可索引 robots 只在 pro 输出: 站点 URL 由部署配置注入 (仅 `apps/stera-docs-pro` 设), 请求 `Host` = 该 host 才可索引; 未设或 host 不符 = `noindex` + `Disallow: /`; MUST NOT 在代码硬编码域名。
- [x] 旧 ReadMe URL 301 (书签 / 外链 / 搜索结果直达新页) -> 3.1。

### 3.1 旧 URL 301

实现前 (2026-10-08): 旧 URL 一律 404 -> `not-found.tsx` 回首页; frontmatter `redirect` 只管 CMS 内已有页, 接不住旧路径。

现网 (`guides.sterasmartone.com`, ego + curl, 2026-10-08):

- 页面清单 = 现网 `/llms.txt`: `/docs/*` 79 (去重 73) + `/page/*` 1 + `/reference/*` 51; 侧边栏 / 首页链接全在其中。
- 另有 7 个 hidden 页直链 200 (`error-code` / `testing` / `cpm` / `easycheckout` / `easyqr` / `elepay-sdk-for-ios` / `開業前の…`); `/recipes/*` 现网已 404。
- [smcc-migration.md](./smcc-migration.md) 映射已覆盖以上全部; 目标页均在 seed; 51 个 operationId 均唯一对应生成页; `payment-methods-config` 锚点均为显式 id。
- ReadMe 行为: 路径大小写不敏感 (`/docs/Introduction` / `/reference/createCharge` 200); 尾 `/` 301 去掉; `/v1.0/*` 302 去前缀; `/docs/<slug>.md` / `/reference/<id>.md` 200; query 不影响。

方案:

- [x] 实现点 `middleware.ts`: `createI18nMiddleware` 之前查表, 命中 -> `NextResponse.redirect(…, 301)`; 未命中交给 i18n 原逻辑。
- [x] 映射表落 `lib/legacy-redirects.ts` = 单一信源 (`smcc-migration.md` 表已删, 改 link); 现网 URL 快照 `tests/fixtures/readme-urls.txt` (139 条)。
- [x] 查表 key 归一化: percent-decode (非法编码 -> 不命中) -> 小写 -> 去尾 `/` -> 去 `/v1.0` 前缀 -> 去 `.md` 后缀并记标记; 另做 NFC (日文浊音 NFD 编码)。
- [x] 目标: 无语言前缀 (旧站只有 ja, `hideLocale: 'always'` -> ja); 保留 query; `.md` 请求 -> 目标 `.md` 且去 fragment; 目标带 `#anchor` 时写入 `Location`, 否则浏览器沿用原 fragment。
- [x] `/reference/<operationid>`: 51 条静态列出 -> `/openapi/<tag>/<operationId>` (大小写按生成页); 测试断言与 `openapi.yaml` operationId 全集一致, 防 API 变更后漂移。

边界 (逐条入表 + 测试):

- [x] `/` / `/llms.txt`: 不跳 (新站同路径即对应页)。
- [x] `/docs` / `/docs/` / `/v1.0/docs` -> `/smcc/guide/stera-smart-one-app-manual` (现网 `/docs` 301 到侧边栏首页 `加盟店申請マニュアル`)。
- [x] `/reference` / `/reference/` / `/v1.0/reference` -> `/openapi`。
- [x] `/reference/<tag>` 分类页 -> 现网同款首个 operation: `charge` -> `/openapi/charge/listCharges` / `refund` -> `/openapi/refund/listChargesRefunds` / `customer` -> `/openapi/customer/listCustomers` / `code` -> `/openapi/code/createCode` / `codesetting` -> `/openapi/codesetting/listCodePaymentMethods` / `paymentmethod` -> `/openapi/paymentmethod/listPaymentMethods` / `location` -> `/openapi/location/listChargeLocations` / `terminal` -> `/openapi/terminal/listLocations` / `invoice` -> `/openapi/invoice/listInvoices` / `dispute` -> `/openapi/dispute/listDisputes` / `subscription` -> `/openapi/subscription/listSubscriptions`。
- [x] `/reference/*` 其余 -> `/openapi`; `/docs/*` 其余 -> 不跳, 走现有 404 -> 首页。
- [x] `/v1.0` -> `/`; `/page` -> `/`; `/page/クイックスタートガイド` 按表。
- [x] `/recipes/*` 3 条按表保留 (旧正文 / 外链可能引用), `/recipes` 本身不跳。
- [x] MUST NOT 通配 `/docs/*`: `public/docs/*.png` 等图片同前缀; 只做精确查表, matcher 现有图片排除保持不变。
- [x] MUST NOT 跳 `/ja` `/en` `/zh` 前缀路径 (新站自身 URL)。

验证:

- [x] `tests/legacy-redirects.test.ts`: 现网快照 139 条 (`llms.txt` 去重 125 + 侧边栏 / hidden 直链 14) 全部落实页 + 上述边界 -> 期望 `Location`; 目标不再命中旧表 (防链式跳转); 每个目标存在于 seed / 生成页; 大小写 / 尾 `/` / `/v1.0` / `.md` / percent-encoded / query 变体。
- [x] `scripts/verify-cms-http.ts`: 同一清单经 Docker 实测 301 + `Location`, 跟随后 200 + 锚点 id 存在; 尾 `/` = Next 先 308 去尾再 301 (2 跳)。
- [ ] stg 验收: 切域名前在 `stera-docs.stg.elepay.dev` 跑同一清单 (6 外部验收复用)。
- 风险: 301 被浏览器长期缓存, 错映射上线后难撤回 -> 切域名前 MUST 全量验证通过。
- 风险: `/admin` 改目标页 slug -> 跳转落 404 -> 首页; 改 slug 须同步 `lib/legacy-redirects.ts`。

## 4. EKS 部署 (P1, 先例 `oneqr-ai-svc` + `oneqr-ai-svc-pro`)

ele-argocd-app 跨团队 PR, 须维护方 review (ele-dispatcher 为全公司共用入口)。

- [ ] 分支: 自 develop 建 `sandbox` 分支; `workflow.md` 补分支 -> 环境映射。
- [ ] stera-docs CI `docker-build.yml` (照 `oneqr-ai-svc/.github/workflows/docker-publish.yml`):
  - 触发 `branches: [sandbox, develop, master]`; 环境用 `determine-environment` reusable workflow。
  - 镜像名: master = `stera-docs-pro`, 其他 = `stera-docs`; `deploy-docker` step 同名 (`pat_token: secrets.DEPLOY_PAT_TOKEN`, 先确认 org secret 对本 repo 可见)。
  - 删 digest summary + 顶部 ele-iac 注释。
- [ ] `apps/stera-docs/` (sandbox / stg 共用, 照 `apps/oneqr-ai-svc`):
  - `image: e.getImageTag(env, 'stera-docs')`; namespace 不覆写 = common (`epsandbox` / `elepay-api`)。
  - 端口 3000 -> Service 80。
  - PVC `ebs-stg` 5Gi 挂 `/app/data`; `fsGroup: 1001` (`Dockerfile` 的 `nextjs`), 否则空卷首启建库 EACCES。
  - `replicas: 1` + `strategy: Recreate`; MUST NOT 扩副本 (SQLite 单写)。
  - readiness / liveness = `/api/health`。
- [ ] `apps/stera-docs-pro/` (照 `apps/oneqr-ai-svc-pro`): `image: e.getImageTag('pro', 'stera-docs-pro')`; namespace `stera-docs-pro` (`apps/system` 建); 站点 URL = `https://guides.sterasmartone.com` (见 3); 其余同 `apps/stera-docs`。
- [ ] 注册: `sandbox.jsonnet` / `stg.jsonnet` 加 `stera-docs` (`automated: true`); `stg.jsonnet` 加 `stg-stera-docs-pro` (`automated: false` -> 生产发版 = ArgoCD 手动 sync, 发布闸门)。
- [ ] `versions.json`: sandbox / stg 加 `stera-docs`, pro 加 `stera-docs-pro` (首次构建自动写入亦可)。
- [ ] dispatcher 路由:
  - `sandbox-base.libsonnet`: `stera-docs.sandbox-elepay.com` -> `stera-docs.epsandbox.svc.cluster.local`; `config.libsonnet` baseConfig `dnsHostnames` 加该 host。
  - `stg-base.libsonnet`: `stera-docs.stg.elepay.dev` -> `stera-docs.elepay-api.svc.cluster.local`; stg `dnsHostnames` 加该 host (同 `docs-smcc`)。
  - `stg-base.libsonnet`: `guides.sterasmartone.com` -> `stera-docs-pro.stera-docs-pro.svc.cluster.local`; 不加 `dnsHostnames` (external-dns 不管该 zone)。
- [ ] 备份 (pro PVC 必须; sandbox / stg 不做): 先查 stg 账号有无 EBS 快照策略 (DLM); 无则补 (ele-iac stg stack, 人工 `pulumi up`) 按 PVC 卷打快照, 保留 >= 7 天; 做一次恢复演练 (快照 -> 新 PV -> 起 Pod -> 正文 / 上传图片在)。
- 验收: 各实例空卷首启自动灌 seed; 删 Pod 重建后正文与上传图片保留; 经 `stera-docs.stg.elepay.dev` `/admin` 可登录编辑上传。
- MUST: 空卷首启会建固定初始管理员 (`lib/auth/guard.ts`), 首个登录者即可改密接管; dispatcher 白名单 `dryRun` 不拦截 -> 每个实例每次空卷首启 (含删 PVC 重建) 后先经 `kubectl port-forward` 完成首次登录改密, 再开放 dispatcher 路由; 路由已开放时重建 PVC 须先撤路由。
- pro 首启早于 2 完成时库内是旧内容: SMCC 开始编辑前可删 PVC 重新首启, 之后只能定向 upsert。
- 发版即短暂中断 (`Recreate`): 前台与 `/admin` 均不可用至新 Pod ready; pro 避开 SMCC 编辑时段。

## 5. 公网链路 (P1, 先例 `dashboard.sterasmartone.com`)

- [ ] 经 stg 实例确认 dispatcher 回源保留原始 `Host`; 不保留则:
  - canonical / OG / `llms.txt` 绝对 URL 写成 svc 名 (应用按 `Host` 生成, `lib/request.ts`)。
  - `/admin` Server Action 的 Origin / Host 校验不一致 -> 保存失败。
- [ ] 切域名前降 TTL: `guides` 现 CNAME `ssl.readmessl.com` TTL 调低 (如 60s), 便于回退。
- 验收 (切域名前): 经 `stera-docs.stg.elepay.dev` 首页 / `.md` / `llms.txt` 绝对 URL = 该 host; `/admin` 登录、编辑、上传图片成功; pro 实例只能经 `kubectl port-forward` 验证 (`guides` 证书须 DNS 切换后签发)。
- 风险: `guides` 证书只能在 DNS 切换后按需签发 -> 切换后首个请求起数秒 TLS 可能失败; 切后立即 `curl -vI` 核对 issuer。

## 6. 上线 (P2, 10/26, 需明确发布指令)

- [ ] QA 页面内容测试: 在 `stera-docs.stg.elepay.dev` 上逐页核对正文 / 导航 / 图片 / 内链 / 三语言, 问题修完再切域名。
- [ ] Route53 (AWS 控制台): `guides.sterasmartone.com` 从 CNAME `ssl.readmessl.com` 改为 CNAME -> `docs.elepay.io` (stg dispatcher NLB, 同 `dashboard` -> `dashboard.elepay.io` 做法)。
- [ ] 外部验收: 证书 issuer = Google Trust Services; 首页 / 正文 / API / 搜索 / `.md` / `llms.txt` / 图片 / 旧 URL 跳转 / `/admin` 登录编辑 / robots 可索引 + sitemap。
- [ ] 上线后 pro 实例 CMS = 唯一内容信源, seed 只用于空库初始化。

## SMCC 已确认 (2026-10-07)

- 10/26 上线, 前置工作与 QA 全部此前完成。
- UI 排版无意见, 沿用现有设计。
- Chatbot 本期不做。

## 持续

- elepay-docs / `elepay-charge-api` 的 API / Webhook / SDK 事实修正按 v0.2.1 方式同步 (见 `CHANGELOG.dev.md`)。
- Chatbot (将来若做): 先建 stera smart one 独立知识源再接入, MUST NOT 复用 elepay 知识库。

下一步: 3.1 旧 URL 301; 4 (stg + pro) / 5 可并行; sandbox 实例排在 10/26 之后亦可。
