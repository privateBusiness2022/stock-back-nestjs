import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsIn,
  IsLocale,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MinLength,
} from 'class-validator';

export class PeriodCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @IsNotEmpty()
  start: string;

  @IsDate()
  @IsNotEmpty()
  end: string;

  @IsNumber()
  @IsNotEmpty()
  createdBy: number;

  @IsNumber()
  @IsNotEmpty()
  stocks: number;

  @IsNumber()
  @IsNotEmpty()
  stocksPrice: number;

  @IsArray()
  @IsNotEmpty()
  agentStocks: AgentStocks[];
}

class AgentStocks {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  number: number;
}

export class ProfitUpdateDto {
  @IsNumber()
  @IsNotEmpty()
  profit: number;

  @IsArray()
  @IsNotEmpty()
  usersIds: [
    {
      id: number;
    },
  ];
}

export class CreateCommissionsDto {
  @IsArray()
  @IsNotEmpty()
  commissions: [CommissionDto];
}

export class CommissionDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}