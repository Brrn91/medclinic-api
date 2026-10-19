import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConsultas1792190000000 implements MigrationInterface {
  name = "CreateConsultas1792190000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."consultas_status_enum" AS ENUM('agendada', 'realizada', 'cancelada')`,
    );
    await queryRunner.query(
      `CREATE TABLE "consultas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "medico_id" uuid NOT NULL, "paciente_id" uuid NOT NULL, "data_hora" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."consultas_status_enum" NOT NULL DEFAULT 'agendada', "observacoes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_consultas" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_consultas_medico_data_hora" ON "consultas" ("medico_id", "data_hora")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_consultas_paciente_id" ON "consultas" ("paciente_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "consultas" ADD CONSTRAINT "FK_consultas_medico" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consultas" ADD CONSTRAINT "FK_consultas_paciente" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "consultas" DROP CONSTRAINT "FK_consultas_paciente"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consultas" DROP CONSTRAINT "FK_consultas_medico"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_consultas_paciente_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_consultas_medico_data_hora"`,
    );
    await queryRunner.query(`DROP TABLE "consultas"`);
    await queryRunner.query(`DROP TYPE "public"."consultas_status_enum"`);
  }
}
