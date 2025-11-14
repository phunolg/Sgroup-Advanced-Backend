import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddResetPasswordFields1732090000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'reset_password_token',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'reset_password_token_expires',
        type: 'timestamptz',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'reset_password_token_expires');
    await queryRunner.dropColumn('users', 'reset_password_token');
  }
}
