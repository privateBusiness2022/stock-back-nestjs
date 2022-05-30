import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@prisma/client';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import randomColor from 'randomcolor';
import {
  CURRENT_PASSWORD_REQUIRED,
  EMAIL_USER_CONFLICT,
  INVALID_CREDENTIALS,
  USER_NOT_FOUND,
} from 'src/errors/errors.constants';
import { Expose } from 'src/providers/prisma/prisma.interface';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { TokensService } from 'src/providers/tokens/tokens.service';
import { AuthService } from '../auth/auth.service';
import { PasswordUpdateInput } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthService,
    private configService: ConfigService,
    private tokensService: TokensService,
  ) {}

  async getUser(id: number): Promise<Expose<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException(USER_NOT_FOUND);
    return this.prisma.expose<User>(user);
  }

  async getUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
  }): Promise<Expose<User>[]> {
    const { skip, take, cursor, where } = params;
    try {
      const users = await this.prisma.user.findMany({
        skip,
        take,
        cursor,
        where,
      });
      return users.map((user) => this.prisma.expose<User>(user));
    } catch (error) {
      return [];
    }
  }

  async createUser(data: Prisma.UserCreateInput): Promise<Expose<User>> {
    const testUser = await this.prisma.user.findFirst({
      where: {
        email: data.email,
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
    const user = await this.prisma.user.create({ data: { ...data, id } });
    return this.prisma.expose<User>(user);
  }

  async updateUser(
    id: number,
    data: Omit<Prisma.UserUpdateInput, 'password'> & PasswordUpdateInput,
  ): Promise<Expose<User>> {
    const testUser = await this.prisma.user.findUnique({ where: { id } });
    if (!testUser) throw new NotFoundException(USER_NOT_FOUND);
    const transformed: Prisma.UserUpdateInput & PasswordUpdateInput = data;
    // If the user is updating their password
    if (data.newPassword) {
      if (!data.currentPassword)
        throw new BadRequestException(CURRENT_PASSWORD_REQUIRED);
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      const previousPassword = user?.password;
      if (previousPassword)
        if (!(await compare(data.currentPassword, previousPassword)))
          throw new BadRequestException(INVALID_CREDENTIALS);
      transformed.password = await this.auth.hashAndValidatePassword(
        data.newPassword,
      );
    }
    delete transformed.currentPassword;
    delete transformed.newPassword;
    const updateData: Prisma.UserUpdateInput = transformed;
    const user = await this.prisma.user.update({
      data: updateData,
      where: { id },
    });
    return this.prisma.expose<User>(user);
  }

  async activateUser(id: number): Promise<Expose<User>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
    return this.prisma.expose<User>(user);
  }

  async deactivateUser(id: number): Promise<Expose<User>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
    return this.prisma.expose<User>(user);
  }

  async hashAndValidatePassword(password: string): Promise<string> {
    return await hash(
      password,
      this.configService.get<number>('security.saltRounds') ?? 10,
    );
  }
}
