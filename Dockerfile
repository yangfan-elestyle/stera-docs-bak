# syntax=docker/dockerfile:1

# deps: 仅解析依赖。GH_PACKAGES_TOKEN 走 BuildKit secret, 不落任何镜像层。
FROM oven/bun:1.4.2-slim AS deps
WORKDIR /app

# postinstall 跑 fumadocs-mdx, 需要 source.config.ts; patchedDependencies 需要 patches/。
# source.config.ts 与运行期共用 lib/content-schema.ts (一份 schema, 两条编译路径),
# esbuild 解析不到它 postinstall 会直接失败 -> 这一层必须单独带上。
COPY package.json bun.lock bunfig.toml source.config.ts ./
COPY lib/content-schema.ts ./lib/content-schema.ts
COPY patches ./patches

RUN --mount=type=secret,id=gh_packages_token \
    GH_PACKAGES_TOKEN="$(cat /run/secrets/gh_packages_token 2>/dev/null || true)" \
    bun install --frozen-lockfile

# builder: 生成数据 + next build (output: 'standalone')。
FROM oven/bun:1.4.2-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# DOCS_ENV 是构建期参数: next.config.mjs 的 `env` 把它内联进产物
# (非 product 时输出 <meta name="docs-env">)。运行期覆盖无效 -> 每环境一份镜像。
ARG DOCS_ENV=staging
ENV DOCS_ENV=${DOCS_ENV}
ENV NEXT_TELEMETRY_DISABLED=1

# data/ 与 content/docs/openapi/(generated)/ 未入库, 不生成则 next build 直接失败。
RUN bun run generate:data && bun run build

# runner: Next standalone 面向 Node 运行时。
FROM node:24.18.0-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# standalone 不含 public/ 与 .next/static/, 必须显式复制。
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 手写内容在运行期读取 (lib/cms), 不进构建产物 -> 必须单独复制进 runner。
COPY --from=builder --chown=nextjs:nodejs /app/seed ./seed

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
