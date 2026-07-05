import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateFederationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  shortCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsIn(['public', 'private'])
  @IsOptional()
  visibility?: 'public' | 'private';
}
