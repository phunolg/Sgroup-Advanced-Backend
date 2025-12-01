import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBoardInviteLinkToken1759785000000 implements MigrationInterface {
  name = 'AddBoardInviteLinkToken1759785000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "boards" ADD "invite_link_token" text`);
    await queryRunner.query(
      `UPDATE "boards" SET "invite_link_token" = md5(random()::text || clock_timestamp()::text) WHERE "invite_link_token" IS NULL`,
    );
    await queryRunner.query(`ALTER TABLE "boards" ALTER COLUMN "invite_link_token" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "boards" ADD CONSTRAINT "UQ_boards_invite_link_token" UNIQUE ("invite_link_token")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "boards" DROP CONSTRAINT "UQ_boards_invite_link_token"`);
    await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "invite_link_token"`);
  }
}
