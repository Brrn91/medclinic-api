import type { OpenAPIV3 } from "openapi-types";

import {
  bearerSecurity,
  DocSchemas,
  errorResponses,
  jsonResponse,
  limitParam,
  pageParam,
  pageSchema,
} from "./common";

export const relatoriosSchemas: DocSchemas = {
  ConsultasPorStatusItem: {
    type: "object",
    required: ["status", "total"],
    properties: {
      status: { type: "string", enum: ["agendada", "realizada", "cancelada"] },
      total: { type: "integer", example: 12 },
    },
  },
  ConsultasPorStatusResponse: {
    type: "object",
    required: ["data", "total"],
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/ConsultasPorStatusItem" },
      },
      total: { type: "integer", description: "Soma de todas as consultas", example: 12 },
    },
  },
  ConsultasPorMedicoItem: {
    type: "object",
    required: [
      "medicoId",
      "medicoNome",
      "crm",
      "especialidade",
      "totalConsultas",
      "agendadas",
      "realizadas",
      "canceladas",
    ],
    properties: {
      medicoId: { type: "string", format: "uuid" },
      medicoNome: { type: "string", example: "Dra. Helena Costa" },
      crm: { type: "string", example: "98765/RJ" },
      especialidade: { type: "string", example: "Neurologia" },
      totalConsultas: { type: "integer", example: 5 },
      agendadas: { type: "integer", example: 1 },
      realizadas: { type: "integer", example: 3 },
      canceladas: { type: "integer", example: 1 },
    },
  },
  ConsultasPorMedicoPage: pageSchema("ConsultasPorMedicoItem"),
  MedicosPorEspecialidadeItem: {
    type: "object",
    required: ["especialidadeId", "especialidade", "totalMedicos"],
    properties: {
      especialidadeId: { type: "string", format: "uuid" },
      especialidade: { type: "string", example: "Neurologia" },
      totalMedicos: { type: "integer", example: 2 },
    },
  },
  MedicosPorEspecialidadePage: pageSchema("MedicosPorEspecialidadeItem"),
  PacienteComConsultasAgendadasItem: {
    type: "object",
    required: ["pacienteId", "pacienteNome", "totalAgendadas", "proximaConsulta"],
    properties: {
      pacienteId: { type: "string", format: "uuid" },
      pacienteNome: { type: "string", example: "João Pereira" },
      totalAgendadas: { type: "integer", example: 2 },
      proximaConsulta: { type: "string", format: "date-time" },
    },
  },
  PacientesComConsultasAgendadasPage: pageSchema("PacienteComConsultasAgendadasItem"),
};

export const relatoriosPaths: OpenAPIV3.PathsObject = {
  "/relatorios/consultas-por-status": {
    get: {
      tags: ["Relatórios"],
      summary: "Consultas por status",
      description:
        "Perfil: Administrador. Sempre retorna os três status (agendada, realizada, cancelada), inclusive os com total 0.",
      security: bearerSecurity,
      responses: {
        "200": jsonResponse("Totais por status.", "ConsultasPorStatusResponse"),
        ...errorResponses(401, 403),
      },
    },
  },
  "/relatorios/consultas-por-medico": {
    get: {
      tags: ["Relatórios"],
      summary: "Quantidade de consultas por médico",
      description:
        "Perfil: Administrador. Inclui médicos sem consultas e o detalhe por status. Ordenado do maior para o menor total.",
      security: bearerSecurity,
      parameters: [pageParam, limitParam],
      responses: {
        "200": jsonResponse("Página do relatório.", "ConsultasPorMedicoPage"),
        ...errorResponses(400, 401, 403),
      },
    },
  },
  "/relatorios/medicos-por-especialidade": {
    get: {
      tags: ["Relatórios"],
      summary: "Médicos cadastrados por especialidade",
      description:
        "Perfil: Administrador. Inclui especialidades sem médicos. Ordenado do maior para o menor total.",
      security: bearerSecurity,
      parameters: [pageParam, limitParam],
      responses: {
        "200": jsonResponse("Página do relatório.", "MedicosPorEspecialidadePage"),
        ...errorResponses(400, 401, 403),
      },
    },
  },
  "/relatorios/pacientes-com-consultas-agendadas": {
    get: {
      tags: ["Relatórios"],
      summary: "Pacientes com consultas agendadas",
      description:
        "Perfil: Administrador. Lista apenas pacientes com ao menos uma consulta agendada, com a data da próxima. Não expõe o CPF. Ordenado pela próxima consulta.",
      security: bearerSecurity,
      parameters: [pageParam, limitParam],
      responses: {
        "200": jsonResponse("Página do relatório.", "PacientesComConsultasAgendadasPage"),
        ...errorResponses(400, 401, 403),
      },
    },
  },
};
