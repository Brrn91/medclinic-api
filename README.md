# MedClinic API

API REST para o gerenciamento de uma clínica médica de pequeno porte: autenticação com perfis de acesso, cadastro de especialidades, médicos e pacientes, agendamento de consultas e relatórios gerenciais.

> Projeto avaliativo do Módulo 02 (Back-End Node, SCTEC), que dá continuidade à etapa de autenticação e autorização.

## Problema que resolve

Uma clínica precisa controlar quem acessa o sistema e o que cada pessoa pode fazer, e organizar médicos, pacientes e consultas sem conflitos de horário. A API centraliza essas regras: o **Administrador** gerencia o cadastro da clínica e consulta relatórios; o **Atendente** cuida da operação diária (pacientes e consultas).

## Tecnologias

- **Node.js 22**, **TypeScript** (tipagem estática em todas as camadas) e **Express**
- **TypeORM** + **PostgreSQL 16** (migrations versionadas)
- **JWT** (`jsonwebtoken`) e **bcrypt** para autenticação e hash de senha
- **RBAC** (perfis `ADMIN` e `ATTENDANT`)
- **zod** para validação de entrada
- **Winston** para logs, **CORS** configurado por ambiente e **express-rate-limit**
- **Swagger UI** para a documentação interativa
- **Jest** + **ts-jest** (testes unitários)
- **Docker** / **Docker Compose** e deploy no **Render**

## Arquitetura

```
Cliente HTTP → Route → Middlewares (CORS, rate limit, auth, RBAC)
             → Controller → Service → Repository (TypeORM) → PostgreSQL
```

| Camada                      | Responsabilidade                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `routes`                    | Define os endpoints e aplica os middlewares                                             |
| `middlewares`               | Autenticação (JWT), autorização (RBAC), logs de requisição, tratamento central de erros |
| `controllers`               | Recebem a requisição HTTP e devolvem a resposta                                         |
| `services`                  | Regras de negócio (ex.: conflito de horário em consultas)                               |
| `repositories`              | Acesso ao banco via TypeORM                                                             |
| `entities`                  | Classes decoradas do TypeORM                                                            |
| `database`                  | `DataSource`, migrations e seed                                                         |
| `dtos` / `utils` / `errors` | Contratos de entrada e saída, hash, JWT e `AppError`                                    |

## Como executar

### Opção 1: Docker (recomendada)

Pré-requisito: Docker com Compose.

```bash
git clone https://github.com/Brrn91/medclinic-api.git
cd medclinic-api
cp .env.example .env
docker compose up --build
```

O `docker compose up` executa, em ordem:

1. `db`: PostgreSQL com volume persistente (`postgres_data`);
2. `migrate`: cria o schema (migrations do TypeORM);
3. `seed`: cria o administrador inicial (idempotente: não duplica);
4. `api`: sobe a aplicação em `http://localhost:3000`.

Se as migrations ou o seed falharem, a API **não sobe**. Veja o motivo com `docker compose logs migrate` ou `docker compose logs seed`.

Para recomeçar do zero (apaga os dados do banco): `docker compose down -v`.

### Opção 2: execução local

Pré-requisitos: Node.js 22+ e PostgreSQL.

```bash
npm install
cp .env.example .env        # preencha com as suas credenciais (DB_HOST=localhost)
psql -U postgres -c "CREATE DATABASE medclinic;"
npm run migration:run       # cria as tabelas
npm run seed:admin          # cria o administrador inicial
npm run dev                 # desenvolvimento (tsx watch)
```

Produção local: `npm run build && npm start`.

## Variáveis de ambiente

Todas ficam no `.env` (modelo em `.env.example`; o `.env` não é versionado).

