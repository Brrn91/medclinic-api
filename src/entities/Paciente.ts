import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "pacientes" })
@Unique("UQ_pacientes_cpf", ["cpf"])
export class Paciente {
  @PrimaryGeneratedColumn("uuid", {
    primaryKeyConstraintName: "PK_pacientes",
  })
  id!: string;

  @Column({ type: "varchar", length: 120 })
  nome!: string;

  @Column({ type: "varchar", length: 11 })
  cpf!: string;

  @Column({ name: "data_nascimento", type: "date" })
  dataNascimento!: string;

  @Column({ type: "varchar", length: 150 })
  email!: string;

  @Column({ type: "varchar", length: 11, nullable: true })
  telefone!: string | null;

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
