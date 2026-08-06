import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDivisionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  ruleId: string;
}
