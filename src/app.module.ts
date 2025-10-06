import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { HealthController } from './health/health.controller';
import { typeormConfig } from './common/typeorm.config';

@Module({
  imports: [TypeOrmModule.forRoot(typeormConfig), UsersModule, WorkspacesModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
