import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PatrolMemberUpdateDto {
  @IsUUID()
  userId: string;

  @IsString()
  role: string;
}

class PatrolLayoutUpdateDto {
  @IsUUID()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatrolMemberUpdateDto)
  members: PatrolMemberUpdateDto[];
}

export class BatchUpdatePatrolsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatrolLayoutUpdateDto)
  patrols: PatrolLayoutUpdateDto[];
}
