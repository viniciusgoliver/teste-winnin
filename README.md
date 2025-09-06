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
├── app.module.ts
├── common/
│   ├── dto/
│   │   ├── date-range.input.ts
│   │   └── sort.input.ts
│   └── filters/
│       └── domain-exception.filter.ts
├── core/
│   ├── application/
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── create-user.dto.ts
│   │   │   ├── pagination.input.ts
│   │   │   └── place-order.dto.ts
│   │   └── use-cases/
│   │       ├── create-product.usecase.ts
│   │       ├── create-user.usecase.ts
│   │       ├── list-products.usecase.ts
│   │       ├── list-users.usecase.ts
│   │       ├── place-order.usecase.ts
│   │       ├── update-product.usecase.ts
│   │       └── update-user.usecase.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── order-item.entity.ts
│   │   │   ├── order.entity.ts
│   │   │   ├── product.entity.ts
│   │   │   └── user.entity.ts
│   │   └── errors/
│   │       └── out-of-stock.error.ts
│   └── ports/
│       └── repositories/
│           ├── order.repository.ts
│           ├── product.repository.ts
│           └── user.repository.ts
├── health/
│   ├── health.controller.ts
│   └── health.module.ts
├── infra/
│   ├── db/
│   │   └── prisma.service.ts
│   └── repositories/
│       ├── order.prisma.repository.ts
│       ├── product.prisma.repository.ts
│       └── user.prisma.repository.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.resolver.ts
│   │   ├── auth.service.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/
│   │   │   ├── auth-user.type.ts
│   │   │   ├── auth.payload.ts
│   │   │   ├── login.input.ts
│   │   │   └── signup.input.ts
│   │   ├── guards/
│   │   │   ├── gql-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── models/
│   │   │   ├── auth.output.ts
│   │   │   └── jwt-user.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── orders/
│   │   ├── dto/
│   │   │   ├── orders.filter.input.ts
│   │   │   ├── orders.sort.input.ts
│   │   │   └── place-order.input.ts
│   │   ├── orders.module.ts
│   │   └── orders.resolver.ts
│   ├── products/
│   │   ├── dto/
│   │   │   ├── create-product.input.ts
│   │   │   ├── products.filter.input.ts
│   │   │   ├── products.sort.input.ts
│   │   │   └── update-product.input.ts
│   │   ├── products.module.ts
│   │   └── products.resolver.ts
│   └── users/
│       ├── dto/
│       │   ├── create-user.input.ts
│       │   ├── update-user.input.ts
│       │   ├── users.filter.input.ts
│       │   └── users.sort.input.ts
│       ├── users.module.ts
│       └── users.resolver.ts
└── main.ts
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
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/winnin?schema=public

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
docker compose exec db psql -U postgres -d winnin -c 'SELECT id, email, role FROM "User";'
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

