FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

# ---- deps ----
FROM base AS deps
WORKDIR /app

# better-sqlite3 needs native build tools
RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile

# ---- builder ----
FROM base AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate migrations then build
RUN pnpm db:generate && pnpm build

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache python3 make g++ && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone Next.js output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Drizzle migrations (generated during build)
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# node_modules for runtime (better-sqlite3 needs native module)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Entrypoint
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# SQLite data directory — mount a persistent volume here in Coolify at /app/data
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
