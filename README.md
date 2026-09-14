# MedClinic API

API REST para gerenciamento de uma clínica médica. **Etapa 1**: base de autenticação e autorização (RBAC). Módulos de domínio (médicos, pacientes, consultas) ficam para etapa futura.

## Tecnologias

Node.js · TypeScript · Express.js · TypeORM · PostgreSQL · JWT · bcrypt

## Arquitetura

```
Cliente → Route → Middleware (Auth/RBAC) → Controller → Service → Repository → PostgreSQL
```

`routes` → `middlewares` (auth/RBAC/erros) → `controllers` → `services` (regras de negócio) → `repositories` (TypeORM) → `entities` → `database` (conexão/migrations) → `utils` (hash, JWT) → `dtos`

## Como rodar

```bash
git clone https://github.com/Brrn91/medclinic-api.git
cd medclinic-api
npm install
cp .env.example .env    # preencha com suas credenciais
```

> Se o `npm install` avisar sobre `allow-scripts` do `bcrypt`, ignore — ele usa binário pré-compilado. Se der erro de hash, rode `npm approve-scripts bcrypt`.

```bash
psql -U postgres -c "CREATE DATABASE medclinic;"
npm run migration:run
npm run dev
```

API sobe em `http://localhost:PORT` (definido no `.env`).

## Perfis de acesso

| Perfil | Acesso |
|---|---|
| `ATTENDANT` | Padrão no cadastro, operacional restrito |
| `ADMIN` | Completo, incluindo rotas administrativas |

Promoção para `ADMIN` é feita direto no banco (sem endpoint nesta etapa):
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'seu-email@exemplo.com';
```

## Endpoints

| Método | Rota | Auth | Descrição | Respostas |
|---|---|---|---|---|
| POST | `/auth/register` | — | Cadastra usuário | 201, 400, 409 |
| POST | `/auth/login` | — | Login, retorna JWT | 200, 401 |
| GET | `/users/me` | Bearer | Dados do usuário autenticado | 200, 401 |
| GET | `/admin/ping` | Bearer + ADMIN | Rota administrativa | 200, 401, 403 |
| GET | `/health` | — | Health check | 200 |

**Cadastro** — body: `{ "name", "email", "password" }`
**Login** — body: `{ "email", "password" }`

## Autor

Lucas Bruno da Costa Mafra
