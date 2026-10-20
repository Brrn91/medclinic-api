import { z } from "zod";

import { isValidCpf } from "../utils/cpf";
import { getTodayIsoDate } from "../utils/date";
import {
  emailSchema,
  paginationQuerySchema,
  telefoneSchema,
} from "./common.validation";

const MIN_BIRTH_DATE: string = "1900-01-01";

const cpfSchema = z
  .string({ error: "cpf é obrigatório e deve ser um texto" })
  .trim()
  .transform((value: string): string => value.replace(/\D/g, ""))
  .refine(
    isValidCpf,
    "cpf inválido (informe 11 dígitos válidos, com ou sem pontuação)",
  );

const dataNascimentoSchema = z.iso
  .date({
    error: "dataNascimento é obrigatório e deve estar no formato AAAA-MM-DD",
  })
  .refine(
    (value: string): boolean => value >= MIN_BIRTH_DATE,
    `dataNascimento deve ser igual ou posterior a ${MIN_BIRTH_DATE}`,
  )
  .refine(
    (value: string): boolean => value <= getTodayIsoDate(),
    "dataNascimento não pode ser uma data futura",
  );

export const createPacienteSchema = z.object(
  {
    nome: z
      .string({ error: "nome é obrigatório e deve ser um texto" })
      .trim()
      .min(3, "nome deve ter pelo menos 3 caracteres")
      .max(120, "nome deve ter no máximo 120 caracteres"),
    cpf: cpfSchema,
    dataNascimento: dataNascimentoSchema,
    email: emailSchema,
    telefone: telefoneSchema.optional(),
  },
  { error: "corpo da requisição deve ser um objeto JSON" },
);

export const updatePacienteSchema = createPacienteSchema;

export const listPacientesQuerySchema = paginationQuerySchema.extend({
  nome: z
    .string({ error: "nome deve ser um texto" })
    .trim()
    .min(1, "nome não pode ser vazio")
    .optional(),
});
