import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";
import { CreateMedicoDTO } from "../dtos/medico/CreateMedicoDTO";
import { ListMedicosQueryDTO } from "../dtos/medico/ListMedicosQueryDTO";
import { MedicoResponseDTO } from "../dtos/medico/MedicoResponseDTO";
import { UpdateMedicoDTO } from "../dtos/medico/UpdateMedicoDTO";
import { Especialidade } from "../entities/Especialidade";
import { Medico } from "../entities/Medico";
import { AppError } from "../errors/AppError";
import { EspecialidadeRepository } from "../repositories/EspecialidadeRepository";
import { MedicoRepository } from "../repositories/MedicoRepository";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "../utils/database-errors";
import { buildPaginatedResponse, getOffset } from "../utils/pagination";

const CRM_DUPLICADO_MESSAGE: string = "Já existe um médico com este CRM.";
const NAO_ENCONTRADO_MESSAGE: string = "Médico não encontrado.";
const ESPECIALIDADE_NAO_ENCONTRADA_MESSAGE: string =
  "Especialidade informada não encontrada.";
const MEDICO_EM_USO_MESSAGE: string =
  "Médico possui consultas vinculadas e não pode ser removido.";

export class MedicoService {
  private readonly medicoRepository: MedicoRepository;
  private readonly especialidadeRepository: EspecialidadeRepository;

  public constructor() {
    this.medicoRepository = new MedicoRepository();
    this.especialidadeRepository = new EspecialidadeRepository();
  }

  public async list(
    query: ListMedicosQueryDTO,
  ): Promise<PaginatedResponseDTO<MedicoResponseDTO>> {
    const [medicos, total]: [Medico[], number] =
      await this.medicoRepository.findAndCount({
        offset: getOffset(query.page, query.limit),
        limit: query.limit,
        nome: query.nome,
        especialidadeId: query.especialidadeId,
      });

    return buildPaginatedResponse(
      medicos.map(
        (medico: Medico): MedicoResponseDTO => this.toResponse(medico),
      ),
      total,
      query.page,
      query.limit,
    );
  }

  public async findById(id: string): Promise<MedicoResponseDTO> {
    const medico: Medico = await this.getOrFail(id);

    return this.toResponse(medico);
  }

  public async create(data: CreateMedicoDTO): Promise<MedicoResponseDTO> {
    await this.getEspecialidadeOrFail(data.especialidadeId);
    await this.ensureCrmIsAvailable(data.crm);

    const created: Medico = await this.persist(
      (): Promise<Medico> =>
        this.medicoRepository.create({
          nome: data.nome,
          crm: data.crm,
          email: data.email,
          telefone: data.telefone || null,
          especialidadeId: data.especialidadeId,
        }),
    );

    return this.findById(created.id);
  }

  public async update(
    id: string,
    data: UpdateMedicoDTO,
  ): Promise<MedicoResponseDTO> {
    const medico: Medico = await this.getOrFail(id);
    const especialidade: Especialidade = await this.getEspecialidadeOrFail(
      data.especialidadeId,
    );

    await this.ensureCrmIsAvailable(data.crm, id);

    medico.nome = data.nome;
    medico.crm = data.crm;
    medico.email = data.email;
    medico.telefone = data.telefone || null;
    medico.especialidade = especialidade;
    medico.especialidadeId = especialidade.id;

    const updated: Medico = await this.persist(
      (): Promise<Medico> => this.medicoRepository.save(medico),
    );

    return this.toResponse(updated);
  }

  public async remove(id: string): Promise<void> {
    const medico: Medico = await this.getOrFail(id);

    try {
      await this.medicoRepository.remove(medico);
    } catch (error: unknown) {
      if (isForeignKeyViolation(error)) {
        throw new AppError(MEDICO_EM_USO_MESSAGE, 409);
      }

      throw error;
    }
  }

  private async getOrFail(id: string): Promise<Medico> {
    const medico: Medico | null = await this.medicoRepository.findById(id);

    if (!medico) {
      throw new AppError(NAO_ENCONTRADO_MESSAGE, 404);
    }

    return medico;
  }

  private async getEspecialidadeOrFail(id: string): Promise<Especialidade> {
    const especialidade: Especialidade | null =
      await this.especialidadeRepository.findById(id);

    if (!especialidade) {
      throw new AppError(ESPECIALIDADE_NAO_ENCONTRADA_MESSAGE, 404);
    }

    return especialidade;
  }

  private async ensureCrmIsAvailable(
    crm: string,
    excludeId?: string,
  ): Promise<void> {
    const existing: Medico | null = await this.medicoRepository.findByCrm(
      crm,
      excludeId,
    );

    if (existing) {
      throw new AppError(CRM_DUPLICADO_MESSAGE, 409);
    }
  }

  private async persist(operation: () => Promise<Medico>): Promise<Medico> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new AppError(CRM_DUPLICADO_MESSAGE, 409);
      }

      throw error;
    }
  }

  private toResponse(medico: Medico): MedicoResponseDTO {
    return {
      id: medico.id,
      nome: medico.nome,
      crm: medico.crm,
      email: medico.email,
      telefone: medico.telefone,
      especialidade: {
        id: medico.especialidade.id,
        nome: medico.especialidade.nome,
      },
      createdAt: medico.createdAt,
      updatedAt: medico.updatedAt,
    };
  }
}
