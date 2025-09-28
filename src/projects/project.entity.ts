import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('projects')
export class Project {
  @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851', description: 'UUID của project' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Sgroup Backend', description: 'Tên dự án' })
  @Column()
  title!: string;

  @ApiProperty({
    example: 'Dự án thử nghiệm với NestJS + TypeORM',
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ example: '2025-09-22T12:00:00.000Z', description: 'Thời gian tạo' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ example: '2025-09-22T12:00:00.000Z', description: 'Thời gian cập nhật cuối cùng' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
