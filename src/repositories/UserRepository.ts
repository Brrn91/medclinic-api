import { Repository } from "typeorm";

import { AppDataSource } from "../database/data-source";
import { RegisterUserDTO } from "../dtos/auth/RegisterUserDTO";
import { User } from "../entities/User";

export class UserRepository {
  private readonly repository: Repository<User>;

  public constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  public async create(
    data: RegisterUserDTO,
    passwordHash: string,
  ): Promise<User> {
    const user: User = this.repository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    });

    return this.repository.save(user);
  }
}
