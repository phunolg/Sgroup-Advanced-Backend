import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddResetPasswordFields1732090000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasResetToken = await queryRunner.hasColumn('users', 'reset_password_token');
    if (!hasResetToken) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'reset_password_token',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    const hasResetTokenExpires = await queryRunner.hasColumn(
      'users',
      'reset_password_token_expires',
    );
    if (!hasResetTokenExpires) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'reset_password_token_expires',
          type: 'timestamptz',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasResetTokenExpires = await queryRunner.hasColumn(
      'users',
      'reset_password_token_expires',
    );
    if (hasResetTokenExpires) {
      await queryRunner.dropColumn('users', 'reset_password_token_expires');
    }

    const hasResetToken = await queryRunner.hasColumn('users', 'reset_password_token');
    if (hasResetToken) {
      await queryRunner.dropColumn('users', 'reset_password_token');
    }
  }
}
