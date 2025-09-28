import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ example: 'a4c7bff5-6782-4ed3-b9b1-cc9f2785a8c4', description: 'UUID của user' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email duy nhất của user' })
  @Column({ unique: true })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'Tên người dùng' })
  @Column()
  name!: string;

  @ApiProperty({ example: '2025-09-22T12:00:00.000Z', description: 'Thời gian tạo' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ example: '2025-09-22T12:00:00.000Z', description: 'Thời gian cập nhật cuối cùng' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
