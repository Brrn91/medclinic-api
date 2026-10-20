import { Repository } from "typeorm";

import { AppDataSource } from "../database/data-source";
import { Medico } from "../entities/Medico";

interface FindAndCountParams {
  offset: number;
  limit: number;
  nome?: string | undefined;
  especialidadeId?: string | undefined;
}

interface CreateMedicoData {
  nome: string;
  crm: string;
  email: string;
  telefone: string | null;
  especialidadeId: string;
}

export class MedicoRepository {
  private readonly repository: Repository<Medico>;

  public constructor() {
    this.repository = AppDataSource.getRepository(Medico);
  }

  public async findAndCount(
    params: FindAndCountParams,
  ): Promise<[Medico[], number]> {
    const query = this.repository
      .createQueryBuilder("medico")
      .leftJoinAndSelect("medico.especialidade", "especialidade")
      .orderBy("medico.nome", "ASC")
      .addOrderBy("medico.id", "ASC")
      .skip(params.offset)
      .take(params.limit);

    if (params.nome) {
      query.andWhere("LOWER(medico.nome) LIKE LOWER(:nome)", {
        nome: `%${params.nome}%`,
      });
    }

    if (params.especialidadeId) {
      query.andWhere("medico.especialidadeId = :especialidadeId", {
        especialidadeId: params.especialidadeId,
      });
    }

    return query.getManyAndCount();
  }

  public async findById(id: string): Promise<Medico | null> {
    return this.repository.findOne({
      where: { id },
      relations: { especialidade: true },
    });
  }

  public async findByCrm(
    crm: string,
    excludeId?: string,
  ): Promise<Medico | null> {
    const query = this.repository
      .createQueryBuilder("medico")
      .where("medico.crm = :crm", { crm });

    if (excludeId) {
      query.andWhere("medico.id <> :excludeId", { excludeId });
    }

    return query.getOne();
  }

  public async existsByEspecialidadeId(
    especialidadeId: string,
  ): Promise<boolean> {
    return this.repository.exists({
      where: { especialidadeId },
    });
  }

  public async create(data: CreateMedicoData): Promise<Medico> {
    const medico: Medico = this.repository.create({
      nome: data.nome,
      crm: data.crm,
      email: data.email,
      telefone: data.telefone,
      especialidadeId: data.especialidadeId,
    });

    return this.repository.save(medico);
  }

  public async save(medico: Medico): Promise<Medico> {
    return this.repository.save(medico);
  }

  public async remove(medico: Medico): Promise<void> {
    await this.repository.remove(medico);
  }
}
