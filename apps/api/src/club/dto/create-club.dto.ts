import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsArray,
  ValidateNested,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class ClubLinkDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsUrl({ require_protocol: true })
  url: string;
}

export class CreateClubDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  shortCode?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  clubLogo?: string;

  @IsIn(['public', 'private'])
  @IsOptional()
  visibility?: 'public' | 'private';

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  otherInfo?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubLinkDto)
  @IsOptional()
  links?: ClubLinkDto[];
}
