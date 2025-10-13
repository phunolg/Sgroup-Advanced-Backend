import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingForeignKeys1759767000000 implements MigrationInterface {
  name = 'AddMissingForeignKeys1759767000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "card_labels" 
      ADD CONSTRAINT "FK_card_labels_card_id" 
      FOREIGN KEY ("card_id") REFERENCES "cards"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "card_labels" 
      ADD CONSTRAINT "FK_card_labels_label_id" 
      FOREIGN KEY ("label_id") REFERENCES "labels"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "checklists" 
      ADD CONSTRAINT "FK_checklists_card_id" 
      FOREIGN KEY ("card_id") REFERENCES "cards"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "checklist_items" 
      ADD CONSTRAINT "FK_checklist_items_checklist_id" 
      FOREIGN KEY ("checklist_id") REFERENCES "checklists"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "checklist_items" DROP CONSTRAINT "FK_checklist_items_checklist_id"`,
    );
    await queryRunner.query(`ALTER TABLE "checklists" DROP CONSTRAINT "FK_checklists_card_id"`);
    await queryRunner.query(`ALTER TABLE "card_labels" DROP CONSTRAINT "FK_card_labels_label_id"`);
    await queryRunner.query(`ALTER TABLE "card_labels" DROP CONSTRAINT "FK_card_labels_card_id"`);
  }
}
