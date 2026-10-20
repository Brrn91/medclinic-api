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

export const medicosSchemas: DocSchemas = {
  Medico: {
    type: "object",
    required: ["id", "nome", "crm", "email", "telefone", "especialidade", "createdAt", "updatedAt"],
    properties: {
      id: { type: "string", format: "uuid" },
      nome: { type: "string", example: "Dr. Carlos Souza" },
      crm: { type: "string", example: "12345/SC" },
      email: { type: "string", format: "email", example: "carlos@medclinic.com" },
      telefone: { type: "string", nullable: true, example: "47999991234" },
      especialidade: {
        type: "object",
        required: ["id", "nome"],
        properties: {
          id: { type: "string", format: "uuid" },
          nome: { type: "string", example: "Ortopedia" },
        },
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  MedicoInput: {
    type: "object",
    required: ["nome", "crm", "email", "especialidadeId"],
    properties: {
      nome: { type: "string", minLength: 3, maxLength: 120, example: "Dr. Carlos Souza" },
      crm: {
        type: "string",
        pattern: "^\\d{4,7}/[A-Z]{2}$",
        description:
          "CRM único, no formato número/UF (4 a 7 dígitos e UF válida). Letras minúsculas são normalizadas para maiúsculas.",
        example: "12345/SC",
      },
      email: { type: "string", format: "email", maxLength: 150, example: "carlos@medclinic.com" },
      telefone: {
        type: "string",
        description: "10 ou 11 dígitos (DDD e número); a pontuação é removida.",
        example: "(47) 99999-1234",
      },
      especialidadeId: {
        type: "string",
        format: "uuid",
        description: "Especialidade existente à qual o médico será vinculado",
      },
    },
  },
  MedicoPage: pageSchema("Medico"),
};

export const medicosPaths: OpenAPIV3.PathsObject = {
  "/medicos": {
    get: {
      tags: ["Médicos"],
      summary: "Lista médicos (paginado, com filtros)",
      description: "Perfis: Administrador e Atendente. Ordenado por nome.",
      security: bearerSecurity,
      parameters: [
        pageParam,
        limitParam,
        queryParam("nome", "Filtra por parte do nome (sem diferenciar maiúsculas).", {
          type: "string",
        }),
        queryParam("especialidadeId", "Filtra por especialidade.", {
          type: "string",
          format: "uuid",
        }),
      ],
      responses: {
        "200": jsonResponse("Página de médicos.", "MedicoPage"),
        ...errorResponses(400, 401),
      },
    },
    post: {
      tags: ["Médicos"],
      summary: "Cadastra um médico",
      description:
        "Perfil: Administrador. A especialidade deve existir (404) e o CRM deve ser único (409).",
      security: bearerSecurity,
      requestBody: jsonBody("MedicoInput"),
      responses: {
        "201": jsonResponse("Médico cadastrado.", "Medico"),
        ...errorResponses(400, 401, 403, 404, 409),
      },
    },
  },
  "/medicos/{id}": {
    get: {
      tags: ["Médicos"],
      summary: "Consulta um médico por id",
      description: "Perfis: Administrador e Atendente.",
      security: bearerSecurity,
      parameters: [idParam],
      responses: {
        "200": jsonResponse("Médico encontrado.", "Medico"),
        ...errorResponses(400, 401, 404),
      },
    },
    put: {
      tags: ["Médicos"],
      summary: "Atualiza um médico",
      description: "Perfil: Administrador. Substitui todos os campos.",
      security: bearerSecurity,
      parameters: [idParam],
      requestBody: jsonBody("MedicoInput"),
      responses: {
        "200": jsonResponse("Médico atualizado.", "Medico"),
        ...errorResponses(400, 401, 403, 404, 409),
      },
    },
    delete: {
      tags: ["Médicos"],
      summary: "Remove um médico",
      description:
        "Perfil: Administrador. Não é permitido remover um médico que possua consultas (409).",
      security: bearerSecurity,
      parameters: [idParam],
      responses: {
        "204": { description: "Médico removido." },
        ...errorResponses(400, 401, 403, 404, 409),
      },
    },
  },
};
