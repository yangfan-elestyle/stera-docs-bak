FROM oven/bun AS base

FROM base AS deps

WORKDIR /app

ARG GH_PACKAGES_TOKEN
ENV GH_PACKAGES_TOKEN=${GH_PACKAGES_TOKEN}

COPY package.json bun.lock bunfig.toml source.config.ts ./
COPY ./patches ./patches
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV DOCS_ERROR_CODES_URL=https://stg-api.stg.elepay.dev/error-codes

RUN apt-get update && apt-get install -y git

RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:bun .next

COPY --from=builder --chown=nextjs:bun /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bun /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:bun /app/openapi.yaml ./openapi.yaml
COPY --from=builder --chown=nextjs:bun /app/openapi.en.yaml ./openapi.en.yaml
COPY --from=builder --chown=nextjs:bun /app/openapi.zh.yaml ./openapi.zh.yaml

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV DOCS_BASE_URL=https://docs.elepay.io:3000
ENV DOCS_ERROR_CODES_URL=https://api.elepay.io/error-codes

CMD ["bun", "server.js"]
