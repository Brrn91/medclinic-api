# MedClinic API

API REST para o gerenciamento de uma clínica médica de pequeno porte.

Esta é a **Etapa 1** do projeto: construção da base de **autenticação e autorização** do sistema. As funcionalidades de gerenciamento de especialidades, médicos, pacientes e consultas serão implementadas em uma etapa futura, sobre esta mesma base de código.

## Sumário

- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Configuração do banco de dados](#configuração-do-banco-de-dados)
- [Executando a aplicação](#executando-a-aplicação)
- [Perfis de acesso (RBAC)](#perfis-de-acesso-rbac)
- [Endpoints da API](#endpoints-da-api)
- [Scripts disponíveis](#scripts-disponíveis)

## Tecnologias utilizadas

- **Node.js**
- **TypeScript**
- **Express.js** — framework HTTP
- **TypeORM** — ORM para PostgreSQL
- **PostgreSQL** — banco de dados relacional
- **JWT (jsonwebtoken)** — autenticação baseada em token
- **bcrypt** — hash de senhas
- **dotenv** — variáveis de ambiente

## Arquitetura

O projeto segue uma arquitetura **MVC em camadas**, preparada para receber os módulos de domínio da clínica em uma etapa futura:

```
Cliente HTTP → Route → Middleware (Auth/RBAC) → Controller → Service → Repository (TypeORM) → PostgreSQL
```

| Camada          | Responsabilidade                                             |
| --------------- | ------------------------------------------------------------ |
| `routes/`       | Define os endpoints e associa aos controllers                |
| `middlewares/`  | Autenticação (JWT), autorização (RBAC) e tratamento de erros |
| `controllers/`  | Recebe requisições HTTP e retorna respostas                  |
| `services/`     | Regras de negócio e validações                               |
| `repositories/` | Comunicação com o banco via TypeORM                          |
| `entities/`     | Entidades do TypeORM                                         |
| `database/`     | Conexão (DataSource) e migrations                            |
| `utils/`        | Funções auxiliares (hash de senha, JWT)                      |
| `dtos/`         | Objetos de transferência de dados tipados                    |

## Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL instalado e em execução
- npm

## Configuração do ambiente

1. Clone o repositório e instale as dependências:

```bash
git clone https://github.com/Brrn91/medclinic-api.git
cd medclinic-api
npm install
```

2. Copie o arquivo de exemplo de variáveis de ambiente e preencha com suas credenciais:

```bash
cp .env.example .env
```

3. Edite o `.env` com os dados do seu ambiente local (host, porta, usuário e senha do PostgreSQL, nome do banco, segredo JWT e tempo de expiração do token).

## Configuração do banco de dados

1. Crie o banco de dados no PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE medclinic;"
```

2. Execute as migrations para criar as tabelas:

```bash
npm run migration:run
```

Isso cria a extensão `uuid-ossp`, a tabela `users` e a tabela de controle `migrations`.

## Executando a aplicação

**Ambiente de desenvolvimento** (com hot-reload):

```bash
npm run dev
```

**Build para produção:**

```bash
npm run build
npm start
```

Por padrão, a API sobe na porta configurada em `PORT` no `.env` (padrão: `3000`).

## Perfis de acesso (RBAC)

O sistema possui dois perfis de usuário:

| Perfil      | Descrição                                               |
| ----------- | ------------------------------------------------------- |
| `ADMIN`     | Acesso completo, incluindo rotas administrativas        |
| `ATTENDANT` | Acesso operacional restrito (perfil padrão no cadastro) |

Todo novo usuário é cadastrado com o perfil `ATTENDANT`. A promoção para `ADMIN` não possui endpoint nesta etapa e deve ser feita diretamente no banco de dados, por exemplo:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'seu-email@exemplo.com';
```

## Endpoints da API

### `POST /auth/register`

Cadastra um novo usuário.

**Body:**

```json
{
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Respostas:**

- `201` — usuário criado (sem a senha no retorno)
- `400` — campos obrigatórios ausentes, e-mail inválido ou senha curta
- `409` — e-mail já cadastrado

### `POST /auth/login`

Autentica um usuário e retorna um token JWT.

**Body:**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Respostas:**

- `200` — retorna `token` e os dados do usuário
- `401` — credenciais inválidas

### `GET /users/me`

Retorna os dados do usuário autenticado a partir do token.

**Header obrigatório:** `Authorization: Bearer <token>`

**Respostas:**

- `200` — dados do usuário autenticado
- `401` — token ausente, inválido ou expirado

### `GET /admin/ping`

Rota protegida, acessível apenas por usuários com perfil `ADMIN`.

**Header obrigatório:** `Authorization: Bearer <token>`

**Respostas:**

- `200` — acesso autorizado
- `401` — token ausente, inválido ou expirado
- `403` — usuário autenticado, mas sem permissão de `ADMIN`

### `GET /health`

Endpoint de verificação de disponibilidade da API (não exige autenticação).

## Scripts disponíveis

| Script                       | Descrição                                                   |
| ---------------------------- | ----------------------------------------------------------- |
| `npm run dev`                | Executa a aplicação em modo de desenvolvimento (hot-reload) |
| `npm run build`              | Compila o TypeScript para JavaScript em `dist/`             |
| `npm start`                  | Executa a aplicação compilada (produção)                    |
| `npm run migration:run`      | Executa as migrations pendentes                             |
| `npm run migration:revert`   | Reverte a última migration                                  |
| `npm run migration:generate` | Gera uma nova migration a partir das entidades              |

## Autor

Lucas Bruno da Costa Mafra| Executa as migrations pendentes |
| `npm run migration:revert` | Reverte a última migration |
| `npm run migration:generate` | Gera uma nova migration a partir das entidades |

## Autor

Lucas Bruno da Costa Mafra
