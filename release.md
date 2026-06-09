# Release flow

User-triggered only. AI MUST NOT start a release on its own. When the user asks for a release after accepting the feature, AI runs the steps below to bump the version and write the two CHANGELOG files.

> Preview deployment is a different flow -> [deploy.md](./deploy.md).

## TL;DR

1. Decide SemVer bump: PATCH default; new feature -> MINOR; breaking change -> MAJOR
2. `CHANGELOG.md` (user-facing) new version section + mirror to `CHANGELOG` (developer-facing, one technical sub-item per entry)
3. Sync `package.json#version`
4. AI runs `git add` + `git commit -m "release: vX.Y.Z"` (this is the only release-flow exception to the staging hard rule in [AGENTS.md](./AGENTS.md)); user runs `git push`. No tag.

## 1. Trigger

- User explicitly asks (e.g. "release", "bump version", "write the changelog and ship a new version")
- AI MUST NOT propose / start this on its own, even after a sizable feature lands or is accepted
- Until then, leave `CHANGELOG.md` / `CHANGELOG` / `package.json#version` alone

## 2. Write the version (AI)

- `CHANGELOG.md` top: insert `## [X.Y.Z] - YYYY-MM-DD` section, list user-perceivable items, append `[X.Y.Z]:` compare link at the bottom
- `CHANGELOG`: mirror the same section, append one indented sub-item per entry describing the technical change (file / function / mechanism)
- Both files MUST move together. Rules -> [llm-doc-style.md](./llm-doc-style.md)
- `package.json#version` = `X.Y.Z`

## 3. Commit (AI)

This is the only release-flow exception to the staging / commit hard rule in [AGENTS.md](./AGENTS.md). Outside release, AI MUST NOT touch staging.

```bash
git add CHANGELOG CHANGELOG.md package.json
git commit -m "release: vX.Y.Z"
```

## 4. Push (user)

```bash
git push origin <branch>
```

> No tag: the doc site has no `release.yml`, so a tag would only be an unused history anchor. AI MUST NOT push.
