# 国际化自动化指南

## 目标

1. 翻译能力具有非常高的质量，公司用于对外输出
2. 不同语言的翻译结果能通过【交叉验证】
3. 理解【业务术语】，不进行过于牵强的翻译
4. 增量翻译，避免全量翻译带来的巨大差异
5. 自动化操作目标文件和文件夹

## 技术调研

1. AI 翻译已经非常成熟，其中 ChatGPT High Model 具有最高的翻译质量
2. IDE 具有完善的 tools 能力，可以用来自动化的完成：

- 国际化文件检索、创建、内容更新
- 对接 Git，通过 diff 完成增量翻译

## 技术方案

通过 [Codex](https://github.com/openai/codex) 实现国际化翻译能力。

1. 公司提供账号
2. 具有完善的 IDE tools 支持

## 操作指南

### 环境搭建

1. 安装 Codex。
2. 创建 Codex Command。创建`~/.codex/prompts/translate.md`文件，将[提示词](./prompt.md)拷贝进去。
3. 完成 1 & 2，就可以正常通过 Codex 使用 `/prompts:translate` 指令了。

### 使用

#### TLDR:

1. 文件支持【全量翻译】&【增量翻译】：`/prompts:translate PATH="content/docs/index.en.mdx"`
2. 文件夹支持【全量翻译】：`/prompts:translate PATH="content/docs"`

#### Codex Command 如何使用

1. 在终端中打开项目根目录，键入 `Codex` 后进入 `Vibe code` 模式
2. 键入 `/` 字符后可检索过滤到 `prompts:translate` 命令，通过 tab 选择该命令

- 此时在输入窗口中已经有完整的指令信息：`> /prompts:translate PATH=""`

3. 键入 `@` 字符后可检索过滤目标文件和文件夹
4. 等待翻译完成

- 自动识别文件翻译 & 文件夹翻译
- 自动识别【全量翻译】&【增量翻译】

> 通过 `/model` 选择 `gpt-5` - `High` 模型，该模型具有最高的翻译质量（速度较慢）。

#### 文件夹【全量翻译】

会递归检索提供的 path 下所有的 `md/mdx`文件，并将翻译结果输出到各自的国际化文件中。示例：
输入 `/prompts:translate PATH="content/docs"`。结果：

1. 识别 docs 及其 sub directory 下的所有 `md/mdx`文件的语言类型，并翻译成其他多语言版本。
2. 自动创建其他多语言版本文件，如：
   - `content/docs/index.mdx`（假设已经存在）
   - `content/docs/index.zh.mdx`（自动创建）
   - `content/docs/index.en.mdx`（自动创建）

> 注意事项：
>
> 1. 文件夹翻译，只支持全量翻译，不会识别个别文件的增量内容修改（此时应该使用文件的增量翻译）。
> 2. 文件夹翻译应当仅在一个文件夹有较多初始化内容的场景使用。比如新增了一个业务线（新文件夹），此时进行初始阶段的批量翻译。

#### 文件【全量翻译】&【增量翻译】

会主动识别文件的语言类型，并将翻译结果输出到其他国际化文件中。

1. 全量和增量的检测口径：会检索当前提供的文件是否已经存在其他国际化文件。

- 如果存在，则进行增量翻译
- 如果不存在，则进行全量翻译
