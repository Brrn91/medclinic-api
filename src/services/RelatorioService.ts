import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";
import { PaginationQueryDTO } from "../dtos/common/PaginationQueryDTO";
import { ConsultasPorMedicoItemDTO } from "../dtos/relatorio/ConsultasPorMedicoItemDTO";
import {
  ConsultasPorStatusItemDTO,
  ConsultasPorStatusResponseDTO,
} from "../dtos/relatorio/ConsultasPorStatusDTO";
import { MedicosPorEspecialidadeItemDTO } from "../dtos/relatorio/MedicosPorEspecialidadeItemDTO";
import { PacientesComConsultasAgendadasItemDTO } from "../dtos/relatorio/PacientesComConsultasAgendadasItemDTO";
import { ConsultaStatus } from "../entities/Consulta";
import {
  EspecialidadeMedicosCount,
  MedicoConsultasCount,
  PacienteAgendadas,
  RelatorioRepository,
  StatusCount,
} from "../repositories/RelatorioRepository";
import { buildPaginatedResponse, getOffset } from "../utils/pagination";

export class RelatorioService {
  private readonly relatorioRepository: RelatorioRepository;

  public constructor() {
    this.relatorioRepository = new RelatorioRepository();
  }

  public async consultasPorStatus(): Promise<ConsultasPorStatusResponseDTO> {
    const counts: StatusCount[] =
      await this.relatorioRepository.countConsultasByStatus();

    const totalsByStatus: Map<ConsultaStatus, number> = new Map(
      counts.map((count: StatusCount): [ConsultaStatus, number] => [
        count.status,
        count.total,
      ]),
    );

    const data: ConsultasPorStatusItemDTO[] = Object.values(ConsultaStatus).map(
      (status: ConsultaStatus): ConsultasPorStatusItemDTO => ({
        status,
        total: totalsByStatus.get(status) ?? 0,
      }),
    );

    return {
      data,
      total: data.reduce(
        (sum: number, item: ConsultasPorStatusItemDTO): number =>
          sum + item.total,
        0,
      ),
    };
  }

  public async consultasPorMedico(
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<ConsultasPorMedicoItemDTO>> {
    const [items, total]: [MedicoConsultasCount[], number] = await Promise.all([
      this.relatorioRepository.countConsultasByMedico({
        offset: getOffset(query.page, query.limit),
        limit: query.limit,
      }),
      this.relatorioRepository.countMedicos(),
    ]);

    return buildPaginatedResponse(
      items.map(
        (item: MedicoConsultasCount): ConsultasPorMedicoItemDTO => ({
          ...item,
        }),
      ),
      total,
      query.page,
      query.limit,
    );
  }

  public async medicosPorEspecialidade(
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<MedicosPorEspecialidadeItemDTO>> {
    const [items, total]: [EspecialidadeMedicosCount[], number] =
      await Promise.all([
        this.relatorioRepository.countMedicosByEspecialidade({
          offset: getOffset(query.page, query.limit),
          limit: query.limit,
        }),
        this.relatorioRepository.countEspecialidades(),
      ]);

    return buildPaginatedResponse(
      items.map(
        (item: EspecialidadeMedicosCount): MedicosPorEspecialidadeItemDTO => ({
          ...item,
        }),
      ),
      total,
      query.page,
      query.limit,
    );
  }

  public async pacientesComConsultasAgendadas(
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<PacientesComConsultasAgendadasItemDTO>> {
    const [items, total]: [PacienteAgendadas[], number] = await Promise.all([
      this.relatorioRepository.findPacientesComConsultasAgendadas({
        offset: getOffset(query.page, query.limit),
        limit: query.limit,
      }),
      this.relatorioRepository.countPacientesComConsultasAgendadas(),
    ]);

    return buildPaginatedResponse(
      items.map(
        (item: PacienteAgendadas): PacientesComConsultasAgendadasItemDTO => ({
          ...item,
        }),
      ),
      total,
      query.page,
      query.limit,
    );
  }
}
