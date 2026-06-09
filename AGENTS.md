# AGENTS

elepay / SMCC multi-tenant documentation site (Next 16 + Fumadocs + Cloudflare Workers). Project overview -> [README.md](./README.md); deployment -> [deploy.md](./deploy.md); doc authoring -> [llm-doc-style.md](./llm-doc-style.md).

## Workflow (fully autonomous AI loop)

- The AI makes the optimal calls on its own, completes the work (doc edits & coding) & preview-deploy verification. Release (version bump + dual CHANGELOG, flow -> [release.md](./release.md)) is user-triggered only — AI MUST NOT start it on its own. For non-blocking issues, MUST NOT ask the human back.
  - Entirely AI-driven, no human intervention required.
  - MUST NOT verify/accept via localhost preview; for preview deployment see -> [deploy.md](./deploy.md).
  - Design decisions (architecture / tech selection / naming / dependencies) are the AI's call; unless necessary, MUST NOT ask back. The user = final acceptor.

## Hard constraints

- MUST NOT directly edit generated artifacts: `.source/**` / `content/docs/openapi/(generated)/**` / `data/**` / `.next/**` / `.open-next/**` / `out/**` / `cloudflare-env.d.ts` / `next-env.d.ts`.
- After changing `openapi.yaml` (or `.en` / `.zh`), MUST run `bun run generate:data` to refresh; a freshly cloned repo MUST run `generate:data` before `dev` / `build`.
- When an mdx path changes, sync related mdx references and `lib/legacy-redirects.mjs`.
- When changing navigation / ordering, MUST sync every language's `meta.[lang].json` (ja / en / zh), otherwise the menu goes missing or ends up out of order.
- Multi-language naming: `index.mdx` (default ja) / `index.en.mdx` / `index.zh.mdx`; a missing language falls back to `index.mdx`.
- **i18n does not go through the URL**: `hideLocale: 'always'` (`lib/i18n.ts`) keeps the public URL free of any locale prefix; the language is decided by cookie (set by middleware). When referencing / constructing in-site URLs, MUST NOT add `/ja` `/en` `/zh` (use `/docs/xxx`, not `/en/docs/xxx`). The source's `app/[lang]` segment and content files `index.[lang].mdx` are internal / file-level locale and do not map to the URL.
- Import via the aliases `@/*` / `@/.source`; avoid relative-path traversal.
- Git: MUST NOT write to the staging area; commit / push only when explicitly authorized in the session. Exception: the user-triggered release flow lets AI `git add` + commit (push stays with the user; no tag) -> [release.md](./release.md).

## Fumadocs

- Page conventions: in `meta*.json` `pages`, page/folder = `path`; link = `[Icon][Text](url)`, e.g. `"[x][x](../openapi)"`; external link = `external:[Icon][Text](url)`;
- Fumadocs docs: https://www.fumadocs.dev/docs

## Doc constraints

- MUST be concise and to the point, with zero redundancy; for authoring rules see -> [llm-doc-style.md](./llm-doc-style.md), and review against its "anti-patterns" section.
- Single source of truth: reference across docs via links, MUST NOT restate facts.
- MUST NOT use `<!-- prettier-ignore -->` for markdown table tags
