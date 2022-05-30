import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Expose } from 'src/providers/prisma/prisma.interface';
import { LoginDto, RegisterDto } from './auth.dto';
import { TokenResponse } from './auth.interface';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { RateLimit } from './rate-limit.decorator';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Login to an account */
  @Post('login')
  @RateLimit(10)
  async login(@Body() data: LoginDto): Promise<TokenResponse> {
    return this.authService.login(data.email, data.password);
  }

  /** Create a new account */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit(10)
  async register(@Body() data: RegisterDto): Promise<Expose<User>> {
    return this.authService.register(data);
  }
}
