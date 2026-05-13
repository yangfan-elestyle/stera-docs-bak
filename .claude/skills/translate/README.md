# Translate Skill — 国际化文档自动翻译

把 `.md` / `.mdx` 或 OpenAPI YAML（`.yaml` / `.yml`）文件或整个目录翻译为日文（ja）、英文（en）、简体中文（zh）三个版本，并保留所有原始格式（Markdown 含空格空行/代码块；YAML 含缩进/key/$ref/enum/数据样本，仅翻译 description/summary/title 等自然语言字段）。自动识别源语言、按需走全量或增量模式，金融与支付术语优先。

> 详细的执行指令（喂给 Claude 的 prompt）见同目录 [SKILL.md](SKILL.md)。

## 目标

1. 翻译能力具有非常高的质量，公司用于对外输出
2. 不同语言的翻译结果能通过【交叉验证】
3. 理解【业务术语】，不进行过于牵强的翻译
4. 增量翻译，避免全量翻译带来的巨大差异
5. 自动化操作目标文件和文件夹

## 技术调研

1. AI 翻译已经非常成熟，主流大模型（Claude Opus、GPT-5 等）翻译质量足够商用
2. IDE/CLI 的 tools 能力可自动化完成：

- 国际化文件检索、创建、内容更新
- 对接 Git，通过 `git diff` 完成增量翻译

## 环境搭建

Skill 已纳入仓库 `.claude/skills/translate/`，git clone 后由 Claude Code 自动加载，无需个人配置。

> 仅需 [安装 Claude Code](https://docs.claude.com/en/docs/claude-code/setup) 并在项目根目录运行 `claude`。

## 使用

### TLDR

1. 文件【全量】&【增量】翻译：`/translate content/docs/index.en.mdx` 或 `/translate openapi.yaml`
2. 文件夹【全量】翻译：`/translate content/docs`

### Claude Code Skill 如何使用

1. 在项目根目录运行 `claude` 启动会话
2. 键入 `/`，候选中选择 `translate`（Tab 补全）
3. 紧跟路径作为参数（不再需要 `PATH=` 前缀），可用 `@` 检索文件 / 目录
4. 等待翻译完成

- 自动识别文件 vs 文件夹模式
- 文件模式自动识别【全量】vs【增量】（依据是否已存在其他语言版本）
- 已设 `disable-model-invocation: true`，仅显式 `/translate` 触发，模型不会自动调用
- 工具权限通过 `allowed-tools` 预授权 `git diff`/`log`/`show`/`status` 与文件读写，免重复确认

> 通过 `/model` 切换至 Opus 系列以获得最佳翻译质量。

### 文件夹【全量翻译】

会递归检索提供的 path 下所有的 `md/mdx` 文件，并将翻译结果输出到各自的国际化文件中。示例：

输入 `/translate content/docs`。结果：

1. 识别 docs 及其 sub directory 下的所有 `md/mdx` 文件的语言类型，并翻译成其他多语言版本。
2. 自动创建其他多语言版本文件，如：
   - `content/docs/index.mdx`（假设已经存在）
   - `content/docs/index.zh.mdx`（自动创建）
   - `content/docs/index.en.mdx`（自动创建）

> 注意事项：
>
> 1. 文件夹翻译只支持全量翻译，不会识别个别文件的增量内容修改（增量场景应使用文件翻译）。
> 2. 文件夹翻译应当仅在一个文件夹有较多初始化内容的场景使用。比如新增了一个业务线（新文件夹），此时进行初始阶段的批量翻译。

### 文件【全量翻译】&【增量翻译】

会主动识别文件的语言类型，并将翻译结果输出到其他国际化文件中。

全量与增量的检测口径：会检索当前提供的文件是否已经存在其他国际化文件。

- 如果存在，则进行增量翻译（基于 `git diff` 仅翻译变更段）
- 如果不存在，则进行全量翻译

## 详细行为与约束

完整的 Role / Workflow / Constraints / OutputFormat 见 [SKILL.md](SKILL.md)。修改 skill 行为请直接编辑该文件。
