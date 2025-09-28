import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { HealthController } from './health/health.controller';
import { typeormConfig } from './common/typeorm.config';

@Module({
  imports: [TypeOrmModule.forRoot(typeormConfig), UsersModule, ProjectsModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
