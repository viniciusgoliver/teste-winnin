# 🛍️ Orders API – GraphQL + NestJS + Prisma + PostgreSQL

API de **Gestão de Pedidos** construída com **NestJS** + **GraphQL** + **Prisma** + **PostgreSQL**.  
O objetivo é fornecer uma solução **performática, segura e escalável** com **concorrência controlada**, **paginação avançada**, **filtros**, **autenticação JWT** e **controle de permissões (USER / ADMIN)**.

---

## 📌 Sumário

- [🚀 Tecnologias](#-tecnologias)
- [📂 Estrutura do Projeto](#-estrutura-do-projeto)
- [⚙️ Pré-requisitos](#️-pré-requisitos)
- [📦 Configuração do Ambiente](#-configuração-do-ambiente)
- [🐳 Rodando com Docker](#-rodando-com-docker-recomendado)
- [🛠️ Rodando Localmente](#️-rodando-localmente)
- [🧩 Banco de Dados & Prisma](#-banco-de-dados--prisma)
- [🌱 Seed Automático](#-seed-automático)
- [🔐 Autenticação & Roles](#-autenticação--roles)
- [📡 GraphQL Playground](#-graphql-playground)
- [📜 Exemplos de Queries](#-exemplos-de-queries)
- [🧪 Testes Automatizados](#-testes-automatizados)
- [🩺 Health Check](#-health-check)
- [⚡ Integração Contínua (CI)](#-integração-contínua-ci)
- [🐛 Troubleshooting](#-troubleshooting)

---

## 🚀 Tecnologias

- **Node.js 20+**
- **NestJS 11** + **GraphQL (Apollo Driver)**
- **Prisma ORM** (PostgreSQL)
- **JWT** para autenticação e controle de roles
- **Docker** + **Docker Compose**
- **Class Validator / Class Transformer**
- **bcrypt** para hash de senha

---

## 📂 Estrutura do Projeto

```bash
src/
├── common/               # Filtros, DTOs e utilitários globais
├── core/                 # Camada de Domínio + Casos de Uso (DDD)
│   ├── domain/           # Entidades e regras de negócio
│   ├── application/      # Use Cases + DTOs
│   └── ports/            # Interfaces de repositórios
├── infra/                # Infraestrutura
│   ├── db/               # Configuração do Prisma
│   └── repositories/     # Implementações concretas (Prisma)
├── modules/              # Módulos da aplicação
│   ├── auth/             # JWT, Guards, Decorators e Resolvers
│   ├── users/
│   ├── products/
│   └── orders/
└── main.ts               # Ponto de entrada da aplicação
```

---

## ⚙️ Pré-requisitos

- **Node.js** >= 20
- **Yarn** >= 1.22
- **Docker** >= 24
- **Docker Compose** >= 2.20

---

## 📦 Configuração do Ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/orders?schema=public

JWT_SECRET=supersecret
JWT_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

RUN_SEED=true
```

> **Dica:**  
> - `RUN_SEED=true` → popula o banco automaticamente.  
> - Após executar uma vez, defina `RUN_SEED=false`.

---

## 🐳 Rodando com Docker (Recomendado)

```bash
docker compose up --build
```

> Após o build, acesse:
- GraphQL Playground → [http://localhost:3000/graphql](http://localhost:3000/graphql)
- Healthcheck → [http://localhost:3000/health](http://localhost:3000/health)

---

## 🛠️ Rodando Localmente

```bash
yarn install
yarn prisma generate
yarn prisma migrate dev
yarn start:dev
```

---

## 🧩 Banco de Dados & Prisma

### Criar e aplicar migrations

```bash
# criar migration
yarn prisma migrate dev -n init

# aplicar migration (deploy)
yarn prisma migrate deploy
```

### Gerar cliente Prisma
```bash
yarn prisma generate
```

### Visualizar banco (GUI)
```bash
yarn prisma studio
```

---

## 🌱 Seed Automático

O seed cria **2 usuários**, **20 produtos** e **10 pedidos de exemplo**:

| Usuário      | E-mail            | Senha     | Role  |
|-------------|--------------------|-----------|-------|
| Admin       | admin@teste.com    | admin123  | ADMIN |
| User Padrão | user@teste.com     | user123   | USER  |

---

## 🔐 Autenticação & Roles

### Usuários
- **ADMIN** → pode criar/atualizar usuários, criar/editar produtos, listar todos os pedidos.
- **USER** → pode consultar produtos, criar pedidos e ver apenas seus próprios pedidos.

### Autenticação JWT
Todas as rotas protegidas exigem o header:
```json
{
  "Authorization": "Bearer <seu_token>"
}
```

---

## 📡 GraphQL Playground

Acesse:  
**[http://localhost:3000/graphql](http://localhost:3000/graphql)**

Para testar autenticação, faça **login** e copie o token JWT para os **HTTP HEADERS**:

```json
{
  "Authorization": "Bearer <seu_token>"
}
```

---

## 📜 Exemplos de Queries

> Use o arquivo **[`docs/playground-examples.graphql`](docs/playground-examples.graphql)** para colar direto no Playground.

Exemplos disponíveis no arquivo:
- **Auth** → signup, login, refresh, me
- **Users** → criar, atualizar, listar, paginação, filtros
- **Products** → criar, atualizar, listar, filtros e ordenação
- **Orders** → criar pedido, listar pedidos, paginação, meus pedidos

---

## 🧪 Testes Automatizados

Rodar testes unitários:
```bash
yarn test
```

Rodar testes e2e:
```bash
yarn test:e2e
```

---

## 🩺 Health Check

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "db": "up"
}
```

---

## ⚡ Integração Contínua (CI)

Este projeto inclui um workflow de **CI** usando **GitHub Actions** para garantir a qualidade e integridade do código.

### Arquivo: `.github/workflows/ci.yml`

O pipeline executa as seguintes etapas:
- **Instala dependências** usando Yarn.
- **Gera o client Prisma**.
- **Aplica migrations** automaticamente.
- **Executa o seed** (opcional, pode ser desativado via env).
- **Roda testes unitários e e2e**.
- **Valida build** para produção.

---

## 🐛 Troubleshooting

### 1. `Invalid credentials`
- Certifique-se que os usuários do seed foram criados:
```bash
docker compose exec db psql -U postgres -d orders -c 'SELECT id, email, role FROM "User";'
```

- Para resetar senha do admin:
```bash
docker compose exec api node -e "const bcrypt=require('bcrypt'); const {PrismaClient}=require('@prisma/client'); (async()=>{const prisma=new PrismaClient(); const hash=await bcrypt.hash('admin123',10); await prisma.user.update({where:{email:'admin@teste.com'},data:{passwordHash:hash}});console.log('Senha resetada');await prisma.$disconnect();})()"
```

### 2. `OUT_OF_STOCK`
- Ao tentar comprar mais do que o estoque, o GraphQL retorna:
```json
{
  "errors": [
    {
      "message": "Insufficient stock for product",
      "extensions": { "code": "OUT_OF_STOCK" }
    }
  ]
}
```

---

## 👨‍💻 Autor

Vinícius G. Oliveira  
📧 [vinicius.oliver@gmail.com](mailto:vinicius.oliver@gmail.com)  
