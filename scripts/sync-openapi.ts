import { rename, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const REPO = 'elepay-io/elepay-charge-api';
const SOURCE_PATH = 'client/elepay-client-sdk.yaml';
const TARGET = resolve('openapi.yaml');
const SKILL_PATH = resolve('.claude/skills/translate/SKILL.md');

const argv = Bun.argv.slice(2);
const enableTranslate = argv.includes('--translate');

const raw = await ghRaw(`/repos/${REPO}/contents/${SOURCE_PATH}`);

const firstLine = raw.split('\n', 1)[0] ?? '';
if (!/^openapi:\s*3\./.test(firstLine)) {
  throw new Error(
    `抓取内容首行不是 OpenAPI spec: ${JSON.stringify(firstLine)}`,
  );
}
if (raw.length < 50_000) {
  throw new Error(
    `抓取内容过短 (${raw.length} bytes), 疑似抓到错误页面`,
  );
}

const { yaml, addedTags } = patchMissingTopLevelTags(raw);
if (addedTags.length) {
  console.log(`补完顶层 tags: ${addedTags.join(', ')}`);
} else {
  console.log('顶层 tags 已完整, 无需 patch');
}

const meta = await fetchLatestCommit().catch((err) => {
  console.warn(`[warn] 取最新 commit 元数据失败: ${(err as Error).message}`);
  return null;
});

const tmp = `${TARGET}.tmp`;
await writeFile(tmp, yaml, 'utf8');
await rename(tmp, TARGET);

console.log(`源: github:${REPO}/${SOURCE_PATH}`);
if (meta) {
  console.log(`源 commit: ${meta.sha.slice(0, 12)}  ${meta.date}  ${meta.message}`);
}
console.log(`目标: ${TARGET}`);
console.log(`版本: ${firstLine}`);
console.log(`大小: ${yaml.length} bytes / ${yaml.split('\n').length} 行`);

if (enableTranslate) {
  await runClaudeTranslate();
} else {
  console.log('\n提示: 加 --translate 可在同步后自动调用 claude --bare -p 翻译 en/zh');
}

function patchMissingTopLevelTags(input: string): {
  yaml: string;
  addedTags: string[];
} {
  const parsed = Bun.YAML.parse(input) as {
    tags?: Array<{ name: string }>;
    paths?: Record<string, Record<string, { tags?: string[] } | unknown>>;
  };

  const declared = new Set<string>(
    (parsed.tags ?? []).map((t) => t.name).filter(Boolean),
  );
  const used = new Set<string>();
  for (const pathItem of Object.values(parsed.paths ?? {})) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    for (const op of Object.values(pathItem)) {
      if (op && typeof op === 'object' && Array.isArray((op as any).tags)) {
        for (const t of (op as any).tags as unknown[]) {
          if (typeof t === 'string') used.add(t);
        }
      }
    }
  }
  const missing = [...used].filter((t) => !declared.has(t)).sort();
  if (missing.length === 0) return { yaml: input, addedTags: [] };

  const lines = input.split('\n');
  const tagsLine = lines.findIndex((l) => /^tags:\s*$/.test(l));
  if (tagsLine < 0) {
    throw new Error('未找到顶层 `tags:` 段, 无法补完缺失 tag');
  }
  let end = tagsLine + 1;
  while (end < lines.length && !/^[A-Za-z]/.test(lines[end] ?? '')) end++;
  lines.splice(end, 0, ...missing.map((n) => `  - name: ${n}`));
  return { yaml: lines.join('\n'), addedTags: missing };
}

async function ghRaw(path: string): Promise<string> {
  const proc = Bun.spawn(
    ['gh', 'api', '-H', 'Accept: application/vnd.github.raw', path],
    { stdout: 'pipe', stderr: 'pipe' },
  );
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) {
    throw new Error(
      `gh api ${path} 退出码 ${code}: ${stderr.trim() || stdout.trim()}`,
    );
  }
  return stdout;
}

async function runClaudeTranslate(): Promise<void> {
  await stat(SKILL_PATH).catch(() => {
    throw new Error(`SKILL.md 不存在: ${SKILL_PATH}`);
  });

  const which = Bun.spawnSync(['which', 'claude']);
  if (which.exitCode !== 0) {
    throw new Error('PATH 中找不到 claude 命令; 跳过翻译');
  }

  const prompt = [
    '路径 `$PATH` 的实际值为: `openapi.yaml`',
    '',
    '请按上述 system prompt (SKILL.md) 中描述的 Workflow 执行翻译任务:',
    '- 识别源语言为日文 (ja, 文件名无 .en/.zh 标识)',
    '- 自动判定全量或增量模式 (基于同目录 openapi.en.yaml / openapi.zh.yaml 是否已存在)',
    '- 严格遵守 Constraints 中的 OpenAPI YAML 输入特化规则: 仅翻译自然语言字段, 不动 key/path/method/$ref/enum/数据样本/缩进/字段顺序',
    '- 写入或更新: openapi.en.yaml 与 openapi.zh.yaml',
  ].join('\n');

  const allowedTools = [
    'Read',
    'Write',
    'Edit',
    'Glob',
    'Bash(git diff *)',
    'Bash(git log *)',
    'Bash(git show *)',
    'Bash(git status *)',
  ].join(',');

  console.log('\n触发翻译: claude -p ...');
  console.log(`SKILL: ${SKILL_PATH}`);

  const proc = Bun.spawn(
    [
      'claude',
      '-p',
      prompt,
      '--append-system-prompt-file',
      SKILL_PATH,
      '--allowedTools',
      allowedTools,
    ],
    { stdout: 'inherit', stderr: 'inherit' },
  );
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(
      `claude -p 退出码 ${code}。若提示 "Not logged in", 先跑 \`claude\` 交互登录后重试。`,
    );
  }
  console.log('翻译完成: openapi.en.yaml / openapi.zh.yaml');
}

async function fetchLatestCommit(): Promise<{
  sha: string;
  date: string;
  message: string;
}> {
  const raw = await ghRaw(
    `/repos/${REPO}/commits?path=${encodeURIComponent(SOURCE_PATH)}&per_page=1`,
  );
  const arr = JSON.parse(raw) as Array<{
    sha: string;
    commit: { author: { date: string }; message: string };
  }>;
  if (!arr.length) throw new Error('commit 列表为空');
  const c = arr[0];
  return {
    sha: c.sha,
    date: c.commit.author.date,
    message: c.commit.message.split('\n', 1)[0] ?? '',
  };
}
