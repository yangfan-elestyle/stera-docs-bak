# md 编写指南

高密度原则; 根目录所有 md (`AGENTS` / `README` / `deploy` / `CHANGELOG` 及本文) MUST 符合本指南。

## 分层 (单一信源, 互引不复述)

<!-- prettier-ignore -->
| 文件 | 内容 |
|---|---|
| `AGENTS.md` | LLM 约束 / 工作模式 / 硬规则 (`CLAUDE.md` 软链至此) |
| `README.md` | 工程总览 / 结构 / 命令 / 架构说明 |
| `deploy.md` | 发布流程 (人执行) |
| `CHANGELOG.md` | 面向使用者的发版记录 |
| `llm-doc-style.md` | 本文: md 写作元规范 |

跨文档用 `[xxx.md](./xxx.md)` 引用, MUST NOT 复述事实。

## 通用风格

- 能一行不写两行, 能列表不写段落
- 短句; 用 `->` `/` `+` 替连接词
- 强度词: MUST / MUST NOT / SHOULD
- 短并列项 (≤12 中文/单元格) 用表格; 表格前紧贴 `<!-- prettier-ignore -->`
- 长并列点用列表
- CommonMark/GFM; MUST NOT Obsidian 语法 / HTML 折叠
- 中文行文; 命令 / 术语 / 报错保留原文

## 代码块

- 所有 fenced code MUST 指定语言, MUST NOT 出现无语言标识的代码块
- 支持 Shiki: `ts` `js` `tsx` `jsx` `vue` `json` `html` `css` `sh` `bash` `shell` `yaml` `xml` `md` `java` `kotlin` `swift` `php` `ruby` `python` `go` `cpp` `c` `cs` `rust` `dart` `sql` 等
- 命令块注释贴 `#` 同行

## AGENTS.md

- 只写 LLM 约束, MUST NOT 写工程说明 (结构 / 命令 / 拓扑 -> README)
- 首段一行角色定位 + link 到 README / deploy / 本文
- 必含: 工作模式 (AI 全程闭环, 含本地预览部署 -> 个人 CF; 公司发布走 Actions) / 硬约束 / 文档约束
- `CLAUDE.md` 是本文件软链, 改 `AGENTS.md` 即同步

## README.md

- 首段一行价值主张, MUST NOT 带 LLM 提示
- 站点能力 / 命令 / 决済方式用表格
- 命令块 fenced + `#` 注释同行
- 部署细节抽到 `deploy.md`, 此处仅 link
- 生成文件 / 架构注意点集中一处, MUST NOT 散落

## deploy.md

- 顶部一行点明两条路径: 本地预览 (AI) / 公司发布 (Actions)
- 本地预览部署: AI 用本地 `wrangler` (个人账号) -> 个人 CF, 命令 ≤ 3 行
- 公司发布: TL;DR ≤ 4 行 + 触发规则表 (改动 -> PR -> staging -> master -> product)
- 凭证仅在 GitHub Secrets / 禁直推 `master`·`develop`; 高危操作用 `>` 引用块标禁用条件

## CHANGELOG.md (Keep a Changelog + SemVer)

- **面向使用者**, 写他们感受得到的事
- 写: 新功能 / 文档新增 / 行为修复 / 体验 / 安全
- MUST NOT 写: 文件路径 / 函数名 / 组件名 / 依赖包名 / 重构细节 / "改了哪行"
- 单条 ≤ 2 行, 单版本 ≤ 5 条
- 段落: Added / Changed / Fixed / Removed / Security
- 中文行文; 命令 / 术语保留原文

## 反模式 (审稿时优先抓)

- 段落式描述 -> 拆列表
- 同一事实两个文件各写一遍 -> 留一处 + link
- AGENTS 塞工程结构 / 命令 / 文件清单 -> 抽到 README
- CHANGELOG 写"改了哪个文件 / 组件 / 依赖" -> 改写"用户看到什么变化"
- 表格单元格塞长句 -> 改列表
- fenced code 不写语言 -> 补语言标识
