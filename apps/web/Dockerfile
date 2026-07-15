FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@11.13.0 --activate

FROM base AS build
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
COPY apps/web ./apps/web

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_AUTH_URL
ARG NEXT_PUBLIC_APP_BUILD_ID

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_GOOGLE_AUTH_URL=${NEXT_PUBLIC_GOOGLE_AUTH_URL}
ENV NEXT_PUBLIC_APP_BUILD_ID=${NEXT_PUBLIC_APP_BUILD_ID}

RUN pnpm install --frozen-lockfile --filter @sokil/web...
RUN pnpm --filter @sokil/shared-types build
RUN pnpm --filter @sokil/web build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
WORKDIR /app/apps/web

EXPOSE 3001

CMD ["node", "server.js"]
