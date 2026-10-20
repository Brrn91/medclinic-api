import { Repository } from "typeorm";

import { AppDataSource } from "../database/data-source";
import { Consulta, ConsultaStatus } from "../entities/Consulta";
import { Especialidade } from "../entities/Especialidade";
import { Medico } from "../entities/Medico";
import { Paciente } from "../entities/Paciente";

interface PaginationParams {
  offset: number;
  limit: number;
}

interface RawStatusRow {
  status: ConsultaStatus;
  total: string;
}

interface RawMedicoRow {
  medico_id: string;
  medico_nome: string;
  crm: string;
  especialidade_nome: string;
  total_consultas: string;
  agendadas: string;
  realizadas: string;
  canceladas: string;
}

interface RawEspecialidadeRow {
  especialidade_id: string;
  especialidade_nome: string;
  total_medicos: string;
}

interface RawPacienteRow {
  paciente_id: string;
  paciente_nome: string;
  total_agendadas: string;
  proxima_consulta: Date;
}

export interface StatusCount {
  status: ConsultaStatus;
  total: number;
}

export interface MedicoConsultasCount {
  medicoId: string;
  medicoNome: string;
  crm: string;
  especialidade: string;
  totalConsultas: number;
  agendadas: number;
  realizadas: number;
  canceladas: number;
}

export interface EspecialidadeMedicosCount {
  especialidadeId: string;
  especialidade: string;
  totalMedicos: number;
}

export interface PacienteAgendadas {
  pacienteId: string;
  pacienteNome: string;
  totalAgendadas: number;
  proximaConsulta: Date;
}

export class RelatorioRepository {
  private readonly consultaRepository: Repository<Consulta>;
  private readonly medicoRepository: Repository<Medico>;
  private readonly especialidadeRepository: Repository<Especialidade>;
  private readonly pacienteRepository: Repository<Paciente>;

  public constructor() {
    this.consultaRepository = AppDataSource.getRepository(Consulta);
    this.medicoRepository = AppDataSource.getRepository(Medico);
    this.especialidadeRepository = AppDataSource.getRepository(Especialidade);
    this.pacienteRepository = AppDataSource.getRepository(Paciente);
  }

  public async countConsultasByStatus(): Promise<StatusCount[]> {
    const rows: RawStatusRow[] = await this.consultaRepository
      .createQueryBuilder("consulta")
      .select("consulta.status", "status")
      .addSelect("COUNT(consulta.id)", "total")
      .groupBy("consulta.status")
      .getRawMany<RawStatusRow>();

    return rows.map(
      (row: RawStatusRow): StatusCount => ({
        status: row.status,
        total: Number(row.total),
      }),
    );
  }

  public async countConsultasByMedico(
    pagination: PaginationParams,
  ): Promise<MedicoConsultasCount[]> {
    const rows: RawMedicoRow[] = await this.medicoRepository
      .createQueryBuilder("medico")
      .innerJoin("medico.especialidade", "especialidade")
      .leftJoin(Consulta, "consulta", "consulta.medicoId = medico.id")
      .select("medico.id", "medico_id")
      .addSelect("medico.nome", "medico_nome")
      .addSelect("medico.crm", "crm")
      .addSelect("especialidade.nome", "especialidade_nome")
      .addSelect("COUNT(consulta.id)", "total_consultas")
      .addSelect(
        `COUNT(consulta.id) FILTER (WHERE consulta.status = '${ConsultaStatus.AGENDADA}')`,
        "agendadas",
      )
      .addSelect(
        `COUNT(consulta.id) FILTER (WHERE consulta.status = '${ConsultaStatus.REALIZADA}')`,
        "realizadas",
      )
      .addSelect(
        `COUNT(consulta.id) FILTER (WHERE consulta.status = '${ConsultaStatus.CANCELADA}')`,
        "canceladas",
      )
      .groupBy("medico.id")
      .addGroupBy("especialidade.id")
      .orderBy("total_consultas", "DESC")
      .addOrderBy("medico.nome", "ASC")
      .offset(pagination.offset)
      .limit(pagination.limit)
      .getRawMany<RawMedicoRow>();

    return rows.map(
      (row: RawMedicoRow): MedicoConsultasCount => ({
        medicoId: row.medico_id,
        medicoNome: row.medico_nome,
        crm: row.crm,
        especialidade: row.especialidade_nome,
        totalConsultas: Number(row.total_consultas),
        agendadas: Number(row.agendadas),
        realizadas: Number(row.realizadas),
        canceladas: Number(row.canceladas),
      }),
    );
  }

  public async countMedicos(): Promise<number> {
    return this.medicoRepository.count();
  }

  public async countMedicosByEspecialidade(
    pagination: PaginationParams,
  ): Promise<EspecialidadeMedicosCount[]> {
    const rows: RawEspecialidadeRow[] = await this.especialidadeRepository
      .createQueryBuilder("especialidade")
      .leftJoin("especialidade.medicos", "medico")
      .select("especialidade.id", "especialidade_id")
      .addSelect("especialidade.nome", "especialidade_nome")
      .addSelect("COUNT(medico.id)", "total_medicos")
      .groupBy("especialidade.id")
      .orderBy("total_medicos", "DESC")
      .addOrderBy("especialidade.nome", "ASC")
      .offset(pagination.offset)
      .limit(pagination.limit)
      .getRawMany<RawEspecialidadeRow>();

    return rows.map(
      (row: RawEspecialidadeRow): EspecialidadeMedicosCount => ({
        especialidadeId: row.especialidade_id,
        especialidade: row.especialidade_nome,
        totalMedicos: Number(row.total_medicos),
      }),
    );
  }

  public async countEspecialidades(): Promise<number> {
    return this.especialidadeRepository.count();
  }

  public async findPacientesComConsultasAgendadas(
    pagination: PaginationParams,
  ): Promise<PacienteAgendadas[]> {
    const rows: RawPacienteRow[] = await this.pacienteRepository
      .createQueryBuilder("paciente")
      .innerJoin(
        Consulta,
        "consulta",
        "consulta.pacienteId = paciente.id AND consulta.status = :status",
        { status: ConsultaStatus.AGENDADA },
      )
      .select("paciente.id", "paciente_id")
      .addSelect("paciente.nome", "paciente_nome")
      .addSelect("COUNT(consulta.id)", "total_agendadas")
      .addSelect("MIN(consulta.dataHora)", "proxima_consulta")
      .groupBy("paciente.id")
      .orderBy("proxima_consulta", "ASC")
      .addOrderBy("paciente.nome", "ASC")
      .offset(pagination.offset)
      .limit(pagination.limit)
      .getRawMany<RawPacienteRow>();

    return rows.map(
      (row: RawPacienteRow): PacienteAgendadas => ({
        pacienteId: row.paciente_id,
        pacienteNome: row.paciente_nome,
        totalAgendadas: Number(row.total_agendadas),
        proximaConsulta: row.proxima_consulta,
      }),
    );
  }

  public async countPacientesComConsultasAgendadas(): Promise<number> {
    const result: { total: string } | undefined = await this.consultaRepository
      .createQueryBuilder("consulta")
      .select("COUNT(DISTINCT consulta.pacienteId)", "total")
      .where("consulta.status = :status", { status: ConsultaStatus.AGENDADA })
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }
}
