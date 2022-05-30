import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { TokensModule } from '../../providers/tokens/tokens.module';

import { ApiKeysService } from './api-keys.service';

@Module({
  imports: [PrismaModule, TokensModule, ConfigModule],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
