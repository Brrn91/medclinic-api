import type { OpenAPIV3 } from "openapi-types";

import {
  bearerSecurity,
  CONSULTA_DURATION_MINUTES,
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

export const consultasSchemas: DocSchemas = {
  Consulta: {
    type: "object",
    required: ["id", "dataHora", "status", "observacoes", "medico", "paciente", "createdAt", "updatedAt"],
    properties: {
      id: { type: "string", format: "uuid" },
      dataHora: { type: "string", format: "date-time", example: "2026-11-10T14:00:00.000Z" },
      status: { type: "string", enum: ["agendada", "realizada", "cancelada"], example: "agendada" },
      observacoes: {
        type: "string",
        nullable: true,
        description: "Observações/diagnóstico, preenchidos no atendimento",
      },
      medico: {
        type: "object",
        required: ["id", "nome", "crm"],
        properties: {
          id: { type: "string", format: "uuid" },
          nome: { type: "string", example: "Dra. Helena Costa" },
          crm: { type: "string", example: "98765/RJ" },
        },
      },
      paciente: {
        type: "object",
        required: ["id", "nome"],
        properties: {
          id: { type: "string", format: "uuid" },
          nome: { type: "string", example: "João Pereira" },
        },
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  ConsultaInput: {
    type: "object",
    required: ["medicoId", "pacienteId", "dataHora"],
    properties: {
      medicoId: { type: "string", format: "uuid" },
      pacienteId: { type: "string", format: "uuid" },
      dataHora: {
        type: "string",
        format: "date-time",
        description:
          "Data e hora futuras, no formato ISO 8601 com fuso horário (ex.: 2026-11-10T14:00:00-03:00 ou terminado em Z).",
        example: "2026-11-10T14:00:00-03:00",
      },
    },
  },
  AtendimentoInput: {
    type: "object",
    required: ["observacoes"],
    properties: {
      observacoes: {
        type: "string",
        minLength: 3,
        maxLength: 2000,
        description: "Observações/diagnóstico do atendimento",
        example: "Paciente com queixa de cefaleia. Prescrito repouso e retorno em 15 dias.",
      },
    },
  },
  ConsultaPage: pageSchema("Consulta"),
};

const STATUS_FINAL_DESCRIPTION: string =
  "Fluxo de status: agendada -> realizada ou cancelada. Consultas já realizadas ou canceladas não podem ser alteradas (409).";

export const consultasPaths: OpenAPIV3.PathsObject = {
  "/consultas": {
    get: {
      tags: ["Consultas"],
      summary: "Lista consultas (paginado, com filtros)",
      description:
        "Perfis: Administrador e Atendente. Ordenado do horário mais próximo para o mais distante. As datas do filtro usam o fuso de Brasília (UTC-3).",
      security: bearerSecurity,
      parameters: [
        pageParam,
        limitParam,
        queryParam("status", "Filtra por status.", {
          type: "string",
          enum: ["agendada", "realizada", "cancelada"],
        }),
        queryParam("medicoId", "Filtra por médico.", { type: "string", format: "uuid" }),
        queryParam("pacienteId", "Filtra por paciente.", { type: "string", format: "uuid" }),
        queryParam("dataInicio", "Início do intervalo (inclusive), no formato AAAA-MM-DD.", {
          type: "string",
          format: "date",
        }),
        queryParam(
          "dataFim",
          "Fim do intervalo (inclusive, até 23:59:59), no formato AAAA-MM-DD. Deve ser igual ou posterior a dataInicio.",
          { type: "string", format: "date" },
        ),
      ],
      responses: {
        "200": jsonResponse("Página de consultas.", "ConsultaPage"),
        ...errorResponses(400, 401),
      },
    },
    post: {
      tags: ["Consultas"],
      summary: "Agenda uma consulta",
      description: `Perfis: Administrador e Atendente. Valida a existência do médico e do paciente (404) e se o horário é futuro (400). Cada consulta ocupa ${CONSULTA_DURATION_MINUTES} minutos do médico: se o horário se sobrepõe a outra consulta agendada do mesmo médico, retorna 409. Consultas canceladas liberam o horário.`,
      security: bearerSecurity,
      requestBody: jsonBody("ConsultaInput"),
      responses: {
        "201": jsonResponse("Consulta agendada.", "Consulta"),
        ...errorResponses(400, 401, 404, 409),
      },
    },
  },
  "/consultas/{id}": {
    get: {
      tags: ["Consultas"],
      summary: "Consulta uma consulta por id",
      description: "Perfis: Administrador e Atendente.",
      security: bearerSecurity,
      parameters: [idParam],
      responses: {
        "200": jsonResponse("Consulta encontrada.", "Consulta"),
        ...errorResponses(400, 401, 404),
      },
    },
  },
  "/consultas/{id}/atendimento": {
    patch: {
      tags: ["Consultas"],
      summary: "Registra a realização da consulta",
      description: `Perfis: Administrador e Atendente. Muda o status para realizada e grava as observações/diagnóstico. ${STATUS_FINAL_DESCRIPTION}`,
      security: bearerSecurity,
      parameters: [idParam],
      requestBody: jsonBody("AtendimentoInput"),
      responses: {
        "200": jsonResponse("Atendimento registrado.", "Consulta"),
        ...errorResponses(400, 401, 404, 409),
      },
    },
  },
  "/consultas/{id}/cancelamento": {
    patch: {
      tags: ["Consultas"],
      summary: "Cancela a consulta",
      description: `Perfis: Administrador e Atendente. Muda o status para cancelada e libera o horário do médico. ${STATUS_FINAL_DESCRIPTION}`,
      security: bearerSecurity,
      parameters: [idParam],
      responses: {
        "200": jsonResponse("Consulta cancelada.", "Consulta"),
        ...errorResponses(400, 401, 404, 409),
      },
    },
  },
};
