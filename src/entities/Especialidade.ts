import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

import { Medico } from "./Medico";

@Entity({ name: "especialidades" })
@Unique("UQ_especialidades_nome", ["nome"])
export class Especialidade {
  @PrimaryGeneratedColumn("uuid", {
    primaryKeyConstraintName: "PK_especialidades",
  })
  id!: string;

  @Column({ type: "varchar", length: 100 })
  nome!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  descricao!: string | null;

  @OneToMany(() => Medico, (medico) => medico.especialidade)
  medicos!: Medico[];

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
  })
  updatedAt!: Date;
}
