import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { TokensModule } from 'src/providers/tokens/tokens.module';
import { ConfigModule } from '@nestjs/config';
import { StaartStrategy } from './staart.strategy';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule,
    TokensModule,
    ConfigModule,
    ApiKeysModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, StaartStrategy],
  exports: [AuthService],
})
export class AuthModule {}
