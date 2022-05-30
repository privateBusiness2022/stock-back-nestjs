import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKey } from '@prisma/client';
import type { InputJsonValue, JsonValue, Prisma } from 'prisma';
import QuickLRU from 'quick-lru';
import { API_KEY_NOT_FOUND } from '../../errors/errors.constants';
import { Expose } from '../../providers/prisma/prisma.interface';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { TokensService } from '../../providers/tokens/tokens.service';

@Injectable()
export class ApiKeysService {
  private lru = new QuickLRU<string, ApiKey>({
    maxSize: this.configService.get<number>('caching.apiKeyLruSize') ?? 100,
  });

  constructor(
    private prisma: PrismaService,
    private tokensService: TokensService,
    private configService: ConfigService,
  ) {}

  async getApiKeyFromKey(key: string): Promise<Expose<ApiKey>> {
    if (this.lru.has(key)) return this.lru.get(key);
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { apiKey: key },
    });
    if (!apiKey) throw new NotFoundException(API_KEY_NOT_FOUND);
    this.lru.set(key, apiKey);
    return this.prisma.expose<ApiKey>(apiKey);
  }
}
