# ---------- base deps ----------
FROM node:20-alpine AS deps
WORKDIR /app

# bcrypt toolchain + OpenSSL libs
RUN apk add --no-cache python3 make g++ \
  openssl libcrypto3 libssl3

RUN corepack disable && npm i -g yarn@1

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

# ---------- build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# OpenSSL libs aqui também, porque rodamos `yarn prisma generate`
RUN apk add --no-cache openssl libcrypto3 libssl3
RUN corepack disable && npm i -g yarn@1

COPY package.json ./
COPY yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig*.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

RUN yarn prisma generate
RUN yarn build

# ---------- runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# OpenSSL libs no runtime (migrate deploy + runtime do Prisma)
RUN apk add --no-cache openssl libcrypto3 libssl3
RUN corepack disable && npm i -g yarn@1

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production=false --frozen-lockfile
RUN yarn add ts-node typescript --ignore-engines

COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY prisma ./prisma
COPY --from=builder /app/dist ./dist

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://localhost:3000/health | grep -q '"status":"ok"' || exit 1
EXPOSE 3000

CMD sh -c 'yarn prisma migrate deploy \
  && if [ "$RUN_SEED" = "true" ] || [ "$RUN_SEED" = "1" ]; then yarn ts-node --transpile-only --compiler-options "{\"module\":\"CommonJS\",\"moduleResolution\":\"Node\",\"esModuleInterop\":true,\"skipLibCheck\":true}" prisma/seed.ts; else echo "Seed desligado (RUN_SEED != true)"; fi \
  && if [ -f dist/main.js ]; then node dist/main.js; elif [ -f dist/src/main.js ]; then node dist/src/main.js; else echo \"❌ dist/main.js não encontrado\"; ls -R dist || true; exit 1; fi'