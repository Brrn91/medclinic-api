import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";
import { CreatePacienteDTO } from "../dtos/paciente/CreatePacienteDTO";
import { ListPacientesQueryDTO } from "../dtos/paciente/ListPacientesQueryDTO";
import { PacienteResponseDTO } from "../dtos/paciente/PacienteResponseDTO";
import { UpdatePacienteDTO } from "../dtos/paciente/UpdatePacienteDTO";
import { Paciente } from "../entities/Paciente";
import { AppError } from "../errors/AppError";
import { PacienteRepository } from "../repositories/PacienteRepository";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "../utils/database-errors";
import { buildPaginatedResponse, getOffset } from "../utils/pagination";

const CPF_DUPLICADO_MESSAGE: string = "Já existe um paciente com este CPF.";
const NAO_ENCONTRADO_MESSAGE: string = "Paciente não encontrado.";
const PACIENTE_EM_USO_MESSAGE: string =
  "Paciente possui consultas vinculadas e não pode ser removido.";

export class PacienteService {
  private readonly pacienteRepository: PacienteRepository;

  public constructor() {
    this.pacienteRepository = new PacienteRepository();
  }

  public async list(
    query: ListPacientesQueryDTO,
  ): Promise<PaginatedResponseDTO<PacienteResponseDTO>> {
    const [pacientes, total]: [Paciente[], number] =
      await this.pacienteRepository.findAndCount({
        offset: getOffset(query.page, query.limit),
        limit: query.limit,
        nome: query.nome,
      });

    return buildPaginatedResponse(
      pacientes.map(
        (paciente: Paciente): PacienteResponseDTO => this.toResponse(paciente),
      ),
      total,
      query.page,
      query.limit,
    );
  }

  public async findById(id: string): Promise<PacienteResponseDTO> {
    const paciente: Paciente = await this.getOrFail(id);

    return this.toResponse(paciente);
  }

  public async create(data: CreatePacienteDTO): Promise<PacienteResponseDTO> {
    await this.ensureCpfIsAvailable(data.cpf);

    const paciente: Paciente = await this.persist(
      (): Promise<Paciente> =>
        this.pacienteRepository.create({
          nome: data.nome,
          cpf: data.cpf,
          dataNascimento: data.dataNascimento,
          email: data.email,
          telefone: data.telefone || null,
        }),
    );

    return this.toResponse(paciente);
  }

  public async update(
    id: string,
    data: UpdatePacienteDTO,
  ): Promise<PacienteResponseDTO> {
    const paciente: Paciente = await this.getOrFail(id);

    await this.ensureCpfIsAvailable(data.cpf, id);

    paciente.nome = data.nome;
    paciente.cpf = data.cpf;
    paciente.dataNascimento = data.dataNascimento;
    paciente.email = data.email;
    paciente.telefone = data.telefone || null;

    const updated: Paciente = await this.persist(
      (): Promise<Paciente> => this.pacienteRepository.save(paciente),
    );

    return this.toResponse(updated);
  }

  public async remove(id: string): Promise<void> {
    const paciente: Paciente = await this.getOrFail(id);

    try {
      await this.pacienteRepository.remove(paciente);
    } catch (error: unknown) {
      if (isForeignKeyViolation(error)) {
        throw new AppError(PACIENTE_EM_USO_MESSAGE, 409);
      }

      throw error;
    }
  }

  private async getOrFail(id: string): Promise<Paciente> {
    const paciente: Paciente | null =
      await this.pacienteRepository.findById(id);

    if (!paciente) {
      throw new AppError(NAO_ENCONTRADO_MESSAGE, 404);
    }

    return paciente;
  }

  private async ensureCpfIsAvailable(
    cpf: string,
    excludeId?: string,
  ): Promise<void> {
    const existing: Paciente | null = await this.pacienteRepository.findByCpf(
      cpf,
      excludeId,
    );

    if (existing) {
      throw new AppError(CPF_DUPLICADO_MESSAGE, 409);
    }
  }

  private async persist(operation: () => Promise<Paciente>): Promise<Paciente> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new AppError(CPF_DUPLICADO_MESSAGE, 409);
      }

      throw error;
    }
  }

  private toResponse(paciente: Paciente): PacienteResponseDTO {
    return {
      id: paciente.id,
      nome: paciente.nome,
      cpf: paciente.cpf,
      dataNascimento: paciente.dataNascimento,
      email: paciente.email,
      telefone: paciente.telefone,
      createdAt: paciente.createdAt,
      updatedAt: paciente.updatedAt,
    };
  }
}
