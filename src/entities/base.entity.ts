import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Simple base columns used across entities for timestamps
export abstract class BaseEntityTimestamps {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