| Variável                                                     | Descrição                                                                  |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `PORT`                                                       | Porta da API                                                               |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`    | Conexão com o PostgreSQL (no Docker, `DB_HOST` é sobrescrito para `db`)    |
| `JWT_SECRET`, `JWT_EXPIRES_IN`                               | Segredo e expiração do token (ex.: `1h`)                                   |
| `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Dados do administrador inicial                                             |
| `LOG_LEVEL`                                                  | Nível de log (`error`, `warn`, `info`, `http`, `debug`)                    |
| `CORS_ORIGINS`                                               | Origens permitidas, separadas por vírgula                                  |
| `RATE_LIMIT_WINDOW_MS`                                       | Janela do rate limit, em milissegundos (padrão: 900000, ou 15 minutos)     |
| `RATE_LIMIT_MAX`                                             | Máximo de requisições por IP na janela, para a API toda (padrão: 1000)     |
| `AUTH_RATE_LIMIT_MAX`                                        | Máximo de requisições por IP na janela para login e cadastro (padrão: 100) |

## Banco de dados

O schema é criado **somente por migrations** (`src/database/migrations`):

```bash
npm run migration:run       # aplica
npm run migration:revert    # desfaz a última
```

Tabelas: `users`, `especialidades`, `medicos`, `pacientes`, `consultas` e `migrations`.

## Perfis de acesso e administrador inicial

