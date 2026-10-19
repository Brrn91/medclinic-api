import { EntityManager, Repository, UpdateResult } from "typeorm";

import { AppDataSource } from "../database/data-source";
import { Consulta, ConsultaStatus } from "../entities/Consulta";

interface FindAndCountParams {
  offset: number;
  limit: number;
  status?: ConsultaStatus | undefined;
  medicoId?: string | undefined;
  pacienteId?: string | undefined;
  dataInicio?: Date | undefined;
  dataFim?: Date | undefined;
}

interface CreateConsultaData {
  medicoId: string;
  pacienteId: string;
  dataHora: Date;
}

interface ConflictWindow {
  start: Date;
  end: Date;
}

interface StatusChange {
  status: ConsultaStatus;
  observacoes?: string | undefined;
}

export class ConsultaRepository {
  private readonly repository: Repository<Consulta>;

  public constructor() {
    this.repository = AppDataSource.getRepository(Consulta);
  }

  public async findAndCount(
    params: FindAndCountParams,
  ): Promise<[Consulta[], number]> {
    const query = this.repository
      .createQueryBuilder("consulta")
      .leftJoinAndSelect("consulta.medico", "medico")
      .leftJoinAndSelect("consulta.paciente", "paciente")
      .orderBy("consulta.dataHora", "ASC")
      .addOrderBy("consulta.id", "ASC")
      .skip(params.offset)
      .take(params.limit);

    if (params.status) {
      query.andWhere("consulta.status = :status", { status: params.status });
    }

    if (params.medicoId) {
      query.andWhere("consulta.medicoId = :medicoId", {
        medicoId: params.medicoId,
      });
    }

    if (params.pacienteId) {
      query.andWhere("consulta.pacienteId = :pacienteId", {
        pacienteId: params.pacienteId,
      });
    }

    if (params.dataInicio) {
      query.andWhere("consulta.dataHora >= :dataInicio", {
        dataInicio: params.dataInicio,
      });
    }

    if (params.dataFim) {
      query.andWhere("consulta.dataHora <= :dataFim", {
        dataFim: params.dataFim,
      });
    }

    return query.getManyAndCount();
  }

  public async findById(id: string): Promise<Consulta | null> {
    return this.repository.findOne({
      where: { id },
      relations: { medico: true, paciente: true },
    });
  }

  public async createIfSlotAvailable(
    data: CreateConsultaData,
    conflictWindow: ConflictWindow,
  ): Promise<Consulta | null> {
    return AppDataSource.transaction(
      async (manager: EntityManager): Promise<Consulta | null> => {
        await manager.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
          data.medicoId,
        ]);

        const consultaRepository: Repository<Consulta> =
          manager.getRepository(Consulta);

        const hasConflict: boolean = await consultaRepository
          .createQueryBuilder("consulta")
          .where("consulta.medicoId = :medicoId", { medicoId: data.medicoId })
          .andWhere("consulta.status = :status", {
            status: ConsultaStatus.AGENDADA,
          })
          .andWhere("consulta.dataHora > :start", {
            start: conflictWindow.start,
          })
          .andWhere("consulta.dataHora < :end", { end: conflictWindow.end })
          .getExists();

        if (hasConflict) {
          return null;
        }

        const consulta: Consulta = consultaRepository.create({
          medicoId: data.medicoId,
          pacienteId: data.pacienteId,
          dataHora: data.dataHora,
        });

        return consultaRepository.save(consulta);
      },
    );
  }

  public async updateStatusIfAgendada(
    id: string,
    change: StatusChange,
  ): Promise<boolean> {
    const result: UpdateResult = await this.repository.update(
      { id, status: ConsultaStatus.AGENDADA },
      change.observacoes === undefined
        ? { status: change.status }
        : { status: change.status, observacoes: change.observacoes },
    );

    return (result.affected ?? 0) > 0;
  }
}
