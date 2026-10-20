import type { OpenAPIV3 } from "openapi-types";
import { RequestHandler } from "express";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";

import { authPaths, authSchemas } from "../docs/auth.docs";
import {
  commonParameters,
  commonResponses,
  commonSchemas,
  securitySchemes,
} from "../docs/common";
import { consultasPaths, consultasSchemas } from "../docs/consultas.docs";
import {
  especialidadesPaths,
  especialidadesSchemas,
} from "../docs/especialidades.docs";
import { medicosPaths, medicosSchemas } from "../docs/medicos.docs";
import { pacientesPaths, pacientesSchemas } from "../docs/pacientes.docs";
import { relatoriosPaths, relatoriosSchemas } from "../docs/relatorios.docs";

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "MedClinic API",
    version: "1.0.0",
    description: [
      "API REST para gerenciamento de uma clínica médica: especialidades, médicos, pacientes, consultas e relatórios, protegida por JWT e controle de acesso por perfil (RBAC).",
      "",
      "**Como testar as rotas protegidas:** faça `POST /auth/login`, copie o `token` da resposta, clique em **Authorize** e cole o token.",
      "",
      "Perfis: **ADMIN** (acesso completo) e **ATTENDANT** (acesso operacional restrito).",
    ].join("\n"),
  },
  servers: [{ url: "/", description: "Servidor atual" }],
  tags: [
    { name: "Auth", description: "Cadastro e login" },
    { name: "Users", description: "Usuário autenticado" },
    { name: "Admin", description: "Verificação de acesso administrativo" },
    { name: "Especialidades", description: "RF01" },
    { name: "Médicos", description: "RF02" },
    { name: "Pacientes", description: "RF03" },
    { name: "Consultas", description: "RF04, RF05, RF06 e RF07" },
    { name: "Relatórios", description: "RF08 (somente Administrador)" },
    { name: "Sistema", description: "Saúde da aplicação" },
  ],
  paths: {
    ...authPaths,
    ...especialidadesPaths,
    ...medicosPaths,
    ...pacientesPaths,
    ...consultasPaths,
    ...relatoriosPaths,
  },
  components: {
    securitySchemes,
    parameters: commonParameters,
    responses: commonResponses,
    schemas: {
      ...commonSchemas,
      ...authSchemas,
      ...especialidadesSchemas,
      ...medicosSchemas,
      ...pacientesSchemas,
      ...consultasSchemas,
      ...relatoriosSchemas,
    },
  },
};

const swaggerUiOptions: SwaggerUiOptions = {
  customSiteTitle: "MedClinic API - Documentação",
  swaggerOptions: {
    persistAuthorization: true,
  },
};

export const swaggerHandlers: RequestHandler[] = [
  ...swaggerUi.serve,
  swaggerUi.setup({ ...swaggerDocument }, swaggerUiOptions),
];
