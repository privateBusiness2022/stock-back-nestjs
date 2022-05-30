import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksService } from './tasks.service';
import { UsersModule } from '../../modules/users/users.module';
import { PeriodsModule } from 'src/modules/periods/periods.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UsersModule,
    PeriodsModule
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
