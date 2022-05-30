import { Module } from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { PeriodsController } from './periods.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PeriodsController],
  providers: [PeriodsService],
  exports: [PeriodsService],
})
export class PeriodsModule {}
