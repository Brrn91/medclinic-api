import { Repository } from "typeorm";

import { AppDataSource } from "../database/data-source";
import { Paciente } from "../entities/Paciente";

interface FindAndCountParams {
  offset: number;
  limit: number;
  nome?: string | undefined;
}

interface CreatePacienteData {
  nome: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  telefone: string | null;
}

export class PacienteRepository {
  private readonly repository: Repository<Paciente>;

  public constructor() {
    this.repository = AppDataSource.getRepository(Paciente);
  }

  public async findAndCount(
    params: FindAndCountParams,
  ): Promise<[Paciente[], number]> {
    const query = this.repository
      .createQueryBuilder("paciente")
      .orderBy("paciente.nome", "ASC")
      .addOrderBy("paciente.id", "ASC")
      .skip(params.offset)
      .take(params.limit);

    if (params.nome) {
      query.andWhere("LOWER(paciente.nome) LIKE LOWER(:nome)", {
        nome: `%${params.nome}%`,
      });
    }

    return query.getManyAndCount();
  }

  public async findById(id: string): Promise<Paciente | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  public async findByCpf(
    cpf: string,
    excludeId?: string,
  ): Promise<Paciente | null> {
    const query = this.repository
      .createQueryBuilder("paciente")
      .where("paciente.cpf = :cpf", { cpf });

    if (excludeId) {
      query.andWhere("paciente.id <> :excludeId", { excludeId });
    }

    return query.getOne();
  }

  public async create(data: CreatePacienteData): Promise<Paciente> {
    const paciente: Paciente = this.repository.create({
      nome: data.nome,
      cpf: data.cpf,
      dataNascimento: data.dataNascimento,
      email: data.email,
      telefone: data.telefone,
    });

    return this.repository.save(paciente);
  }

  public async save(paciente: Paciente): Promise<Paciente> {
    return this.repository.save(paciente);
  }

  public async remove(paciente: Paciente): Promise<void> {
    await this.repository.remove(paciente);
  }
}
