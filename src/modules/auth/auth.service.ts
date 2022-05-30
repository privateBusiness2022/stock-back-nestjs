import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import randomColor from 'randomcolor';
import {
  EMAIL_USER_CONFLICT,
  INVALID_CREDENTIALS,
  USER_NOT_FOUND,
} from 'src/errors/errors.constants';
import { Expose } from 'src/providers/prisma/prisma.interface';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { LOGIN_ACCESS_TOKEN } from 'src/providers/tokens/tokens.constants';
import { TokensService } from 'src/providers/tokens/tokens.service';
import { RegisterDto } from './auth.dto';
import { AccessTokenClaims, TokenResponse } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokensService: TokensService,
    private configService: ConfigService,
  ) {}

  async login(email: string, password?: string): Promise<TokenResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) throw new NotFoundException(USER_NOT_FOUND);
    if (!(await compare(password, user.password)))
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    return this.loginResponse(user);
  }

  async register(data: RegisterDto): Promise<Expose<User>> {
    const testUser = await this.prisma.user.findFirst({
      where: {
        email: data.email,
        phone: data.phone,
      },
    });
    if (testUser) throw new ConflictException(EMAIL_USER_CONFLICT);
    if (data.name)
      data.name = data.name
        .split(' ')
        .map((word, index) =>
          index === 0 || index === data.name.split(' ').length
            ? (word.charAt(0) ?? '').toUpperCase() +
              (word.slice(1) ?? '').toLowerCase()
            : word,
        )
        .join(' ');
    if (data.password)
      data.password = await this.hashAndValidatePassword(data.password);
    let initials = data.name.trim().substr(0, 2).toUpperCase();
    if (data.name.includes(' '))
      initials = data.name
        .split(' ')
        .map((i) => i.trim().substr(0, 1))
        .join('')
        .toUpperCase();
    data.avatar =
      data.avatar ??
      `https://ui-avatars.com/api/?name=${initials}&background=${randomColor({
        luminosity: 'light',
      }).replace('#', '')}&color=000000`;

    let id: number | undefined = undefined;
    while (!id) {
      id = Number(
        `10${await this.tokensService.generateRandomString(6, 'numeric')}`,
      );
      const users = await this.prisma.user.findMany({
        where: {
          id,
        },
        take: 1,
      });
      if (users.length) id = undefined;
    }
    const user = await this.prisma.user.create({
      data: {
        ...data,
        role: 'SUDO',
        id,
      },
    });
    return this.prisma.expose(user);
  }

  private async loginResponse(user: User): Promise<TokenResponse> {
    return {
      userData: user,
      accessToken: await this.getAccessToken(user),
    };
  }

  private async getAccessToken(user: User): Promise<string> {
    const payload: AccessTokenClaims = {
      id: user.id,
      role: user.role,
    };
    return this.tokensService.signJwt(
      LOGIN_ACCESS_TOKEN,
      payload,
      this.configService.get<string>('security.accessTokenExpiry'),
    );
  }

  async hashAndValidatePassword(password: string): Promise<string> {
    return await hash(
      password,
      this.configService.get<number>('security.saltRounds') ?? 10,
    );
  }
}
