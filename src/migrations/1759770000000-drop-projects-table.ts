import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProjectsTable1759770000000 implements MigrationInterface {
  name = 'DropProjectsTable1759770000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop projects table - not part of Trello schema
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate projects table if needed to rollback
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" BIGSERIAL NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects" PRIMARY KEY ("id")
      )
    `);
  }
}
