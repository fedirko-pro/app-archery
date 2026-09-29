import { IsNotEmpty, IsString } from 'class-validator';

export class UpsertPushSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @IsString()
  @IsNotEmpty()
  auth!: string;
}

export class DeletePushSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  endpoint!: string;
}
