# syntax=docker/dockerfile:1

# deps: 仅解析依赖。全部来自公共 registry, 无需 token。
FROM oven/bun:1.4.2-slim AS deps
WORKDIR /app

# postinstall 跑 fumadocs-mdx, 需要 source.config.ts; patchedDependencies 需要 patches/。
# source.config.ts 与运行期共用 lib/content-schema.ts (一份 schema, 两条编译路径),
# esbuild 解析不到它 postinstall 会直接失败 -> 这一层必须单独带上。
COPY package.json bun.lock source.config.ts ./
COPY lib/content-schema.ts ./lib/content-schema.ts
COPY patches ./patches

RUN bun install --frozen-lockfile

# builder: 生成数据 + next build (output: 'standalone')。
FROM oven/bun:1.4.2-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

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

# 内容库落在 /app/data, 线上由持久卷挂在这里 (MUST 块存储: SQLite 的文件锁在
# NFS / EFS 上会坏库且不报错)。目录要先归 nextjs, 否则空卷首启建库直接 EACCES。
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000

# runner 镜像无 curl, 用 node 自带 fetch 探 /api/health (只验 db 可读)。
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

CMD ["node", "server.js"]
