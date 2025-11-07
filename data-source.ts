import 'reflect-metadata';
import { DataSource } from 'typeorm';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'training_backend',
  entities: [
    'src/entities/*.entity{.ts,.js}',
    'src/users/entities/*.entity{.ts,.js}',
    'src/workspaces/entities/*.entity{.ts,.js}',
    'src/boards/entities/*.entity{.ts,.js}',
    'src/cards/entities/*.entity{.ts,.js}',
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
});

export default ds;
