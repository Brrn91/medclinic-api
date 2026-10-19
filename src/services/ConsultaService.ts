import { CONSULTA_DURATION_MINUTES } from "../config/consulta";
import { logger } from "../config/logger";
import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";
import { ConsultaResponseDTO } from "../dtos/consulta/ConsultaResponseDTO";
import { CreateConsultaDTO } from "../dtos/consulta/CreateConsultaDTO";
import { ListConsultasQueryDTO } from "../dtos/consulta/ListConsultasQueryDTO";
import { RegistrarAtendimentoDTO } from "../dtos/consulta/RegistrarAtendimentoDTO";
import { Consulta, ConsultaStatus } from "../entities/Consulta";
import { AppError } from "../errors/AppError";
import { ConsultaRepository } from "../repositories/ConsultaRepository";
import { MedicoRepository } from "../repositories/MedicoRepository";
import { PacienteRepository } from "../repositories/PacienteRepository";
import { buildPaginatedResponse, getOffset } from "../utils/pagination";

const MILLISECONDS_PER_MINUTE: number = 60_000;

const NAO_ENCONTRADA_MESSAGE: string = "Consulta não encontrada.";
const MEDICO_NAO_ENCONTRADO_MESSAGE: string =
  "Médico informado não encontrado.";
const PACIENTE_NAO_ENCONTRADO_MESSAGE: string =
  "Paciente informado não encontrado.";
const HORARIO_INDISPONIVEL_MESSAGE: string = `O médico já possui consulta agendada neste horário ou em horário que se sobrepõe (cada consulta ocupa ${CONSULTA_DURATION_MINUTES} minutos).`;
const STATUS_FINAL_MESSAGE: string =
  "Somente consultas com status 'agendada' podem ser alteradas.";

export class ConsultaService {
  private readonly consultaRepository: ConsultaRepository;
  private readonly medicoRepository: MedicoRepository;
  private readonly pacienteRepository: PacienteRepository;

  public constructor() {
    this.consultaRepository = new ConsultaRepository();
    this.medicoRepository = new MedicoRepository();
    this.pacienteRepository = new PacienteRepository();
  }

  public async list(
    query: ListConsultasQueryDTO,
  ): Promise<PaginatedResponseDTO<ConsultaResponseDTO>> {
    const [consultas, total]: [Consulta[], number] =
      await this.consultaRepository.findAndCount({
        offset: getOffset(query.page, query.limit),
        limit: query.limit,
        status: query.status,
        medicoId: query.medicoId,
        pacienteId: query.pacienteId,
        dataInicio: query.dataInicio,
        dataFim: query.dataFim,
      });

    return buildPaginatedResponse(
      consultas.map(
        (consulta: Consulta): ConsultaResponseDTO => this.toResponse(consulta),
      ),
      total,
      query.page,
      query.limit,
    );
  }

  public async findById(id: string): Promise<ConsultaResponseDTO> {
    const consulta: Consulta = await this.getOrFail(id);

    return this.toResponse(consulta);
  }

  public async create(data: CreateConsultaDTO): Promise<ConsultaResponseDTO> {
    await this.ensureMedicoExists(data.medicoId);
    await this.ensurePacienteExists(data.pacienteId);

    const windowMs: number =
      CONSULTA_DURATION_MINUTES * MILLISECONDS_PER_MINUTE;
    const startTime: number = data.dataHora.getTime();

    const created: Consulta | null =
      await this.consultaRepository.createIfSlotAvailable(
        {
          medicoId: data.medicoId,
          pacienteId: data.pacienteId,
          dataHora: data.dataHora,
        },
        {
          start: new Date(startTime - windowMs),
          end: new Date(startTime + windowMs),
        },
      );

    if (!created) {
      throw new AppError(HORARIO_INDISPONIVEL_MESSAGE, 409);
    }

    logger.info("consulta agendada", {
      consultaId: created.id,
      medicoId: created.medicoId,
      pacienteId: created.pacienteId,
      dataHora: created.dataHora.toISOString(),
    });

    return this.findById(created.id);
  }

  public async registrarAtendimento(
    id: string,
    data: RegistrarAtendimentoDTO,
  ): Promise<ConsultaResponseDTO> {
    return this.changeStatus(id, "consulta atendida", {
      status: ConsultaStatus.REALIZADA,
      observacoes: data.observacoes,
    });
  }

  public async cancelar(id: string): Promise<ConsultaResponseDTO> {
    return this.changeStatus(id, "consulta cancelada", {
      status: ConsultaStatus.CANCELADA,
    });
  }

  private async changeStatus(
    id: string,
    eventMessage: string,
    change: { status: ConsultaStatus; observacoes?: string },
  ): Promise<ConsultaResponseDTO> {
    const consulta: Consulta = await this.getOrFail(id);

    const changed: boolean =
      await this.consultaRepository.updateStatusIfAgendada(id, change);

    if (!changed) {
      throw new AppError(STATUS_FINAL_MESSAGE, 409);
    }

    logger.info(eventMessage, {
      consultaId: id,
      medicoId: consulta.medicoId,
      pacienteId: consulta.pacienteId,
      status: change.status,
    });

    return this.findById(id);
  }

  private async getOrFail(id: string): Promise<Consulta> {
    const consulta: Consulta | null =
      await this.consultaRepository.findById(id);

    if (!consulta) {
      throw new AppError(NAO_ENCONTRADA_MESSAGE, 404);
    }

    return consulta;
  }

  private async ensureMedicoExists(medicoId: string): Promise<void> {
    if (!(await this.medicoRepository.findById(medicoId))) {
      throw new AppError(MEDICO_NAO_ENCONTRADO_MESSAGE, 404);
    }
  }

  private async ensurePacienteExists(pacienteId: string): Promise<void> {
    if (!(await this.pacienteRepository.findById(pacienteId))) {
      throw new AppError(PACIENTE_NAO_ENCONTRADO_MESSAGE, 404);
    }
  }

  private toResponse(consulta: Consulta): ConsultaResponseDTO {
    return {
      id: consulta.id,
      dataHora: consulta.dataHora,
      status: consulta.status,
      observacoes: consulta.observacoes,
      medico: {
        id: consulta.medico.id,
        nome: consulta.medico.nome,
        crm: consulta.medico.crm,
      },
      paciente: {
        id: consulta.paciente.id,
        nome: consulta.paciente.nome,
      },
      createdAt: consulta.createdAt,
      updatedAt: consulta.updatedAt,
    };
  }
}
