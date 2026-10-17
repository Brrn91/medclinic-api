import { z } from "zod";

import {
  emailSchema,
  paginationQuerySchema,
  telefoneSchema,
} from "./common.validation";

const BRAZILIAN_UFS: readonly string[] = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const CRM_PATTERN: RegExp = new RegExp(
  `^\\d{4,7}/(${BRAZILIAN_UFS.join("|")})$`,
);

const crmSchema = z
  .string({ error: "crm é obrigatório e deve ser um texto" })
  .trim()
  .toUpperCase()
  .regex(
    CRM_PATTERN,
    "crm deve estar no formato 12345/SC (4 a 7 dígitos, barra e UF válida)",
  );

export const createMedicoSchema = z.object(
  {
    nome: z
      .string({ error: "nome é obrigatório e deve ser um texto" })
      .trim()
      .min(3, "nome deve ter pelo menos 3 caracteres")
      .max(120, "nome deve ter no máximo 120 caracteres"),
    crm: crmSchema,
    email: emailSchema,
    telefone: telefoneSchema.optional(),
    especialidadeId: z.uuid({
      error: "especialidadeId é obrigatório e deve ser um UUID válido",
    }),
  },
  { error: "corpo da requisição deve ser um objeto JSON" },
);

export const updateMedicoSchema = createMedicoSchema;

export const listMedicosQuerySchema = paginationQuerySchema.extend({
  nome: z
    .string({ error: "nome deve ser um texto" })
    .trim()
    .min(1, "nome não pode ser vazio")
    .optional(),
  especialidadeId: z
    .uuid({ error: "especialidadeId deve ser um UUID válido" })
    .optional(),
});
