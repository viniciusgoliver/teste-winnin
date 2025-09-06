# ====== Vars ======
SHELL := /bin/bash
DOCKER := docker compose
API := orders_api
DB := orders_db

# ====== Docker ======
up:
	$(DOCKER) up -d --build

up-dev:
	$(DOCKER) up --build

down:
	$(DOCKER) down

logs:
	$(DOCKER) logs -f $(API)

sh:
	$(DOCKER) exec -it $(API) sh

sh-db:
	$(DOCKER) exec -it $(DB) sh -lc 'psql -U postgres -d winnin'

# ====== Prisma / DB ======
migrate:
	npx prisma migrate dev

deploy:
	npx prisma migrate deploy

generate:
	npx prisma generate

seed:
	npm run prisma:seed

reset-db:
	npm run reset:db

studio:
	npx prisma studio

# ====== App local ======
dev:
	npm run start:dev

build:
	npm run build

start:
	npm run start:prod

# ====== Util ======
health:
	curl -s http://localhost:3000/health | jq .

graphql:
	open http://localhost:3000/graphql || xdg-open http://localhost:3000/graphql || true