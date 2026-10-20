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

export const pacientesSchemas: DocSchemas = {
  Paciente: {
    type: "object",
    required: ["id", "nome", "cpf", "dataNascimento", "email", "telefone", "createdAt", "updatedAt"],
    properties: {
      id: { type: "string", format: "uuid" },
      nome: { type: "string", example: "Maria Oliveira" },
      cpf: { type: "string", description: "Apenas dígitos", example: "52998224725" },
      dataNascimento: { type: "string", format: "date", example: "1990-05-20" },
      email: { type: "string", format: "email", example: "maria@email.com" },
      telefone: { type: "string", nullable: true, example: "4733334444" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  PacienteInput: {
    type: "object",
    required: ["nome", "cpf", "dataNascimento", "email"],
    properties: {
      nome: { type: "string", minLength: 3, maxLength: 120, example: "Maria Oliveira" },
      cpf: {
        type: "string",
        description:
          "CPF único e válido (11 dígitos com dígitos verificadores corretos), com ou sem pontuação. É gravado apenas com dígitos.",
        example: "529.982.247-25",
      },
      dataNascimento: {
        type: "string",
        format: "date",
        description: "AAAA-MM-DD, existente, não futura e a partir de 1900-01-01.",
        example: "1990-05-20",
      },
      email: { type: "string", format: "email", maxLength: 150, example: "maria@email.com" },
      telefone: {
        type: "string",
        description: "10 ou 11 dígitos (DDD e número); a pontuação é removida.",
        example: "(47) 3333-4444",
      },
    },
  },
  PacientePage: pageSchema("Paciente"),
};

export const pacientesPaths: OpenAPIV3.PathsObject = {
  "/pacientes": {
    get: {
      tags: ["Pacientes"],
      summary: "Lista pacientes (paginado, com filtro por nome)",
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
        "200": jsonResponse("Página de pacientes.", "PacientePage"),
        ...errorResponses(400, 401),
      },
    },
    post: {
      tags: ["Pacientes"],
      summary: "Cadastra um paciente",
      description: "Perfis: Administrador e Atendente. O CPF deve ser válido e único (409).",
      security: bearerSecurity,
      requestBody: jsonBody("PacienteInput"),
      responses: {
        "201": jsonResponse("Paciente cadastrado.", "Paciente"),
        ...errorResponses(400, 401, 409),
      },
    },
  },
  "/pacientes/{id}": {
    get: {
      tags: ["Pacientes"],
      summary: "Consulta um paciente por id",
      description: "Perfis: Administrador e Atendente.",
      security: bearerSecurity,
      parameters: [idParam],
      responses: {
        "200": jsonResponse("Paciente encontrado.", "Paciente"),
        ...errorResponses(400, 401, 404),
      },
    },
    put: {
      tags: ["Pacientes"],
      summary: "Atualiza um paciente",
      description: "Perfis: Administrador e Atendente. Substitui todos os campos.",
      security: bearerSecurity,
      parameters: [idParam],
      requestBody: jsonBody("PacienteInput"),
      responses: {
        "200": jsonResponse("Paciente atualizado.", "Paciente"),
        ...errorResponses(400, 401, 404, 409),
      },
    },
    delete: {
      tags: ["Pacientes"],
      summary: "Remove um paciente",
      description:
        "Perfil: Administrador. Não é permitido remover um paciente que possua consultas (409).",
      security: bearerSecurity,
      parameters: [idParam],
      responses: {
        "204": { description: "Paciente removido." },
        ...errorResponses(400, 401, 403, 404, 409),
      },
    },
  },
};
