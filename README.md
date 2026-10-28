# MedClinic API

API REST para gerenciamento de uma clínica médica, desenvolvida com foco em organização, segurança e boas práticas de desenvolvimento backend.

**Links:** [API em produção](https://medclinic-api-fui6.onrender.com) | [Documentação Swagger](https://medclinic-api-fui6.onrender.com/api-docs/)

## Funcionalidades

- Autenticação com JWT e controle de acesso por perfil.
- Gerenciamento de usuários e pacientes.
- Cadastro e gerenciamento de médicos e especialidades.
- Gerenciamento de consultas médicas.
- Endpoints para relatórios.
- Persistência de dados com PostgreSQL e migrations.
- Validação de dados, tratamento de erros e limitação de requisições.

## Tecnologias

- **Runtime:** Node.js
- **Linguagem:** TypeScript
- **Framework:** Express
- **Banco de dados:** PostgreSQL
- **ORM:** TypeORM
- **Autenticação:** JWT
- **Validação:** Zod
- **Documentação:** Swagger
- **Containerização:** Docker

## Como executar localmente

### Pré-requisitos

- Node.js
- PostgreSQL
- Git

### Instalação

```bash
git clone https://github.com/Brrn91/medclinic-api.git
cd medclinic-api
npm ci
```

Configure as variáveis de ambiente utilizando o arquivo `.env.example` como referência e prepare o banco de dados.

Execute as migrations e inicie a aplicação:

```bash
npm run migration:run
npm run dev
```

A API ficará disponível em `http://localhost:3000`, e a documentação Swagger em `http://localhost:3000/api-docs/`.

## Testes e qualidade

O projeto conta com testes automatizados e processo de build com TypeScript.

## Objetivo do projeto

Aplicar conhecimentos em desenvolvimento backend, APIs REST, autenticação, banco de dados relacionais e organização de aplicações com TypeScript.
