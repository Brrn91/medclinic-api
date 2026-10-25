import { Especialidade } from "../../src/entities/Especialidade";
import { EspecialidadeRepository } from "../../src/repositories/EspecialidadeRepository";
import { MedicoRepository } from "../../src/repositories/MedicoRepository";
import { EspecialidadeService } from "../../src/services/EspecialidadeService";
import { expectAppError } from "../helpers/expectAppError";

jest.mock("../../src/repositories/EspecialidadeRepository", () => ({
  EspecialidadeRepository: jest.fn(),
}));
jest.mock("../../src/repositories/MedicoRepository", () => ({
  MedicoRepository: jest.fn(),
}));

const especialidadeRepositoryMock = {
  findAndCount: jest.fn<Promise<[Especialidade[], number]>, [object]>(),
  findById: jest.fn<Promise<Especialidade | null>, [string]>(),
  findByNome: jest.fn<Promise<Especialidade | null>, [string, string?]>(),
  create: jest.fn<
    Promise<Especialidade>,
    [{ nome: string; descricao: string | null }]
  >(),
  save: jest.fn<Promise<Especialidade>, [Especialidade]>(),
  remove: jest.fn<Promise<void>, [Especialidade]>(),
};

const medicoRepositoryMock = {
  existsByEspecialidadeId: jest.fn<Promise<boolean>, [string]>(),
};

function createEspecialidade(
  overrides: Partial<Especialidade> = {},
): Especialidade {
  return {
    id: "esp-1",
    nome: "Cardiologia",
    descricao: "Coração e sistema circulatório",
    createdAt: new Date("2026-10-01T10:00:00.000Z"),
    updatedAt: new Date("2026-10-01T10:00:00.000Z"),
    ...overrides,
  } as Especialidade;
}

function createPostgresError(code: string): Error {
  return Object.assign(new Error(`erro do postgres ${code}`), { code });
}

describe("EspecialidadeService", () => {
  let service: EspecialidadeService;

  beforeEach(() => {
    jest
      .mocked(EspecialidadeRepository)
      .mockImplementation(
        () => especialidadeRepositoryMock as unknown as EspecialidadeRepository,
      );
    jest
      .mocked(MedicoRepository)
      .mockImplementation(() => medicoRepositoryMock as unknown as MedicoRepository);

    service = new EspecialidadeService();
  });

  describe("create", () => {
    it("rejeita nome já existente com 409 e não grava", async () => {
      especialidadeRepositoryMock.findByNome.mockResolvedValue(
        createEspecialidade(),
      );

      await expectAppError(
        service.create({ nome: "cardiologia" }),
        409,
        "Já existe uma especialidade com este nome.",
      );

      expect(especialidadeRepositoryMock.create).not.toHaveBeenCalled();
    });

    it("grava a descrição como null quando ela não é informada", async () => {
      especialidadeRepositoryMock.findByNome.mockResolvedValue(null);
      especialidadeRepositoryMock.create.mockResolvedValue(
        createEspecialidade({ nome: "Neurologia", descricao: null }),
      );

      const result = await service.create({ nome: "Neurologia" });

      expect(especialidadeRepositoryMock.create).toHaveBeenCalledWith({
        nome: "Neurologia",
        descricao: null,
      });
      expect(result.nome).toBe("Neurologia");
      expect(result.descricao).toBeNull();
    });

    it("converte a violação de unicidade do banco (corrida entre requisições) em 409", async () => {
      especialidadeRepositoryMock.findByNome.mockResolvedValue(null);
      especialidadeRepositoryMock.create.mockRejectedValue(
        createPostgresError("23505"),
      );

      await expectAppError(
        service.create({ nome: "Cardiologia" }),
        409,
        "Já existe uma especialidade com este nome.",
      );
    });
  });

  describe("update", () => {
    it("retorna 404 quando a especialidade não existe", async () => {
      especialidadeRepositoryMock.findById.mockResolvedValue(null);

      await expectAppError(
        service.update("esp-inexistente", { nome: "Cardiologia" }),
        404,
        "Especialidade não encontrada.",
      );

      expect(especialidadeRepositoryMock.save).not.toHaveBeenCalled();
    });

    it("rejeita nome usado por outra especialidade, ignorando o próprio registro na checagem", async () => {
      especialidadeRepositoryMock.findById.mockResolvedValue(
        createEspecialidade(),
      );
      especialidadeRepositoryMock.findByNome.mockResolvedValue(
        createEspecialidade({ id: "esp-2", nome: "Ortopedia" }),
      );

      await expectAppError(service.update("esp-1", { nome: "Ortopedia" }), 409);

      expect(especialidadeRepositoryMock.findByNome).toHaveBeenCalledWith(
        "Ortopedia",
        "esp-1",
      );
      expect(especialidadeRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("não remove especialidade com médicos vinculados (409)", async () => {
      especialidadeRepositoryMock.findById.mockResolvedValue(
        createEspecialidade(),
      );
      medicoRepositoryMock.existsByEspecialidadeId.mockResolvedValue(true);

      await expectAppError(
        service.remove("esp-1"),
        409,
        "Não é possível remover a especialidade: existem médicos vinculados.",
      );

      expect(especialidadeRepositoryMock.remove).not.toHaveBeenCalled();
    });

    it("converte a violação de RESTRICT do Postgres (23001) em 409", async () => {
      especialidadeRepositoryMock.findById.mockResolvedValue(
        createEspecialidade(),
      );
      medicoRepositoryMock.existsByEspecialidadeId.mockResolvedValue(false);
      especialidadeRepositoryMock.remove.mockRejectedValue(
        createPostgresError("23001"),
      );

      await expectAppError(service.remove("esp-1"), 409);
    });

    it("remove a especialidade que não tem médicos vinculados", async () => {
      const especialidade: Especialidade = createEspecialidade();
      especialidadeRepositoryMock.findById.mockResolvedValue(especialidade);
      medicoRepositoryMock.existsByEspecialidadeId.mockResolvedValue(false);
      especialidadeRepositoryMock.remove.mockResolvedValue(undefined);

      await expect(service.remove("esp-1")).resolves.toBeUndefined();

      expect(especialidadeRepositoryMock.remove).toHaveBeenCalledWith(
        especialidade,
      );
    });
  });

  describe("list", () => {
    it("calcula o deslocamento e os metadados de paginação", async () => {
      especialidadeRepositoryMock.findAndCount.mockResolvedValue([
        [createEspecialidade(), createEspecialidade({ id: "esp-2" })],
        25,
      ]);

      const result = await service.list({ page: 2, limit: 10, nome: "cardio" });

      expect(especialidadeRepositoryMock.findAndCount).toHaveBeenCalledWith({
        offset: 10,
        limit: 10,
        nome: "cardio",
      });
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({ total: 25, page: 2, limit: 10, totalPages: 3 });
    });
  });
});
