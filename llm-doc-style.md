# md Authoring Guide

High-density principle; all root-level md files (`AGENTS` / `README` / `deploy` / `CHANGELOG` and this one) MUST follow this guide.

## Layering (single source of truth, cross-reference instead of restating)

<!-- prettier-ignore -->
| File | Content |
|---|---|
| `AGENTS.md` | LLM constraints / workflow / hard rules (`CLAUDE.md` symlinks here) |
| `README.md` | Project overview / structure / commands / architecture notes |
| `deploy.md` | AI preview deployment (ship to CF via wrangler) |
| `release.md` | Version / changelog (two files) release flow |
| `CHANGELOG.md` | User-facing release notes |
| `CHANGELOG` | Developer-facing: mirror of `CHANGELOG.md` + per-entry technical sub-item |
| `llm-doc-style.md` | This file: the md authoring meta-spec |

Reference across docs via `[xxx.md](./xxx.md)`, MUST NOT restate facts.

## General style

- One line beats two; a list beats a paragraph
- Short sentences; use `->` `/` `+` in place of conjunctions
- Strength words: MUST / MUST NOT / SHOULD
- Short parallel items (≤12 CJK chars / cell) use a table; place `<!-- prettier-ignore -->` immediately before the table
- Long parallel points use a list
- CommonMark/GFM; MUST NOT use Obsidian syntax / HTML collapsibles
- Prose in Chinese; keep commands / terms / error messages verbatim

## Code blocks

- Every fenced code block MUST declare a language; MUST NOT leave a code block without a language tag
- Shiki support: `ts` `js` `tsx` `jsx` `vue` `json` `html` `css` `sh` `bash` `shell` `yaml` `xml` `md` `java` `kotlin` `swift` `php` `ruby` `python` `go` `cpp` `c` `cs` `rust` `dart` `sql`, etc.
- Put command comments inline on the same line with `#`

## AGENTS.md

- Write only LLM constraints; MUST NOT write engineering notes (structure / commands / topology -> README)
- First paragraph: one-line role positioning + links to README / deploy / this file
- MUST include: workflow (fully autonomous AI loop, including wrangler preview deployment and verification) / hard constraints / doc constraints
- Git / staging safety belongs under hard constraints; commit / push requires explicit session authorization
- `CLAUDE.md` is a symlink to this file; editing `AGENTS.md` syncs it

## README.md

- First paragraph: one-line value proposition; MUST NOT carry LLM hints
- Site capabilities / commands / payment methods use tables
- Command blocks: fenced + `#` comments inline
- Deployment details are extracted to `deploy.md`; only link here
- Hard constraints on generated files link to AGENTS; architecture notes stay in one place, MUST NOT be scattered

## deploy.md

- Write only AI preview deployment: the AI uses the locally logged-in `wrangler` to ship to CF, commands ≤ 3 lines
- After `deploy` exits, take the `*.workers.dev` preview URL to verify and accept
- MUST NOT write company release / branches / Actions / Secrets (irrelevant to the LLM; source of truth is in `.github/workflows/`)

## CHANGELOG — two files (Keep a Changelog + SemVer)

`CHANGELOG.md` (user-facing) + `CHANGELOG` (developer-facing), kept in lockstep -> [release.md](./release.md).

### CHANGELOG.md (user-facing)

- Write what users can actually perceive
- Write: new features / new docs / behavior fixes / experience / security
- MUST NOT write: file paths / function names / component names / dependency package names / refactor details / "which line changed"
- ≤ 2 lines per entry, ≤ 5 entries per version
- Sections: Added / Changed / Fixed / Removed / Security
- Prose in Chinese; keep commands / terms verbatim

### CHANGELOG (developer-facing)

- Superset of `CHANGELOG.md`: mirror every entry 1:1, append one indented sub-item carrying the technical change
- Sub-items MAY name paths / functions / mechanisms (inverse of the user-facing rule); ≤ 1 line, file / function / mechanism level
- Same language as `CHANGELOG.md`

## Anti-patterns (catch these first during review)

- Paragraph-style description -> break into a list
- The same fact written in two files -> keep one + link
- AGENTS stuffed with engineering structure / commands / file lists -> extract to README
- CHANGELOG saying "which file / component / dependency changed" -> rewrite as "what the user sees change"
- Table cells stuffed with long sentences -> switch to a list
- Fenced code with no language -> add the language tag
