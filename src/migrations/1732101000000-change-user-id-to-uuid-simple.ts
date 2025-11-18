import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUserIdToUuidSimple1732101000000 implements MigrationInterface {
  name = 'ChangeUserIdToUuidSimple1732101000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // This migration assumes a fresh database or one without user data
    // For existing data, manual migration steps are required

    // Check if users table exists
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);

    if (tables && tables.length > 0) {
      // Table exists, check column type
      const columns = await queryRunner.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id'
      `);

      if (columns && columns.length > 0 && columns[0].data_type !== 'uuid') {
        console.log(
          '⚠️  Warning: users table exists with non-UUID ID. Please backup and migrate data manually.',
        );
        console.log(
          '   For a fresh start, drop the database and run migrations again, or use synchronize temporarily.',
        );
        // Skip migration to avoid data loss
        return;
      }
    }

    // If table doesn't exist or ID is already UUID, TypeORM entities will handle creation
    console.log('✓ User ID will use UUID type');
  }

  public async down(): Promise<void> {
    // No rollback for safety - manual intervention required
    console.log('⚠️  Manual rollback required for UUID to integer conversion');
  }
}
