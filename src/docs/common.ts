import type { OpenAPIV3 } from "openapi-types";

import { CONSULTA_DURATION_MINUTES } from "../config/consulta";
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from "../validations/common.validation";

export type DocSchemas = Record<string, OpenAPIV3.SchemaObject>;

export { CONSULTA_DURATION_MINUTES };

export function schemaRef(name: string): OpenAPIV3.ReferenceObject {
  return { $ref: `#/components/schemas/${name}` };
}

export function jsonBody(schemaName: string): OpenAPIV3.RequestBodyObject {
  return {
    required: true,
    content: { "application/json": { schema: schemaRef(schemaName) } },
  };
}

export function jsonResponse(
  description: string,
  schemaName: string,
): OpenAPIV3.ResponseObject {
  return {
    description,
    content: { "application/json": { schema: schemaRef(schemaName) } },
  };
}

export function pageSchema(itemSchemaName: string): OpenAPIV3.SchemaObject {
  return {
    type: "object",
    required: ["data", "meta"],
    properties: {
      data: { type: "array", items: schemaRef(itemSchemaName) },
      meta: schemaRef("PaginationMeta"),
    },
  };
}

export const bearerSecurity: OpenAPIV3.SecurityRequirementObject[] = [
  { bearerAuth: [] },
];

export const idParam: OpenAPIV3.ReferenceObject = {
  $ref: "#/components/parameters/IdParam",
};

export const pageParam: OpenAPIV3.ReferenceObject = {
  $ref: "#/components/parameters/PageParam",
};

export const limitParam: OpenAPIV3.ReferenceObject = {
  $ref: "#/components/parameters/LimitParam",
};

export function queryParam(
  name: string,
  description: string,
  schema: OpenAPIV3.SchemaObject,
): OpenAPIV3.ParameterObject {
  return { name, in: "query", required: false, description, schema };
}

const ERROR_RESPONSE_NAMES: Record<number, string> = {
  400: "BadRequest",
  401: "Unauthorized",
  403: "Forbidden",
  404: "NotFound",
  409: "Conflict",
  429: "TooManyRequests",
  500: "InternalServerError",
};

export function errorResponses(
  ...statusCodes: number[]
): OpenAPIV3.ResponsesObject {
  const codes: number[] = [...new Set([...statusCodes, 429, 500])].sort(
    (a: number, b: number): number => a - b,
  );
  const responses: OpenAPIV3.ResponsesObject = {};

  for (const code of codes) {
    const name: string | undefined = ERROR_RESPONSE_NAMES[code];

    if (name === undefined) {
      throw new Error(`Status ${code} sem resposta de erro padronizada`);
    }

    responses[String(code)] = { $ref: `#/components/responses/${name}` };
  }

  return responses;
}

function errorResponse(
  description: string,
  message: string,
): OpenAPIV3.ResponseObject {
  return {
    description,
    content: {
      "application/json": {
        schema: schemaRef("ErrorResponse"),
        example: { status: "error", message },
      },
    },
  };
}

export const commonSchemas: DocSchemas = {
  ErrorResponse: {
    type: "object",
    required: ["status", "message"],
    properties: {
      status: { type: "string", enum: ["error"], example: "error" },
      message: { type: "string", example: "Descrição clara do problema." },
    },
  },
  PaginationMeta: {
    type: "object",
    required: ["total", "page", "limit", "totalPages"],
    properties: {
      total: { type: "integer", description: "Total de registros", example: 42 },
      page: { type: "integer", description: "Página atual", example: 1 },
      limit: { type: "integer", description: "Itens por página", example: 10 },
      totalPages: { type: "integer", description: "Total de páginas", example: 5 },
    },
  },
};

export const commonParameters: Record<string, OpenAPIV3.ParameterObject> = {
  IdParam: {
    name: "id",
    in: "path",
    required: true,
    description: "Identificador (UUID) do registro",
    schema: { type: "string", format: "uuid" },
  },
  PageParam: {
    name: "page",
    in: "query",
    required: false,
    description: "Número da página (começa em 1)",
    schema: { type: "integer", minimum: 1, default: 1 },
  },
  LimitParam: {
    name: "limit",
    in: "query",
    required: false,
    description: `Itens por página (máximo ${MAX_PAGE_LIMIT})`,
    schema: {
      type: "integer",
      minimum: 1,
      maximum: MAX_PAGE_LIMIT,
      default: DEFAULT_PAGE_LIMIT,
    },
  },
};

export const commonResponses: Record<string, OpenAPIV3.ResponseObject> = {
  BadRequest: errorResponse(
    "Dados inválidos (campo obrigatório ausente, tipo ou formato incorreto).",
    "nome: nome deve ter pelo menos 2 caracteres",
  ),
  Unauthorized: errorResponse(
    "Não autenticado: token ausente, inválido ou expirado.",
    "Token de autenticação não informado.",
  ),
  Forbidden: errorResponse(
    "Perfil sem permissão para acessar o recurso.",
    "Usuário sem permissão para acessar este recurso.",
  ),
  NotFound: errorResponse("Registro inexistente.", "Registro não encontrado."),
  Conflict: errorResponse(
    "Conflito: duplicidade ou violação de regra de negócio.",
    "Já existe um registro com estes dados.",
  ),
  TooManyRequests: errorResponse(
    "Limite de requisições excedido (rate limit). Tente novamente mais tarde.",
    "Limite de 100 requisições a cada 15 minuto(s) excedido. Tente novamente mais tarde.",
  ),
  InternalServerError: errorResponse(
    "Falha inesperada no servidor.",
    "Erro interno do servidor",
  ),
};

export const securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject> = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description:
      "Token JWT obtido em POST /auth/login. Informe apenas o token (o prefixo Bearer é adicionado automaticamente).",
  },
};
