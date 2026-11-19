import { AppDataSource } from "../../../src/database/data-source";
import { assertIsTestDatabase } from "./test-database";

interface IdRow {
  id: string;
}

interface DatabaseNameRow {
  name: string;
}

let sequence: number = 0;

function nextSequence(): number {
  sequence += 1;
  return sequence;
}

function firstId(rows: IdRow[]): string {
  const id: string | undefined = rows[0]?.id;

  if (!id) {
    throw new Error("O INSERT não retornou um id.");
  }

  return id;
}

export async function resetDatabase(): Promise<void> {
  const rows: DatabaseNameRow[] = await AppDataSource.query(
    "SELECT current_database() AS name",
  );

  assertIsTestDatabase(rows[0]?.name ?? "");

  await AppDataSource.query(
    "TRUNCATE TABLE consultas, medicos, pacientes, especialidades CASCADE",
  );
}

export async function seedMedico(): Promise<string> {
  const n: number = nextSequence();

  const especialidade: IdRow[] = await AppDataSource.query(
    `INSERT INTO especialidades (nome) VALUES ($1)
     ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
     RETURNING id`,
    ["Cardiologia"],
  );

  const medico: IdRow[] = await AppDataSource.query(
    `INSERT INTO medicos (nome, crm, email, especialidade_id)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [`Médico ${n}`, `${100000 + n}/SC`, `medico${n}@teste.com`, firstId(especialidade)],
  );

  return firstId(medico);
}

export async function seedPaciente(): Promise<string> {
  const n: number = nextSequence();

  const paciente: IdRow[] = await AppDataSource.query(
    `INSERT INTO pacientes (nome, cpf, data_nascimento, email)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [`Paciente ${n}`, String(10_000_000_000 + n), "1990-01-01", `paciente${n}@teste.com`],
  );

  return firstId(paciente);
}
