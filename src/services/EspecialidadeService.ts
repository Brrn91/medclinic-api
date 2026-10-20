import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";
import { CreateEspecialidadeDTO } from "../dtos/especialidade/CreateEspecialidadeDTO";
import { EspecialidadeResponseDTO } from "../dtos/especialidade/EspecialidadeResponseDTO";
import { ListEspecialidadesQueryDTO } from "../dtos/especialidade/ListEspecialidadesQueryDTO";
import { UpdateEspecialidadeDTO } from "../dtos/especialidade/UpdateEspecialidadeDTO";
import { Especialidade } from "../entities/Especialidade";
import { AppError } from "../errors/AppError";
import { EspecialidadeRepository } from "../repositories/EspecialidadeRepository";
import { MedicoRepository } from "../repositories/MedicoRepository";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "../utils/database-errors";
import { buildPaginatedResponse, getOffset } from "../utils/pagination";

const NOME_DUPLICADO_MESSAGE: string =
  "Já existe uma especialidade com este nome.";
const NAO_ENCONTRADA_MESSAGE: string = "Especialidade não encontrada.";
const EM_USO_MESSAGE: string =
  "Não é possível remover a especialidade: existem médicos vinculados.";

export class EspecialidadeService {
  private readonly especialidadeRepository: EspecialidadeRepository;
  private readonly medicoRepository: MedicoRepository;

  public constructor() {
    this.especialidadeRepository = new EspecialidadeRepository();
    this.medicoRepository = new MedicoRepository();
  }

  public async list(
    query: ListEspecialidadesQueryDTO,
  ): Promise<PaginatedResponseDTO<EspecialidadeResponseDTO>> {
    const [especialidades, total]: [Especialidade[], number] =
      await this.especialidadeRepository.findAndCount({
        offset: getOffset(query.page, query.limit),
        limit: query.limit,
        nome: query.nome,
      });

    return buildPaginatedResponse(
      especialidades.map(
        (especialidade: Especialidade): EspecialidadeResponseDTO =>
          this.toResponse(especialidade),
      ),
      total,
      query.page,
      query.limit,
    );
  }

  public async findById(id: string): Promise<EspecialidadeResponseDTO> {
    const especialidade: Especialidade = await this.getOrFail(id);

    return this.toResponse(especialidade);
  }

  public async create(
    data: CreateEspecialidadeDTO,
  ): Promise<EspecialidadeResponseDTO> {
    await this.ensureNomeIsAvailable(data.nome);

    const especialidade: Especialidade = await this.persist(
      (): Promise<Especialidade> =>
        this.especialidadeRepository.create({
          nome: data.nome,
          descricao: data.descricao || null,
        }),
    );

    return this.toResponse(especialidade);
  }

  public async update(
    id: string,
    data: UpdateEspecialidadeDTO,
  ): Promise<EspecialidadeResponseDTO> {
    const especialidade: Especialidade = await this.getOrFail(id);

    await this.ensureNomeIsAvailable(data.nome, id);

    especialidade.nome = data.nome;
    especialidade.descricao = data.descricao || null;

    const updated: Especialidade = await this.persist(
      (): Promise<Especialidade> =>
        this.especialidadeRepository.save(especialidade),
    );

    return this.toResponse(updated);
  }

  public async remove(id: string): Promise<void> {
    const especialidade: Especialidade = await this.getOrFail(id);

    if (await this.medicoRepository.existsByEspecialidadeId(id)) {
      throw new AppError(EM_USO_MESSAGE, 409);
    }

    try {
      await this.especialidadeRepository.remove(especialidade);
    } catch (error: unknown) {
      if (isForeignKeyViolation(error)) {
        throw new AppError(EM_USO_MESSAGE, 409);
      }

      throw error;
    }
  }

  private async getOrFail(id: string): Promise<Especialidade> {
    const especialidade: Especialidade | null =
      await this.especialidadeRepository.findById(id);

    if (!especialidade) {
      throw new AppError(NAO_ENCONTRADA_MESSAGE, 404);
    }

    return especialidade;
  }

  private async ensureNomeIsAvailable(
    nome: string,
    excludeId?: string,
  ): Promise<void> {
    const existing: Especialidade | null =
      await this.especialidadeRepository.findByNome(nome, excludeId);

    if (existing) {
      throw new AppError(NOME_DUPLICADO_MESSAGE, 409);
    }
  }

  private async persist(
    operation: () => Promise<Especialidade>,
  ): Promise<Especialidade> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new AppError(NOME_DUPLICADO_MESSAGE, 409);
      }

      throw error;
    }
  }

  private toResponse(especialidade: Especialidade): EspecialidadeResponseDTO {
    return {
      id: especialidade.id,
      nome: especialidade.nome,
      descricao: especialidade.descricao,
      createdAt: especialidade.createdAt,
      updatedAt: especialidade.updatedAt,
    };
  }
}
