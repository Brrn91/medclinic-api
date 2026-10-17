import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from "typeorm";

import { Especialidade } from "./Especialidade";

@Entity({ name: "medicos" })
@Unique("UQ_medicos_crm", ["crm"])
@Index("IDX_medicos_especialidade_id", ["especialidadeId"])
export class Medico {
  @PrimaryGeneratedColumn("uuid", {
    primaryKeyConstraintName: "PK_medicos",
  })
  id!: string;

  @Column({ type: "varchar", length: 120 })
  nome!: string;

  @Column({ type: "varchar", length: 12 })
  crm!: string;

  @Column({ type: "varchar", length: 150 })
  email!: string;

  @Column({ type: "varchar", length: 11, nullable: true })
  telefone!: string | null;

  @Column({ name: "especialidade_id", type: "uuid" })
  especialidadeId!: string;

  @ManyToOne(() => Especialidade, (especialidade) => especialidade.medicos, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "especialidade_id",
    foreignKeyConstraintName: "FK_medicos_especialidade",
  })
  especialidade!: Relation<Especialidade>;

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
