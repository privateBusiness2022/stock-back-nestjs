import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsLocale,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  phone!: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  password!: string;
}

export class ResendEmailVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  origin?: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  origin?: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @IsBoolean()
  @IsOptional()
  ignorePwnedPassword?: boolean;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @Length(6)
  @IsOptional()
  code?: string;
}

export class TotpLoginDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @Length(6)
  @IsNotEmpty()
  code!: string;
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsOptional()
  origin?: string;
}