Vinícius Oliveira  
📧 [vinicius.oliver@gmail.com](mailto:vinicius.oliver@gmail.com)  
🔗 [LinkedIn](https://www.linkedin.com/in/vinicius-oliveira/)



---

## 📜 Exemplos de Queries e Mutations (Completo)

> Abaixo estão **todas as queries e mutations** disponíveis, já formatadas para uso no **GraphQL Playground**.

```graphql
############################################
# AUTH
############################################

# Signup (cria um usuário padrão USER)
mutation Signup {
  signup(
    input: { name: "João Teste", email: "joao@acme.com", password: "secret123" }
  ) {
    accessToken
    refreshToken
    user {
      id
      name
      email
      role
      createdAt
    }
  }
}

# Login
mutation Login {
  login(input: { email: "admin@teste.com", password: "admin123" }) {
    accessToken
    refreshToken
    user {
      id
      name
      email
      role
      createdAt
    }
  }
}

# Refresh Token (requer Authorization)
mutation Refresh {
  refresh {
    accessToken
    refreshToken
    user {
      id
      name
      email
      role
      createdAt
    }
  }
}

# Me (usuário autenticado)
query Me {
  me {
    id
    name
    email
    role
    createdAt
  }
}

############################################
# PRODUCTS
############################################

# (ADMIN) Criar produto
mutation CreateProduct {
  createProduct(input: { name: "Teclado Mecânico", price: 299.90, stock: 12 }) {
    id
    name
    price
    stock
    createdAt
  }
}

# (ADMIN) Atualizar produto
mutation UpdateProduct {
  updateProduct(input: { id: 1, price: 219.90, stock: 8 }) {
    id
    name
    price
    stock
    createdAt
  }
}

# Listar todos os produtos
query ProductsAll {
  products {
    id
    name
    price
    stock
    createdAt
  }
}

# Página de produtos com filtros e ordenação
query ProductsPageFiltered(
  $page: Int = 1
  $limit: Int = 5
  $name: String = "prod"
  $priceMin: Float = 100
  $priceMax: Float = 400
) {
  productsPage(
    pagination: { page: $page, limit: $limit }
    filter: {
      nameContains: $name
      priceMin: $priceMin
      priceMax: $priceMax
      stockMin: 1
    }
    sort: { field: PRICE, direction: DESC }
  ) {
    total
    page
    limit
    hasNext
    items {
      id
      name
      price
      stock
      createdAt
    }
  }
}

############################################
# USERS
############################################

# (ADMIN) Criar usuário
mutation CreateUser {
  createUser(
    input: {
      name: "Maria Admin"
      email: "maria.admin@acme.com"
      password: "admin123"
      role: ADMIN
    }
  ) {
    id
    name
    email
    role
    createdAt
  }
}

# (ADMIN) Atualizar usuário
mutation UpdateUser {
  updateUser(input: { id: 2, name: "User Renomeado", role: USER }) {
    id
    name
    email
    role
    createdAt
  }
}

# Listar todos os usuários
query UsersAll {
  users {
    id
    name
    email
    role
    createdAt
  }
}

# Página de usuários com filtros e ordenação
query UsersPageFiltered(
  $page: Int = 1
  $limit: Int = 10
  $role: Role = USER
  $from: DateTime = "2025-09-01T00:00:00.000Z"
) {
  usersPage(
    pagination: { page: $page, limit: $limit }
    filter: { role: $role, nameContains: "a", createdAt: { from: $from } }
    sort: { field: NAME, direction: ASC }
  ) {
    total
    page
    limit
    hasNext
    items {
      id
      name
      email
      role
      createdAt
    }
  }
}

############################################
# ORDERS
############################################

# (USER/ADMIN) Criar pedido
mutation PlaceOrder {
  placeOrder(
    input: {
      items: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }]
    }
  ) {
    id
    userId
    total
    createdAt
    items {
      id
      productId
      quantity
      price
    }
  }
}

# (ADMIN) Listar todos os pedidos
query OrdersAll {
  winnin {
    id
    userId
    total
    createdAt
    items {
      id
      productId
      quantity
      price
    }
  }
}

# (USER/ADMIN) Meus pedidos
query MyOrders {
  myOrders {
    id
    total
    createdAt
    items {
      productId
      quantity
      price
    }
  }
}

# (ADMIN) Página de pedidos com filtros e ordenação
query OrdersPageFiltered($page: Int = 1, $limit: Int = 5, $userId: Int = 1) {
  winninPage(
    pagination: { page: $page, limit: $limit }
    filter: {
      userId: $userId
      totalMin: 50
      totalMax: 1000
      createdAt: { from: "2025-08-01T00:00:00.000Z" }
    }
    sort: { field: TOTAL, direction: DESC }
  ) {
    total
    page
    limit
    hasNext
    items {
      id
      userId
      total
      createdAt
      items {
        id
        productId
        quantity
        price
      }
    }
  }
}

# (USER/ADMIN) Minha página de pedidos
query MyOrdersPage($page: Int = 1, $limit: Int = 5) {
  myOrdersPage(
    pagination: { page: $page, limit: $limit }
    filter: { totalMin: 0, createdAt: { from: "2025-08-20T00:00:00.000Z" } }
    sort: { field: CREATED_AT, direction: DESC }
  ) {
    total
    page
    limit
    hasNext
    items {
      id
      total
      createdAt
      items {
        productId
        quantity
        price
      }
    }
  }
}

############################################
# TESTE DE ERRO OUT_OF_STOCK
############################################

mutation OutOfStock {
  placeOrder(input: { items: [{ productId: 1, quantity: 9999 }] }) {
    id
  }
}

```
