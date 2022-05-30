import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { TokensModule } from 'src/providers/tokens/tokens.module';
import { AuthModule } from '../auth/auth.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule,
    TokensModule,
    ApiKeysModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
