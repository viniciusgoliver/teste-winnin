# Orders GraphQL API (NestJS + Prisma + PostgreSQL)

API para **usuários, produtos e pedidos** com **GraphQL**. Foco em:

- **Concorrência** segura de estoque (sem oversell) usando `updateMany + decrement`.
- **DDD leve** (use cases + repos).
- **Autenticação JWT** (USER/ADMIN), `placeOrder` usa `userId` do token.
- **Docker** e **docker-compose**.
- **CI** opcional (GitHub Actions).

## Stack

- Node 20, NestJS 11, `@nestjs/apollo` 13 + `@apollo/server` 4, GraphQL 16
- Prisma ORM, PostgreSQL 16
- JWT (`@nestjs/jwt`), `passport-jwt`
- Class-validator

## Como rodar (local)

1. Crie `.env` a partir de `.env.example`
2. Suba Postgres local ou use Docker
3. Instale deps e gere Prisma client:

   ```bash
   npm ci
   npx prisma generate
   npx prisma migrate dev -n init
