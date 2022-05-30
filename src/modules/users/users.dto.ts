import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsLocale,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber('SD')
  phone?: string;

  @IsString()
  @IsOptional()
  newPassword?: string;

  @IsString()
  @IsOptional()
  currentPassword?: string;
}

export class createUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsPhoneNumber('SD')
  phone: string;

  @IsString()
  @IsEnum({ SUDO: 'SUDO', ADMIN: 'ADMIN', USER: 'USER', AGENT: 'AGENT' })
  role;

  @IsString()
  @MinLength(8)
  password: string;
}
