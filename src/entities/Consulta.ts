import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";

import { Medico } from "./Medico";
import { Paciente } from "./Paciente";

export enum ConsultaStatus {
  AGENDADA = "agendada",
  REALIZADA = "realizada",
  CANCELADA = "cancelada",
}

@Entity({ name: "consultas" })
@Index("IDX_consultas_medico_data_hora", ["medicoId", "dataHora"])
@Index("IDX_consultas_paciente_id", ["pacienteId"])
export class Consulta {
  @PrimaryGeneratedColumn("uuid", {
    primaryKeyConstraintName: "PK_consultas",
  })
  id!: string;

  @Column({ name: "medico_id", type: "uuid" })
  medicoId!: string;

  @Column({ name: "paciente_id", type: "uuid" })
  pacienteId!: string;

  @ManyToOne(() => Medico, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "medico_id",
    foreignKeyConstraintName: "FK_consultas_medico",
  })
  medico!: Relation<Medico>;

  @ManyToOne(() => Paciente, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "paciente_id",
    foreignKeyConstraintName: "FK_consultas_paciente",
  })
  paciente!: Relation<Paciente>;

  @Column({ name: "data_hora", type: "timestamptz" })
  dataHora!: Date;

  @Column({
    type: "enum",
    enum: ConsultaStatus,
    default: ConsultaStatus.AGENDADA,
  })
  status!: ConsultaStatus;

  @Column({ type: "text", nullable: true })
  observacoes!: string | null;

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
