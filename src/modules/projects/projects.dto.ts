import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ProjectsCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  periodsFund: PeriodsFound[];
}

export class PeriodsFound {
  periodId: number;
  stocks: number;
}
