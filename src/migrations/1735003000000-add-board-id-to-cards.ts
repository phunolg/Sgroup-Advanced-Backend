import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBoardIdToCards1735003000000 implements MigrationInterface {
  name = 'AddBoardIdToCards1735003000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add board_id column to cards table
    await queryRunner.query(`
      ALTER TABLE "cards" 
      ADD COLUMN "board_id" uuid
    `);

    // Populate board_id from list relationship
    await queryRunner.query(`
      UPDATE "cards" 
      SET "board_id" = "lists"."board_id"
      FROM "lists"
      WHERE "cards"."list_id" = "lists"."id"
    `);

    // Make board_id NOT NULL after populating
    await queryRunner.query(`
      ALTER TABLE "cards" 
      ALTER COLUMN "board_id" SET NOT NULL
    `);

    // Create index for board_id
    await queryRunner.query(`
      CREATE INDEX "idx_cards_board_id" ON "cards" ("board_id")
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "cards" 
      ADD CONSTRAINT "FK_cards_board_id" 
      FOREIGN KEY ("board_id") 
      REFERENCES "boards"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "cards" 
      DROP CONSTRAINT IF EXISTS "FK_cards_board_id"
    `);

    // Drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_cards_board_id"
    `);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "cards" 
      DROP COLUMN IF EXISTS "board_id"
    `);
  }
}
