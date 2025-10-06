import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMissingIndexes1759762000000 implements MigrationInterface {
  name = 'CreateMissingIndexes1759762000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Use IF NOT EXISTS so this migration is idempotent
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_boards_workspace_id" ON "boards" ("workspace_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_board_members_user" ON "board_members" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_lists_board_id" ON "lists" ("board_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_lists_board_pos" ON "lists" ("position")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_cards_list_pos" ON "cards" ("list_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_cards_created_by" ON "cards" ("created_by")`,
    );
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_cards_due_at" ON "cards" ("due_at")`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_cards_archived" ON "cards" ("archived")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_attachments_card" ON "attachments" ("card_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_card_members_user" ON "card_members" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_labels_board" ON "labels" ("board_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_card_labels_label" ON "card_labels" ("label_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_checklists_card_pos" ON "checklists" ("card_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_items_checklist_pos" ON "checklist_items" ("checklist_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_items_checked" ON "checklist_items" ("is_checked")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_items_due" ON "checklist_items" ("due_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_comments_card_created" ON "comments" ("card_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_workspace_members_user" ON "workspace_members" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_comments_card_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_items_due"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_items_checked"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_items_checklist_pos"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_checklists_card_pos"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_card_labels_label"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_labels_board"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_card_members_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_attachments_card"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cards_archived"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cards_due_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cards_created_by"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cards_list_pos"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_lists_board_pos"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_lists_board_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_board_members_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_boards_workspace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_workspace_members_user"`);
  }
}
