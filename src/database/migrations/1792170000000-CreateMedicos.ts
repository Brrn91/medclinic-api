import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMedicos1792170000000 implements MigrationInterface {
  name = "CreateMedicos1792170000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "medicos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(120) NOT NULL, "crm" character varying(12) NOT NULL, "email" character varying(150) NOT NULL, "telefone" character varying(11), "especialidade_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_medicos_crm" UNIQUE ("crm"), CONSTRAINT "PK_medicos" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_medicos_especialidade_id" ON "medicos" ("especialidade_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "medicos" ADD CONSTRAINT "FK_medicos_especialidade" FOREIGN KEY ("especialidade_id") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicos" DROP CONSTRAINT "FK_medicos_especialidade"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_medicos_especialidade_id"`,
    );
    await queryRunner.query(`DROP TABLE "medicos"`);
  }
}
