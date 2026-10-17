import { Repository } from "typeorm";

import { AppDataSource } from "../database/data-source";
import { Especialidade } from "../entities/Especialidade";

interface FindAndCountParams {
  offset: number;
  limit: number;
  nome?: string | undefined;
}

interface CreateEspecialidadeData {
  nome: string;
  descricao: string | null;
}

export class EspecialidadeRepository {
  private readonly repository: Repository<Especialidade>;

  public constructor() {
    this.repository = AppDataSource.getRepository(Especialidade);
  }

  public async findAndCount(
    params: FindAndCountParams,
  ): Promise<[Especialidade[], number]> {
    const query = this.repository
      .createQueryBuilder("especialidade")
      .orderBy("especialidade.nome", "ASC")
      .skip(params.offset)
      .take(params.limit);

    if (params.nome) {
      query.where("LOWER(especialidade.nome) LIKE LOWER(:nome)", {
        nome: `%${params.nome}%`,
      });
    }

    return query.getManyAndCount();
  }

  public async findById(id: string): Promise<Especialidade | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  public async findByNome(
    nome: string,
    excludeId?: string,
  ): Promise<Especialidade | null> {
    const query = this.repository
      .createQueryBuilder("especialidade")
      .where("LOWER(especialidade.nome) = LOWER(:nome)", { nome });

    if (excludeId) {
      query.andWhere("especialidade.id <> :excludeId", { excludeId });
    }

    return query.getOne();
  }

  public async create(data: CreateEspecialidadeData): Promise<Especialidade> {
    const especialidade: Especialidade = this.repository.create({
      nome: data.nome,
      descricao: data.descricao,
    });

    return this.repository.save(especialidade);
  }

  public async save(especialidade: Especialidade): Promise<Especialidade> {
    return this.repository.save(especialidade);
  }

  public async remove(especialidade: Especialidade): Promise<void> {
    await this.repository.remove(especialidade);
  }
}
