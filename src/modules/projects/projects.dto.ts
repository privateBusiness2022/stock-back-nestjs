import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ProjectsCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  periodsIds: Ids[];
}

export class Ids {
  id: number;
}
