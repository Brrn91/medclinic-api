import type { OpenAPIV3 } from "openapi-types";

import {
  bearerSecurity,
  DocSchemas,
  errorResponses,
  idParam,
  jsonBody,
  jsonResponse,
  limitParam,
  pageParam,
  pageSchema,
  queryParam,
} from "./common";

export const especialidadesSchemas: DocSchemas = {
  Especialidade: {
    type: "object",
    required: ["id", "nome", "descricao", "createdAt", "updatedAt"],
    properties: {
      id: { type: "string", format: "uuid" },
      nome: { type: "string", example: "Cardiologia" },
      descricao: {
        type: "string",
        nullable: true,
        example: "Coração e sistema circulatório",
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  EspecialidadeInput: {
    type: "object",
    required: ["nome"],
    properties: {
      nome: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        description: "Nome único (a comparação ignora maiúsculas e minúsculas)",
        example: "Cardiologia",
      },
      descricao: {
        type: "string",
        maxLength: 255,
        example: "Coração e sistema circulatório",
      },
    },
  },
  EspecialidadePage: pageSchema("Especialidade"),
};

export const especialidadesPaths: OpenAPIV3.PathsObject = {
  "/especialidades": {
    get: {
      tags: ["Especialidades"],
      summary: "Lista especialidades (paginado)",
      description: "Perfis: Administrador e Atendente. Ordenado por nome.",
      security: bearerSecurity,
      parameters: [
        pageParam,
        limitParam,
        queryParam("nome", "Filtra por parte do nome (sem diferenciar maiúsculas).", {
          type: "string",
        }),
      ],
      responses: {
        "200": jsonResponse("Página de especialidades.", "EspecialidadePage"),
        ...errorResponses(400, 401),
      },
    },
    post: {
      tags: ["Especialidades"],
      summary: "Cadastra uma especialidade",
      description: "Perfil: Administrador. O nome deve ser único.",
      security: bearerSecurity,
      requestBody: jsonBody("EspecialidadeInput"),
      responses: {
        "201": jsonResponse("Especialidade criada.", "Especialidade"),
        ...errorResponses(400, 401, 403, 409),
      },
    },
  },
  "/especialidades/{id}": {
    get: {
      tags: ["Especialidades"],
      summary: "Consulta uma especialidade por id",
      description: "Perfis: Administrador e Atendente.",
      security: bearerSecurity,
      parameters: [idParam],
      responses: {
        "200": jsonResponse("Especialidade encontrada.", "Especialidade"),
        ...errorResponses(400, 401, 404),
      },
    },
    put: {
      tags: ["Especialidades"],
      summary: "Atualiza uma especialidade",
      description: "Perfil: Administrador. Substitui nome e descrição.",
      security: bearerSecurity,
      parameters: [idParam],
      requestBody: jsonBody("EspecialidadeInput"),
      responses: {
        "200": jsonResponse("Especialidade atualizada.", "Especialidade"),
        ...errorResponses(400, 401, 403, 404, 409),
      },
    },
    delete: {
      tags: ["Especialidades"],
      summary: "Remove uma especialidade",
      description:
        "Perfil: Administrador. Não é permitido remover uma especialidade que possua médicos vinculados (409).",
      security: bearerSecurity,
      parameters: [idParam],
      responses: {
        "204": { description: "Especialidade removida." },
        ...errorResponses(400, 401, 403, 404, 409),
      },
    },
  },
};
