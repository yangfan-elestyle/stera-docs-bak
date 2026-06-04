# elepay Docs

A unified public documentation site for elepay and the business line stera smart one (SMCC): multi-language (Japanese / English / Simplified Chinese), multi-tenant (routed by domain), deployed on Cloudflare Workers. One codebase replaces the two existing readme.io sites, serving the matching business based on the visited domain.

<!-- prettier-ignore -->
| Business | dev (configure host) | staging | prod |
|---|---|---|---|
| elepay | <http://docs.stg.elepay.localhost:3000> | <https://staging-elepay-docs.elestyle.workers.dev> | <https://developer.elepay.io> |
| SMCC | <http://docs-smcc.stg.elepay.localhost:3000> | <https://staging-smcc-elepay-docs.elestyle.workers.dev> | <https://guides.sterasmartone.com> (not yet live) |

## Features

- Multi-language Docs & API Reference (Japanese / English / Simplified Chinese)
- Switches between elepay / SMCC by domain, sharing one copy of common content
- Full-text search (Japanese / Chinese tokenization)
- AI entry points: in-site assistant, LLM Markdown, `llms.txt` / `llms-full.txt`
- Error codes pulled live from the backend, falling back to a built-in snapshot on failure

## Tech stack

Next.js 16 (App Router) + Fumadocs + React 19 + Tailwind CSS 4 + TypeScript + Bun. Deployment: Cloudflare Workers + OpenNext + Wrangler 4.

## Quick start

```bash
export GH_PACKAGES_TOKEN=<your_github_pat>      # to pull private deps @elepay-io/*, a GitHub PAT with read scope
bun install                                     # postinstall runs fumadocs-mdx to generate .source/
bun run generate:data                           # required after clone: generate OpenAPI JSON/MDX + error-code snapshot
bun run dev                                     # http://localhost:3000
```

## Common commands

<!-- prettier-ignore -->
| Command | Description |
|---|---|
| `bun run dev` | Local development |
| `bun run build` | Production build (run `generate:data` first) |
| `bun run generate:data` | Generate OpenAPI + error-code snapshot |
| `bun run sync:openapi` | Pull ja from the upstream private repo to overwrite, then translate en / zh |
| `bun run types:check` | Type check (`fumadocs-mdx` + `next typegen` + `tsc`) |
| `bun run cf-typegen` | Generate `cloudflare-env.d.ts` from `wrangler.jsonc` |

> `sync:openapi` requires `gh` logged in (with `repo` scope) + `claude` logged in (used for translation); for ja only, run `scripts/sync-openapi.ts` directly (drop `--translate`). After it runs and OpenAPI changes, run `generate:data` again.

## Development & deployment

> For commands see [deploy.md](./deploy.md).

- dev - local (`bun run dev`): **for developer local debugging only**; full local preview on 127.0.0.1 (after configuring host, smcc can be reached via domain)
- dev - online ([deploy.md](./deploy.md)): **the only way the AI previews and verifies**; deploy with the local Cloudflare account, then check and accept at the preview URL

## Project structure

<!-- prettier-ignore -->
| Path | Description |
|---|---|
| `app/[lang]` | App Router: routing / layout / OG / LLM entry points / search API |
| `content/docs` | Doc sources (`index.[lang].mdx` + `meta.[lang].json`) |
| `lib` | `source.ts` (loader) / `i18n.ts` / `tenant.ts` |
| `components` / `assets` / `public` | Components / assets / static files |
| `scripts` | OpenAPI generation and sync, error-code snapshot |
| `openapi*.yaml` | OpenAPI sources (ja / en / zh) |

## Architecture notes

- **CF Worker fetch**: `global_fetch_strictly_public` forbids direct connections to same-account resources; reaching same-account services must go through a service binding.
- **Host source of truth**: the request `Host` header is the sole source of truth (`lib/tenant.ts`); do not rely on `X-Forwarded-*`.
