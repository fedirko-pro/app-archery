import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
  Min,
  IsIn,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TrainingCustomFieldDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  value: string;
}

export class CreateTrainingSessionDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  shotsCount?: number;

  @IsString()
  @IsOptional()
  @IsIn(['started', 'finished'])
  status?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  arrowsPerSet?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  scoreTotal?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  @IsIn(['bad', 'normal', 'good', 'amazing'])
  mood?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?!0+(?:\.0+)?$)\d+(\.\d+)?$/, {
    message: 'distance must be a positive number',
  })
  distance?: string;

  @IsString()
  @IsOptional()
  targetType?: string;

  @IsString()
  @IsOptional()
  equipmentSetId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TrainingCustomFieldDto)
  customFields?: TrainingCustomFieldDto[];
}
