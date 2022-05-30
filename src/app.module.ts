import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AppService } from './app.service';
import { PrismaModule } from './providers/prisma/prisma.module';
import { TokensModule } from './providers/tokens/tokens.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { APP_GUARD } from '@nestjs/core';
import { StaartAuthGuard } from './modules/auth/staart-auth.guard';
import { PeriodsModule } from './modules/periods/periods.module';
import { TasksModule } from './providers/tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    TasksModule,
    TokensModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    PeriodsModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: StaartAuthGuard,
    },
  ],
})
export class AppModule {}
