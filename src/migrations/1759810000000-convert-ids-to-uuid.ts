import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertIdsToUuid1759810000000 implements MigrationInterface {
  name = 'ConvertIdsToUuid1759810000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Start transaction
    await queryRunner.startTransaction();

    try {
      // Drop dependent constraints first
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "board_members" DROP CONSTRAINT IF EXISTS "FK_board_members_board_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "lists" DROP CONSTRAINT IF EXISTS "FK_lists_board_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "labels" DROP CONSTRAINT IF EXISTS "FK_labels_board_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "board_invitations" DROP CONSTRAINT IF EXISTS "FK_board_invitations_board_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "cards" DROP CONSTRAINT IF EXISTS "FK_cards_list_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "checklists" DROP CONSTRAINT IF EXISTS "FK_checklists_card_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "card_labels" DROP CONSTRAINT IF EXISTS "FK_card_labels_card_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "card_labels" DROP CONSTRAINT IF EXISTS "FK_card_labels_label_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "checklist_items" DROP CONSTRAINT IF EXISTS "FK_checklist_items_checklist_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "attachments" DROP CONSTRAINT IF EXISTS "FK_attachments_card_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "cards" DROP CONSTRAINT IF EXISTS "FK_cards_cover_attachment_id"`,
      );

      // Convert workspaces.id
      await queryRunner.query(`
        ALTER TABLE "workspaces" 
        ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
      `);
      await queryRunner.query(`
        ALTER TABLE "workspaces" 
        ALTER COLUMN "id_new" DROP DEFAULT;
      `);
      await queryRunner.query(`
        UPDATE "workspaces" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;
      `);
      await queryRunner.query(`
        ALTER TABLE "boards" 
        ADD COLUMN "workspace_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "boards" SET "workspace_id_new" = w."id_new"
        FROM (SELECT id, id_new FROM "workspaces") w
        WHERE "boards"."workspace_id" = w.id::text;
      `);
      await queryRunner.query(`
        ALTER TABLE "workspaces" DROP COLUMN "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "workspaces" RENAME COLUMN "id_new" TO "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "workspaces" ADD PRIMARY KEY ("id");
      `);

      // Convert boards.id and update workspace_id fk
      await queryRunner.query(`
        ALTER TABLE "boards" 
        ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
      `);
      await queryRunner.query(`
        ALTER TABLE "boards" 
        ALTER COLUMN "id_new" DROP DEFAULT;
      `);
      await queryRunner.query(`
        UPDATE "boards" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;
      `);

      // Create mapping table for old board ids
      await queryRunner.query(`
        CREATE TEMP TABLE board_id_map AS
        SELECT id, id_new FROM "boards";
      `);

      // Update lists.board_id
      await queryRunner.query(`
        ALTER TABLE "lists" 
        ADD COLUMN "board_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "lists" SET "board_id_new" = bm."id_new"
        FROM board_id_map bm
        WHERE "lists"."board_id" = bm.id::text;
      `);

      // Update labels.board_id
      await queryRunner.query(`
        ALTER TABLE "labels" 
        ADD COLUMN "board_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "labels" SET "board_id_new" = bm."id_new"
        FROM board_id_map bm
        WHERE "labels"."board_id" = bm.id::text;
      `);

      // Update board_members.board_id
      await queryRunner.query(`
        ALTER TABLE "board_members" 
        ADD COLUMN "board_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "board_members" SET "board_id_new" = bm."id_new"
        FROM board_id_map bm
        WHERE "board_members"."board_id" = bm.id::text;
      `);

      // Update board_invitations.board_id
      await queryRunner.query(`
        ALTER TABLE "board_invitations" 
        ADD COLUMN "board_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "board_invitations" SET "board_id_new" = bm."id_new"
        FROM board_id_map bm
        WHERE "board_invitations"."board_id" = bm.id::text;
      `);

      // Replace old columns with new ones
      await queryRunner.query(`
        ALTER TABLE "boards" DROP COLUMN "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "boards" RENAME COLUMN "id_new" TO "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "boards" ADD PRIMARY KEY ("id");
      `);
      await queryRunner.query(`
        ALTER TABLE "boards" DROP COLUMN "workspace_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "boards" RENAME COLUMN "workspace_id_new" TO "workspace_id";
      `);

      // Update lists
      await queryRunner.query(`
        ALTER TABLE "lists" 
        ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
      `);
      await queryRunner.query(`
        UPDATE "lists" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;
      `);
      await queryRunner.query(`
        CREATE TEMP TABLE list_id_map AS
        SELECT id, id_new FROM "lists";
      `);
      await queryRunner.query(`
        ALTER TABLE "lists" DROP COLUMN "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "lists" RENAME COLUMN "id_new" TO "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "lists" ADD PRIMARY KEY ("id");
      `);
      await queryRunner.query(`
        ALTER TABLE "lists" DROP COLUMN "board_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "lists" RENAME COLUMN "board_id_new" TO "board_id";
      `);

      // Update cards
      await queryRunner.query(`
        ALTER TABLE "cards" 
        ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
      `);
      await queryRunner.query(`
        UPDATE "cards" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;
      `);
      await queryRunner.query(`
        ALTER TABLE "cards" 
        ADD COLUMN "list_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "cards" SET "list_id_new" = lm."id_new"
        FROM list_id_map lm
        WHERE "cards"."list_id" = lm.id::text;
      `);

      // Create mapping table for old card ids
      await queryRunner.query(`
        CREATE TEMP TABLE card_id_map AS
        SELECT id, id_new FROM "cards";
      `);

      // Update cards cover_attachment_id
      await queryRunner.query(`
        ALTER TABLE "cards" 
        ADD COLUMN "cover_attachment_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "cards" SET "cover_attachment_id_new" = aim."id_new"
        FROM (SELECT id, id_new FROM "attachments") aim
        WHERE "cards"."cover_attachment_id" = aim.id::text;
      `);

      await queryRunner.query(`
        ALTER TABLE "cards" DROP COLUMN "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "cards" RENAME COLUMN "id_new" TO "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "cards" ADD PRIMARY KEY ("id");
      `);
      await queryRunner.query(`
        ALTER TABLE "cards" DROP COLUMN "list_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "cards" RENAME COLUMN "list_id_new" TO "list_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "cards" DROP COLUMN "cover_attachment_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "cards" RENAME COLUMN "cover_attachment_id_new" TO "cover_attachment_id";
      `);

      // Update checklists
      await queryRunner.query(`
        ALTER TABLE "checklists" 
        ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
      `);
      await queryRunner.query(`
        UPDATE "checklists" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;
      `);
      await queryRunner.query(`
        ALTER TABLE "checklists" 
        ADD COLUMN "card_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "checklists" SET "card_id_new" = cm."id_new"
        FROM card_id_map cm
        WHERE "checklists"."card_id" = cm.id::text;
      `);

      // Create mapping table for old checklist ids
      await queryRunner.query(`
        CREATE TEMP TABLE checklist_id_map AS
        SELECT id, id_new FROM "checklists";
      `);

      await queryRunner.query(`
        ALTER TABLE "checklists" DROP COLUMN "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "checklists" RENAME COLUMN "id_new" TO "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "checklists" ADD PRIMARY KEY ("id");
      `);
      await queryRunner.query(`
        ALTER TABLE "checklists" DROP COLUMN "card_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "checklists" RENAME COLUMN "card_id_new" TO "card_id";
      `);

      // Update checklist_items
      await queryRunner.query(`
        ALTER TABLE "checklist_items" 
        ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
      `);
      await queryRunner.query(`
        UPDATE "checklist_items" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;
      `);
      await queryRunner.query(`
        ALTER TABLE "checklist_items" 
        ADD COLUMN "checklist_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "checklist_items" SET "checklist_id_new" = cm."id_new"
        FROM checklist_id_map cm
        WHERE "checklist_items"."checklist_id" = cm.id::text;
      `);
      await queryRunner.query(`
        ALTER TABLE "checklist_items" DROP COLUMN "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "checklist_items" RENAME COLUMN "id_new" TO "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "checklist_items" ADD PRIMARY KEY ("id");
      `);
      await queryRunner.query(`
        ALTER TABLE "checklist_items" DROP COLUMN "checklist_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "checklist_items" RENAME COLUMN "checklist_id_new" TO "checklist_id";
      `);

      // Update labels
      await queryRunner.query(`
        ALTER TABLE "labels" 
        ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
      `);
      await queryRunner.query(`
        UPDATE "labels" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;
      `);

      // Create mapping table for old label ids
      await queryRunner.query(`
        CREATE TEMP TABLE label_id_map AS
        SELECT id, id_new FROM "labels";
      `);

      await queryRunner.query(`
        ALTER TABLE "labels" DROP COLUMN "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "labels" RENAME COLUMN "id_new" TO "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "labels" ADD PRIMARY KEY ("id");
      `);
      await queryRunner.query(`
        ALTER TABLE "labels" DROP COLUMN "board_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "labels" RENAME COLUMN "board_id_new" TO "board_id";
      `);

      // Update card_labels
      await queryRunner.query(`
        ALTER TABLE "card_labels" 
        ADD COLUMN "card_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "card_labels" SET "card_id_new" = cm."id_new"
        FROM card_id_map cm
        WHERE "card_labels"."card_id" = cm.id::text;
      `);
      await queryRunner.query(`
        ALTER TABLE "card_labels" 
        ADD COLUMN "label_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "card_labels" SET "label_id_new" = lm."id_new"
        FROM label_id_map lm
        WHERE "card_labels"."label_id" = lm.id::text;
      `);
      await queryRunner.query(`
        ALTER TABLE "card_labels" DROP CONSTRAINT "PK_card_labels_card_id_label_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "card_labels" DROP COLUMN "card_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "card_labels" RENAME COLUMN "card_id_new" TO "card_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "card_labels" DROP COLUMN "label_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "card_labels" RENAME COLUMN "label_id_new" TO "label_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "card_labels" ADD PRIMARY KEY ("card_id", "label_id");
      `);

      // Update attachments
      await queryRunner.query(`
        ALTER TABLE "attachments" 
        ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
      `);
      await queryRunner.query(`
        UPDATE "attachments" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;
      `);
      await queryRunner.query(`
        ALTER TABLE "attachments" 
        ADD COLUMN "card_id_new" uuid;
      `);
      await queryRunner.query(`
        UPDATE "attachments" SET "card_id_new" = cm."id_new"
        FROM card_id_map cm
        WHERE "attachments"."card_id" = cm.id::text;
      `);
      await queryRunner.query(`
        ALTER TABLE "attachments" DROP COLUMN "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "attachments" RENAME COLUMN "id_new" TO "id";
      `);
      await queryRunner.query(`
        ALTER TABLE "attachments" ADD PRIMARY KEY ("id");
      `);
      await queryRunner.query(`
        ALTER TABLE "attachments" DROP COLUMN "card_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "attachments" RENAME COLUMN "card_id_new" TO "card_id";
      `);

      // Update board_members
      await queryRunner.query(`
        ALTER TABLE "board_members" DROP CONSTRAINT "PK_board_members_board_id_user_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "board_members" DROP COLUMN "board_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "board_members" RENAME COLUMN "board_id_new" TO "board_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "board_members" ADD PRIMARY KEY ("board_id", "user_id");
      `);

      // Update board_invitations
      await queryRunner.query(`
        ALTER TABLE "board_invitations" DROP COLUMN "board_id";
      `);
      await queryRunner.query(`
        ALTER TABLE "board_invitations" RENAME COLUMN "board_id_new" TO "board_id";
      `);

      // Re-add foreign key constraints
      await queryRunner.query(`
        ALTER TABLE "boards" 
        ADD CONSTRAINT "FK_boards_workspace_id" 
        FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "lists" 
        ADD CONSTRAINT "FK_lists_board_id" 
        FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "labels" 
        ADD CONSTRAINT "FK_labels_board_id" 
        FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "board_members" 
        ADD CONSTRAINT "FK_board_members_board_id" 
        FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "board_invitations" 
        ADD CONSTRAINT "FK_board_invitations_board_id" 
        FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "cards" 
        ADD CONSTRAINT "FK_cards_list_id" 
        FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "checklists" 
        ADD CONSTRAINT "FK_checklists_card_id" 
        FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "card_labels" 
        ADD CONSTRAINT "FK_card_labels_card_id" 
        FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "card_labels" 
        ADD CONSTRAINT "FK_card_labels_label_id" 
        FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "checklist_items" 
        ADD CONSTRAINT "FK_checklist_items_checklist_id" 
        FOREIGN KEY ("checklist_id") REFERENCES "checklists"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "attachments" 
        ADD CONSTRAINT "FK_attachments_card_id" 
        FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE;
      `);
      await queryRunner.query(`
        ALTER TABLE "cards" 
        ADD CONSTRAINT "FK_cards_cover_attachment_id" 
        FOREIGN KEY ("cover_attachment_id") REFERENCES "attachments"("id") ON DELETE SET NULL;
      `);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  public async down(): Promise<void> {
    // Rollback is complex, so we'll just skip it for now
    throw new Error('Downgrade not supported for this migration');
  }
}
