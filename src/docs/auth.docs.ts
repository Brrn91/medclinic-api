import type { OpenAPIV3 } from "openapi-types";

import {
  bearerSecurity,
  DocSchemas,
  errorResponses,
  jsonBody,
  jsonResponse,
} from "./common";

export const authSchemas: DocSchemas = {
  UserResponse: {
    type: "object",
    required: ["id", "name", "email", "role", "createdAt"],
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "Ana Atendente" },
      email: { type: "string", format: "email", example: "ana@medclinic.com" },
      role: {
        type: "string",
        enum: ["ADMIN", "ATTENDANT"],
        description: "Perfil de acesso (RBAC)",
        example: "ATTENDANT",
      },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  RegisterRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", example: "Ana Atendente" },
      email: { type: "string", format: "email", example: "ana@medclinic.com" },
      password: {
        type: "string",
        format: "password",
        minLength: 8,
        example: "senha12345",
      },
    },
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "admin@medclinic.com" },
      password: { type: "string", format: "password", example: "senha12345" },
    },
  },
  AuthResponse: {
    type: "object",
    required: ["token", "user"],
    properties: {
      token: {
        type: "string",
        description: "Token JWT com expiração. Use no botão Authorize.",
      },
      user: { $ref: "#/components/schemas/UserResponse" },
    },
  },
  StatusMessageResponse: {
    type: "object",
    required: ["status", "message"],
    properties: {
      status: { type: "string", example: "ok" },
      message: { type: "string", example: "MedClinic API está em funcionamento" },
    },
  },
};

export const authPaths: OpenAPIV3.PathsObject = {
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Cadastra um novo usuário",
      description:
        "Cria um usuário com perfil Atendente (ATTENDANT). A senha é armazenada com hash e nunca é retornada. Esta rota tem limite de requisições mais restrito (proteção contra força bruta).",
      requestBody: jsonBody("RegisterRequest"),
      responses: {
        "201": jsonResponse("Usuário cadastrado.", "UserResponse"),
        ...errorResponses(400, 409),
      },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Autentica o usuário e emite o token JWT",
      description:
        "Valida e-mail e senha e devolve um token JWT com expiração. Use o token no botão **Authorize** para testar as rotas protegidas. Esta rota tem limite de requisições mais restrito.",
      requestBody: jsonBody("LoginRequest"),
      responses: {
        "200": jsonResponse("Login realizado.", "AuthResponse"),
        ...errorResponses(400, 401),
      },
    },
  },
  "/users/me": {
    get: {
      tags: ["Users"],
      summary: "Dados do usuário autenticado",
      description: "Retorna o usuário identificado pelo token. Qualquer perfil.",
      security: bearerSecurity,
      responses: {
        "200": jsonResponse("Usuário autenticado.", "UserResponse"),
        ...errorResponses(401, 404),
      },
    },
  },
  "/admin/ping": {
    get: {
      tags: ["Admin"],
      summary: "Verifica o acesso administrativo",
      description: "Rota de verificação do RBAC. Somente o perfil Administrador.",
      security: bearerSecurity,
      responses: {
        "200": jsonResponse("Acesso administrativo autorizado.", "StatusMessageResponse"),
        ...errorResponses(401, 403),
      },
    },
  },
  "/health": {
    get: {
      tags: ["Sistema"],
      summary: "Verifica se a API está em funcionamento",
      responses: {
        "200": jsonResponse("API em funcionamento.", "StatusMessageResponse"),
        ...errorResponses(),
      },
    },
  },
};
