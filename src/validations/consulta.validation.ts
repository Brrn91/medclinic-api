import { z } from "zod";

import { CLINIC_UTC_OFFSET } from "../config/consulta";
import { ConsultaStatus } from "../entities/Consulta";
import { paginationQuerySchema } from "./common.validation";

const dataHoraSchema = z.iso
  .datetime({
    offset: true,
    error:
      "dataHora é obrigatório e deve estar no formato ISO 8601 com fuso, ex.: 2026-11-10T14:00:00-03:00",
  })
  .transform((value: string): Date => new Date(value))
  .refine(
    (value: Date): boolean => value.getTime() > Date.now(),
    "dataHora deve ser um horário futuro",
  );

export const createConsultaSchema = z.object(
  {
    medicoId: z.uuid({
      error: "medicoId é obrigatório e deve ser um UUID válido",
    }),
    pacienteId: z.uuid({
      error: "pacienteId é obrigatório e deve ser um UUID válido",
    }),
    dataHora: dataHoraSchema,
  },
  { error: "corpo da requisição deve ser um objeto JSON" },
);

export const registrarAtendimentoSchema = z.object(
  {
    observacoes: z
      .string({ error: "observacoes é obrigatório e deve ser um texto" })
      .trim()
      .min(3, "observacoes deve ter pelo menos 3 caracteres")
      .max(2000, "observacoes deve ter no máximo 2000 caracteres"),
  },
  { error: "corpo da requisição deve ser um objeto JSON" },
);

const dataInicioSchema = z.iso
  .date({ error: "dataInicio deve estar no formato AAAA-MM-DD" })
  .transform(
    (value: string): Date =>
      new Date(`${value}T00:00:00.000${CLINIC_UTC_OFFSET}`),
  );

const dataFimSchema = z.iso
  .date({ error: "dataFim deve estar no formato AAAA-MM-DD" })
  .transform(
    (value: string): Date =>
      new Date(`${value}T23:59:59.999${CLINIC_UTC_OFFSET}`),
  );

export const listConsultasQuerySchema = paginationQuerySchema
  .extend({
    status: z
      .enum(ConsultaStatus, {
        error: "status deve ser agendada, realizada ou cancelada",
      })
      .optional(),
    medicoId: z.uuid({ error: "medicoId deve ser um UUID válido" }).optional(),
    pacienteId: z
      .uuid({ error: "pacienteId deve ser um UUID válido" })
      .optional(),
    dataInicio: dataInicioSchema.optional(),
    dataFim: dataFimSchema.optional(),
  })
  .refine(
    (query): boolean =>
      !query.dataInicio ||
      !query.dataFim ||
      query.dataInicio.getTime() <= query.dataFim.getTime(),
    {
      path: ["dataFim"],
      error: "deve ser igual ou posterior a dataInicio",
    },
  );
