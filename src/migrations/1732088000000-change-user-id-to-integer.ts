import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUserIdToInteger1732088000000 implements MigrationInterface {
  name = 'ChangeUserIdToInteger1732088000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints first
    await queryRunner.query(
      `ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_workspace_members_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_members" DROP CONSTRAINT "FK_board_members_user_id"`,
    );
    await queryRunner.query(`ALTER TABLE "card_members" DROP CONSTRAINT "FK_card_members_user_id"`);
    await queryRunner.query(`ALTER TABLE "cards" DROP CONSTRAINT "FK_cards_created_by"`);
    await queryRunner.query(
      `ALTER TABLE "attachments" DROP CONSTRAINT "FK_attachments_uploader_id"`,
    );
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_author_id"`);

    // Change user id from bigint to integer
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" TYPE integer USING id::integer`);

    // Update foreign key columns
    await queryRunner.query(
      `ALTER TABLE "workspace_members" ALTER COLUMN "user_id" TYPE integer USING user_id::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_members" ALTER COLUMN "user_id" TYPE integer USING user_id::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_members" ALTER COLUMN "user_id" TYPE integer USING user_id::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ALTER COLUMN "created_by" TYPE integer USING created_by::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ALTER COLUMN "uploader_id" TYPE integer USING uploader_id::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ALTER COLUMN "author_id" TYPE integer USING author_id::integer`,
    );

    // Recreate foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "workspace_members" ADD CONSTRAINT "FK_workspace_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_members" ADD CONSTRAINT "FK_board_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_members" ADD CONSTRAINT "FK_card_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ADD CONSTRAINT "FK_cards_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_attachments_uploader_id" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_author_id" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the migration - change back to bigint
    await queryRunner.query(
      `ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_workspace_members_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_members" DROP CONSTRAINT "FK_board_members_user_id"`,
    );
    await queryRunner.query(`ALTER TABLE "card_members" DROP CONSTRAINT "FK_card_members_user_id"`);
    await queryRunner.query(`ALTER TABLE "cards" DROP CONSTRAINT "FK_cards_created_by"`);
    await queryRunner.query(
      `ALTER TABLE "attachments" DROP CONSTRAINT "FK_attachments_uploader_id"`,
    );
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_author_id"`);

    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" TYPE bigint`);
    await queryRunner.query(`ALTER TABLE "workspace_members" ALTER COLUMN "user_id" TYPE bigint`);
    await queryRunner.query(`ALTER TABLE "board_members" ALTER COLUMN "user_id" TYPE bigint`);
    await queryRunner.query(`ALTER TABLE "card_members" ALTER COLUMN "user_id" TYPE bigint`);
    await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "created_by" TYPE bigint`);
    await queryRunner.query(`ALTER TABLE "attachments" ALTER COLUMN "uploader_id" TYPE bigint`);
    await queryRunner.query(`ALTER TABLE "comments" ALTER COLUMN "author_id" TYPE bigint`);

    await queryRunner.query(
      `ALTER TABLE "workspace_members" ADD CONSTRAINT "FK_workspace_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_members" ADD CONSTRAINT "FK_board_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_members" ADD CONSTRAINT "FK_card_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ADD CONSTRAINT "FK_cards_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_attachments_uploader_id" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_author_id" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
  }
}
