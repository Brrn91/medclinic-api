import { AppDataSource } from "../../src/database/data-source";
import { Consulta, ConsultaStatus } from "../../src/entities/Consulta";
import { AppError } from "../../src/errors/AppError";
import { ConsultaService } from "../../src/services/ConsultaService";
import { resetDatabase, seedMedico, seedPaciente } from "./support/fixtures";

jest.mock("../../src/config/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const PARALLEL_REQUESTS: number = 8;
const BASE_TIME: number = Date.UTC(2030, 0, 15, 14, 0, 0);
const MILLISECONDS_PER_MINUTE: number = 60_000;

interface Outcome {
  succeeded: number;
  conflicts: number;
  unexpected: unknown[];
}

function slot(minutesAfterBase: number): Date {
  return new Date(BASE_TIME + minutesAfterBase * MILLISECONDS_PER_MINUTE);
}

function summarize(results: PromiseSettledResult<unknown>[]): Outcome {
  const outcome: Outcome = { succeeded: 0, conflicts: 0, unexpected: [] };

  for (const result of results) {
    if (result.status === "fulfilled") {
      outcome.succeeded += 1;
    } else if (
      result.reason instanceof AppError &&
      result.reason.statusCode === 409
    ) {
      outcome.conflicts += 1;
    } else {
      outcome.unexpected.push(result.reason);
    }
  }

  return outcome;
}

async function countAgendadas(medicoId: string): Promise<number> {
  return AppDataSource.getRepository(Consulta).countBy({
    medicoId,
    status: ConsultaStatus.AGENDADA,
  });
}

describe("ConsultaService (integração com PostgreSQL)", () => {
  let service: ConsultaService;

  beforeAll(async () => {
    await AppDataSource.initialize();
    service = new ConsultaService();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it("aceita só uma entre várias requisições simultâneas para o mesmo médico e horário", async () => {
    const medicoId: string = await seedMedico();
    const pacienteIds: string[] = await Promise.all(
      Array.from({ length: PARALLEL_REQUESTS }, () => seedPaciente()),
    );

    const results = await Promise.allSettled(
      pacienteIds.map((pacienteId: string) =>
        service.create({ medicoId, pacienteId, dataHora: slot(0) }),
      ),
    );

    expect(summarize(results)).toEqual({
      succeeded: 1,
      conflicts: PARALLEL_REQUESTS - 1,
      unexpected: [],
    });
    expect(await countAgendadas(medicoId)).toBe(1);
  });

  it("aceita só uma entre requisições simultâneas em horários que se sobrepõem", async () => {
    const medicoId: string = await seedMedico();
    const offsets: number[] = [0, 10, 20, 29];
    const requests = await Promise.all(
      offsets.map(async (offset: number) => ({
        offset,
        pacienteId: await seedPaciente(),
      })),
    );

    const results = await Promise.allSettled(
      requests.map(({ offset, pacienteId }) =>
        service.create({ medicoId, pacienteId, dataHora: slot(offset) }),
      ),
    );

    expect(summarize(results)).toEqual({
      succeeded: 1,
      conflicts: offsets.length - 1,
      unexpected: [],
    });
    expect(await countAgendadas(medicoId)).toBe(1);
  });

  it("não bloqueia agendamentos simultâneos de médicos diferentes", async () => {
    const medicoIds: string[] = await Promise.all([seedMedico(), seedMedico()]);
    const pacienteId: string = await seedPaciente();

    const results = await Promise.allSettled(
      medicoIds.map((medicoId: string) =>
        service.create({ medicoId, pacienteId, dataHora: slot(0) }),
      ),
    );

    expect(summarize(results)).toEqual({
      succeeded: 2,
      conflicts: 0,
      unexpected: [],
    });
  });

  it("aceita consultas simultâneas em horários exatamente adjacentes (30 min)", async () => {
    const medicoId: string = await seedMedico();
    const pacienteId: string = await seedPaciente();

    const results = await Promise.allSettled(
      [0, 30].map((offset: number) =>
        service.create({ medicoId, pacienteId, dataHora: slot(offset) }),
      ),
    );

    expect(summarize(results)).toEqual({
      succeeded: 2,
      conflicts: 0,
      unexpected: [],
    });
  });

  it("libera o horário quando a consulta é cancelada", async () => {
    const medicoId: string = await seedMedico();
    const pacienteId: string = await seedPaciente();
    const data = { medicoId, pacienteId, dataHora: slot(0) };

    const first = await service.create(data);

    await expect(service.create(data)).rejects.toMatchObject({
      statusCode: 409,
    });

    await service.cancelar(first.id);

    const second = await service.create(data);

    expect(second.id).not.toBe(first.id);
  });

  it("permite só uma mudança de status quando cancelar e atender chegam juntas", async () => {
    const medicoId: string = await seedMedico();
    const pacienteId: string = await seedPaciente();
    const consulta = await service.create({
      medicoId,
      pacienteId,
      dataHora: slot(0),
    });

    const results = await Promise.allSettled([
      service.cancelar(consulta.id),
      service.registrarAtendimento(consulta.id, {
        observacoes: "Paciente atendido.",
      }),
    ]);

    expect(summarize(results)).toEqual({
      succeeded: 1,
      conflicts: 1,
      unexpected: [],
    });
  });
});
