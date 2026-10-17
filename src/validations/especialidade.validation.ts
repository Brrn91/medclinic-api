import { z } from "zod";

import { paginationQuerySchema } from "./common.validation";

export const createEspecialidadeSchema = z.object(
  {
    nome: z
      .string({ error: "nome é obrigatório e deve ser um texto" })
      .trim()
      .min(2, "nome deve ter pelo menos 2 caracteres")
      .max(100, "nome deve ter no máximo 100 caracteres"),
    descricao: z
      .string({ error: "descricao deve ser um texto" })
      .trim()
      .max(255, "descricao deve ter no máximo 255 caracteres")
      .optional(),
  },
  { error: "corpo da requisição deve ser um objeto JSON" },
);

export const updateEspecialidadeSchema = createEspecialidadeSchema;

export const listEspecialidadesQuerySchema = paginationQuerySchema.extend({
  nome: z
    .string({ error: "nome deve ser um texto" })
    .trim()
    .min(1, "nome não pode ser vazio")
    .optional(),
});
