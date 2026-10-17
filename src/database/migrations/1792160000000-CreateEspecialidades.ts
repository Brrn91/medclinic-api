import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEspecialidades1792160000000 implements MigrationInterface {
  name = "CreateEspecialidades1792160000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "especialidades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(100) NOT NULL, "descricao" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_especialidades_nome" UNIQUE ("nome"), CONSTRAINT "PK_especialidades" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "especialidades"`);
  }
}
