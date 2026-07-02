FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
RUN pnpm install  --filter @sokil/api...
RUN pnpm --filter @sokil/shared-types build

COPY apps/api ./apps/api
RUN pnpm --filter @sokil/api build

FROM node:22-alpine AS runner
WORKDIR /app/apps/api

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/apps/api/tsconfig.json ./
COPY --from=build /app/apps/api/mikro-orm.config.ts ./
COPY --from=build /app/apps/api/src ./src
COPY --from=build /app/packages/shared-configs /app/packages/shared-configs

RUN mkdir -p uploads/images/avatars uploads/images/banners uploads/attachments pdf/rules

CMD ["node", "dist/src/main.js"]