| Perfil      | Acesso                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN`     | Completo: cadastro de especialidades e médicos, remoção de pacientes, relatórios                                                |
| `ATTENDANT` | Operacional: consulta especialidades e médicos; cadastra e atualiza pacientes; agenda, registra atendimento e cancela consultas |

Todo usuário cadastrado em `POST /auth/register` nasce como `ATTENDANT`. O administrador inicial é criado pelo seed com os valores do `.env.example`:

- **E-mail:** `admin@medclinic.com`
- **Senha:** `senha12345`

> Esses valores são apenas para testes locais. > Valores de teste, com dados fictícios. O ambiente publicado no Render usa as mesmas credenciais..

## Endpoints

Todas as rotas, exceto as públicas, exigem `Authorization: Bearer <token>`. As listagens aceitam paginação (`?page=1&limit=10`) e retornam metadados (total, página atual, limite e total de páginas).

| Método e rota                                       | Descrição                         | Acesso            |
| --------------------------------------------------- | --------------------------------- | ----------------- |
| `POST /auth/register`                               | Cadastro de usuário               | Pública           |
| `POST /auth/login`                                  | Login e emissão do JWT            | Pública           |
| `GET /users/me`                                     | Dados do usuário autenticado      | Autenticado       |
| `GET /health`                                       | Verificação de saúde              | Pública           |
| `GET /api-docs`                                     | Swagger UI                        | Pública           |
| `GET /especialidades`, `GET /especialidades/:id`    | Listar e consultar                | Admin e Atendente |
| `POST`, `PUT`, `DELETE /especialidades`             | Cadastrar, atualizar, remover     | Admin             |
| `GET /medicos`, `GET /medicos/:id`                  | Listar (com filtros) e consultar  | Admin e Atendente |
| `POST`, `PUT`, `DELETE /medicos`                    | Cadastrar, atualizar, remover     | Admin             |
| `GET /pacientes`, `GET /pacientes/:id`              | Listar (com filtros) e consultar  | Admin e Atendente |
| `POST /pacientes`, `PUT /pacientes/:id`             | Cadastrar e atualizar             | Admin e Atendente |
| `DELETE /pacientes/:id`                             | Remover                           | Admin             |
| `GET /consultas`, `GET /consultas/:id`              | Listar (com filtros) e consultar  | Admin e Atendente |
| `POST /consultas`                                   | Agendar consulta                  | Admin e Atendente |
| `PATCH /consultas/:id/atendimento`                  | Registrar atendimento             | Admin e Atendente |
| `PATCH /consultas/:id/cancelamento`                 | Cancelar consulta                 | Admin e Atendente |
| `GET /relatorios/consultas-por-status`              | Consultas agrupadas por status    | Admin             |
| `GET /relatorios/consultas-por-medico`              | Consultas por médico              | Admin             |
| `GET /relatorios/medicos-por-especialidade`         | Médicos por especialidade         | Admin             |
| `GET /relatorios/pacientes-com-consultas-agendadas` | Pacientes com consultas agendadas | Admin             |

Códigos de erro padronizados em JSON: `400` (validação), `401` (não autenticado), `403` (sem permissão), `404`, `409` (conflito/duplicidade), `429` (limite de requisições) e `500`.

## Documentação Swagger

Com a API em execução: **<http://localhost:3000/api-docs>**. Use o botão **Authorize** para informar o token JWT e testar as rotas protegidas.

## Logs (Winston)

- Console e arquivos: `logs/combined.log` (todos os níveis) e `logs/error.log` (erros). A pasta `logs/` não é versionada.
- Nível configurável por `LOG_LEVEL`.
- São registrados: cada requisição (método, rota, status, tempo), eventos de autenticação, acessos negados, erros tratados, avisos de rate limit e operações de negócio.
- Senhas, hashes e tokens **não** são registrados.
- No Render e no Docker, o disco do contêiner é efêmero: acompanhe os logs pelo console (`docker compose logs api` ou painel do Render).

## Segurança

- Senhas com hash (bcrypt) e JWT com expiração.
- **CORS** com origens explícitas definidas por ambiente; origens não autorizadas são bloqueadas.
- **Rate limiting** por IP: limite global (padrão: 1000 requisições a cada 15 minutos) e limite para `POST /auth/login` e `POST /auth/register` (padrão: 100 a cada 15 minutos). Ao exceder, a API responde `429` em JSON e registra um aviso no log.

## Testes

```bash
npm test
```

Testes unitários com Jest e ts-jest: 32 testes em 3 suítes (`AuthService`, `EspecialidadeService` e `ConsultaService`), com mocks no lugar do banco de dados. Relatório de cobertura: `npm run test:coverage`.

## Deploy

Aplicação publicada no Render como Web Service, conectada a um PostgreSQL gerenciado, com as variáveis de ambiente configuradas na plataforma.

- [**API (Render):**](https://medclinic-api-fui6.onrender.com) (a raiz não possui rota; use os links abaixo)
- [**Health check:**](https://medclinic-api-fui6.onrender.com/health)
- [**Swagger:**](https://medclinic-api-fui6.onrender.com/api-docs)

> Ambiente de demonstração no plano gratuito do Render: após cerca de 15 minutos sem
> acessos a API hiberna e a primeira requisição pode levar cerca de 1 minuto.
> O banco gratuito do Render expira em 27/11/2026 (30 dias após a criação)
> A forma principal de executar e avaliar o projeto é via Docker (seção "Como executar").

## Organização do projeto

- [**Quadro Kanban (Trello):**](https://trello.com/b/86WSAhUo/medclinic-api)
- **Git-flow:** `main` (versão final), `develop` (integração) e branches `feat/*`, `fix/*` e `docs/*` criadas a partir da `develop`, uma por tarefa, mescladas via Pull Request e mantidas após o merge. Exemplos: `feat/winston-logger`, `feat/cors-rate-limit`, `feat/medicos`, `feat/pacientes`, `feat/consultas`, `fix/docker-migrations`, `docs/readme-completo`. A lista completa está na aba _Branches_ do GitHub.
- **Commits semânticos:** `feat:`, `fix:`, `docs:`, `refactor:`.

## Melhorias futuras

- Tratar `SIGTERM`/`SIGINT` no servidor (graceful shutdown) para encerrar requisições em andamento e fechar a conexão com o banco antes de sair.
- Adicionar `healthcheck` à API no Compose para usar `docker compose up --wait`.
- Refresh token e revogação de tokens.
- Testes de integração com banco real em pipeline de CI.

## Autor

Lucas Bruno da Costa Mafra
