import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePacientes1792180000000 implements MigrationInterface {
  name = "CreatePacientes1792180000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pacientes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(120) NOT NULL, "cpf" character varying(11) NOT NULL, "data_nascimento" date NOT NULL, "email" character varying(150) NOT NULL, "telefone" character varying(11), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_pacientes_cpf" UNIQUE ("cpf"), CONSTRAINT "PK_pacientes" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "pacientes"`);
  }
}
