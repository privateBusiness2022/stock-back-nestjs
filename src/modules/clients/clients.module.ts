import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { TokensModule } from 'src/providers/tokens/tokens.module';
import { PeriodsModule } from '../periods/periods.module';

@Module({
  imports: [PrismaModule, TokensModule, PeriodsModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
