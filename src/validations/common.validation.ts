import { z } from "zod";

import { AppError } from "../errors/AppError";

export const DEFAULT_PAGE_LIMIT: number = 10;
export const MAX_PAGE_LIMIT: number = 100;

export const idParamSchema = z.object(
  {
    id: z.uuid({ error: "id deve ser um UUID válido" }),
  },
  { error: "parâmetros da rota inválidos" },
);

export const paginationQuerySchema = z.object(
  {
    page: z.coerce
      .number({ error: "page deve ser um número inteiro" })
      .int("page deve ser um número inteiro")
      .min(1, "page deve ser maior ou igual a 1")
      .default(1),
    limit: z.coerce
      .number({ error: "limit deve ser um número inteiro" })
      .int("limit deve ser um número inteiro")
      .min(1, "limit deve ser maior ou igual a 1")
      .max(MAX_PAGE_LIMIT, `limit deve ser no máximo ${MAX_PAGE_LIMIT}`)
      .default(DEFAULT_PAGE_LIMIT),
  },
  { error: "parâmetros de consulta inválidos" },
);

export const emailSchema = z
  .string({ error: "email é obrigatório e deve ser um texto" })
  .trim()
  .toLowerCase()
  .max(150, "email deve ter no máximo 150 caracteres")
  .pipe(z.email({ error: "email inválido" }));

export const telefoneSchema = z
  .string({ error: "telefone deve ser um texto" })
  .trim()
  .transform((value: string): string => value.replace(/\D/g, ""))
  .refine(
    (value: string): boolean => /^\d{10,11}$/.test(value),
    "telefone deve ter 10 ou 11 dígitos (DDD e número)",
  );

export function parseWith<S extends z.ZodType>(
  schema: S,
  data: unknown,
): z.infer<S> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message: string = result.error.issues
      .map((issue): string => {
        const field: string = issue.path.map(String).join(".");

        return field ? `${field}: ${issue.message}` : issue.message;
      })
      .join("; ");

    throw new AppError(message, 400);
  }

  return result.data;
}
