import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBoardInvitationTokenColumn1759792000000 implements MigrationInterface {
  name = 'RemoveBoardInvitationTokenColumn1759792000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "board_invitations" DROP COLUMN "token"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "board_invitations" ADD "token" character varying(255)`);
    await queryRunner.query(`
      UPDATE "board_invitations"
      SET "token" = md5(random()::text || clock_timestamp()::text)
      WHERE "token" IS NULL
    `);
    await queryRunner.query(`ALTER TABLE "board_invitations" ALTER COLUMN "token" SET NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "board_invitations"
      ADD CONSTRAINT "UQ_board_invitations_token" UNIQUE ("token")
    `);
  }
}
