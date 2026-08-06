import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class GeneratePatrolsDto {
  @IsString()
  @IsNotEmpty()
  bowCategoryId: string;

  @IsNumber()
  @Min(1)
  targetPatrolCount: number;
}
