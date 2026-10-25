import { logger } from "../../src/config/logger";
import { Consulta, ConsultaStatus } from "../../src/entities/Consulta";
import { Medico } from "../../src/entities/Medico";
import { Paciente } from "../../src/entities/Paciente";
import { ConsultaRepository } from "../../src/repositories/ConsultaRepository";
import { MedicoRepository } from "../../src/repositories/MedicoRepository";
import { PacienteRepository } from "../../src/repositories/PacienteRepository";
import { ConsultaService } from "../../src/services/ConsultaService";
import { expectAppError } from "../helpers/expectAppError";

jest.mock("../../src/repositories/ConsultaRepository", () => ({
  ConsultaRepository: jest.fn(),
}));
jest.mock("../../src/repositories/MedicoRepository", () => ({
  MedicoRepository: jest.fn(),
}));
jest.mock("../../src/repositories/PacienteRepository", () => ({
  PacienteRepository: jest.fn(),
}));
jest.mock("../../src/config/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const DATA_HORA: Date = new Date("2026-11-10T14:00:00.000Z");

const consultaRepositoryMock = {
  findAndCount: jest.fn<Promise<[Consulta[], number]>, [object]>(),
  findById: jest.fn<Promise<Consulta | null>, [string]>(),
  createIfSlotAvailable: jest.fn<
    Promise<Consulta | null>,
    [object, { start: Date; end: Date }]
  >(),
  updateStatusIfAgendada: jest.fn<
    Promise<boolean>,
    [string, { status: ConsultaStatus; observacoes?: string }]
  >(),
};

const medicoRepositoryMock = {
  findById: jest.fn<Promise<Medico | null>, [string]>(),
};

const pacienteRepositoryMock = {
  findById: jest.fn<Promise<Paciente | null>, [string]>(),
};

function createConsulta(overrides: Partial<Consulta> = {}): Consulta {
  return {
    id: "consulta-1",
    medicoId: "medico-1",
    pacienteId: "paciente-1",
    dataHora: DATA_HORA,
    status: ConsultaStatus.AGENDADA,
    observacoes: null,
    medico: { id: "medico-1", nome: "Dra. Helena Costa", crm: "98765/RJ" },
    paciente: { id: "paciente-1", nome: "João Pereira" },
    createdAt: DATA_HORA,
    updatedAt: DATA_HORA,
    ...overrides,
  } as unknown as Consulta;
}

describe("ConsultaService", () => {
  let service: ConsultaService;

  beforeEach(() => {
    jest
      .mocked(ConsultaRepository)
      .mockImplementation(() => consultaRepositoryMock as unknown as ConsultaRepository);
    jest
      .mocked(MedicoRepository)
      .mockImplementation(() => medicoRepositoryMock as unknown as MedicoRepository);
    jest
      .mocked(PacienteRepository)
      .mockImplementation(
        () => pacienteRepositoryMock as unknown as PacienteRepository,
      );

    service = new ConsultaService();
  });

  describe("create (agendamento)", () => {
    const request = {
      medicoId: "medico-1",
      pacienteId: "paciente-1",
      dataHora: DATA_HORA,
    };

    it("retorna 404 quando o médico não existe e não tenta agendar", async () => {
      medicoRepositoryMock.findById.mockResolvedValue(null);

      await expectAppError(
        service.create(request),
        404,
        "Médico informado não encontrado.",
      );

      expect(consultaRepositoryMock.createIfSlotAvailable).not.toHaveBeenCalled();
    });

    it("retorna 404 quando o paciente não existe e não tenta agendar", async () => {
      medicoRepositoryMock.findById.mockResolvedValue({ id: "medico-1" } as Medico);
      pacienteRepositoryMock.findById.mockResolvedValue(null);

      await expectAppError(
        service.create(request),
        404,
        "Paciente informado não encontrado.",
      );

      expect(consultaRepositoryMock.createIfSlotAvailable).not.toHaveBeenCalled();
    });

    it("retorna 409 quando o horário conflita, usando uma janela de 30 minutos para cada lado", async () => {
      medicoRepositoryMock.findById.mockResolvedValue({ id: "medico-1" } as Medico);
      pacienteRepositoryMock.findById.mockResolvedValue({ id: "paciente-1" } as Paciente);
      consultaRepositoryMock.createIfSlotAvailable.mockResolvedValue(null);

      await expectAppError(service.create(request), 409);

      expect(consultaRepositoryMock.createIfSlotAvailable).toHaveBeenCalledWith(
        { medicoId: "medico-1", pacienteId: "paciente-1", dataHora: DATA_HORA },
        {
          start: new Date("2026-11-10T13:30:00.000Z"),
          end: new Date("2026-11-10T14:30:00.000Z"),
        },
      );
      expect(logger.info).not.toHaveBeenCalled();
    });

    it("agenda a consulta, registra o evento e devolve médico e paciente resumidos", async () => {
      medicoRepositoryMock.findById.mockResolvedValue({ id: "medico-1" } as Medico);
      pacienteRepositoryMock.findById.mockResolvedValue({ id: "paciente-1" } as Paciente);
      consultaRepositoryMock.createIfSlotAvailable.mockResolvedValue(
        createConsulta(),
      );
      consultaRepositoryMock.findById.mockResolvedValue(createConsulta());

      const result = await service.create(request);

      expect(result.status).toBe(ConsultaStatus.AGENDADA);
      expect(result.medico).toEqual({
        id: "medico-1",
        nome: "Dra. Helena Costa",
        crm: "98765/RJ",
      });
      expect(result.paciente).toEqual({ id: "paciente-1", nome: "João Pereira" });
      expect(logger.info).toHaveBeenCalledWith(
        "consulta agendada",
        expect.objectContaining({ consultaId: "consulta-1" }),
      );
    });
  });

  describe("registrarAtendimento", () => {
    it("marca a consulta como realizada, grava as observações e registra o evento", async () => {
      consultaRepositoryMock.findById
        .mockResolvedValueOnce(createConsulta())
        .mockResolvedValueOnce(
          createConsulta({
            status: ConsultaStatus.REALIZADA,
            observacoes: "Retorno em 15 dias.",
          }),
        );
      consultaRepositoryMock.updateStatusIfAgendada.mockResolvedValue(true);

      const result = await service.registrarAtendimento("consulta-1", {
        observacoes: "Retorno em 15 dias.",
      });

      expect(consultaRepositoryMock.updateStatusIfAgendada).toHaveBeenCalledWith(
        "consulta-1",
        { status: ConsultaStatus.REALIZADA, observacoes: "Retorno em 15 dias." },
      );
      expect(result.status).toBe(ConsultaStatus.REALIZADA);
      expect(logger.info).toHaveBeenCalledWith(
        "consulta atendida",
        expect.objectContaining({ consultaId: "consulta-1" }),
      );
    });

    it("não grava as observações clínicas no log", async () => {
      consultaRepositoryMock.findById.mockResolvedValue(createConsulta());
      consultaRepositoryMock.updateStatusIfAgendada.mockResolvedValue(true);

      await service.registrarAtendimento("consulta-1", {
        observacoes: "Diagnóstico sigiloso.",
      });

      expect(JSON.stringify(jest.mocked(logger.info).mock.calls)).not.toContain(
        "Diagnóstico sigiloso.",
      );
    });

    it("retorna 404 quando a consulta não existe", async () => {
      consultaRepositoryMock.findById.mockResolvedValue(null);

      await expectAppError(
        service.registrarAtendimento("inexistente", { observacoes: "texto" }),
        404,
        "Consulta não encontrada.",
      );

      expect(consultaRepositoryMock.updateStatusIfAgendada).not.toHaveBeenCalled();
    });

    it("retorna 409 quando a consulta já foi finalizada (a transição atômica não altera nada)", async () => {
      consultaRepositoryMock.findById.mockResolvedValue(
        createConsulta({ status: ConsultaStatus.REALIZADA }),
      );
      consultaRepositoryMock.updateStatusIfAgendada.mockResolvedValue(false);

      await expectAppError(
        service.registrarAtendimento("consulta-1", { observacoes: "texto" }),
        409,
        "Somente consultas com status 'agendada' podem ser alteradas.",
      );

      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe("cancelar", () => {
    it("cancela a consulta agendada sem alterar as observações", async () => {
      consultaRepositoryMock.findById
        .mockResolvedValueOnce(createConsulta())
        .mockResolvedValueOnce(
          createConsulta({ status: ConsultaStatus.CANCELADA }),
        );
      consultaRepositoryMock.updateStatusIfAgendada.mockResolvedValue(true);

      const result = await service.cancelar("consulta-1");

      expect(consultaRepositoryMock.updateStatusIfAgendada).toHaveBeenCalledWith(
        "consulta-1",
        { status: ConsultaStatus.CANCELADA },
      );
      expect(result.status).toBe(ConsultaStatus.CANCELADA);
    });

    it("retorna 409 ao cancelar uma consulta que já foi realizada ou cancelada", async () => {
      consultaRepositoryMock.findById.mockResolvedValue(
        createConsulta({ status: ConsultaStatus.CANCELADA }),
      );
      consultaRepositoryMock.updateStatusIfAgendada.mockResolvedValue(false);

      await expectAppError(service.cancelar("consulta-1"), 409);
    });
  });

  describe("list", () => {
    it("repassa os filtros, calcula o deslocamento e os metadados de paginação", async () => {
      consultaRepositoryMock.findAndCount.mockResolvedValue([
        [createConsulta(), createConsulta({ id: "consulta-2" })],
        25,
      ]);

      const result = await service.list({
        page: 2,
        limit: 10,
        status: ConsultaStatus.AGENDADA,
        medicoId: "medico-1",
      });

      expect(consultaRepositoryMock.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 10,
          limit: 10,
          status: ConsultaStatus.AGENDADA,
          medicoId: "medico-1",
        }),
      );
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({ total: 25, page: 2, limit: 10, totalPages: 3 });
    });
  });
});
