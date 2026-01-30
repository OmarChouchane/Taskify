import { IsEmail, IsEnum, IsInt, IsPositive } from 'class-validator';
import { Role } from '@common/common.module';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;

  @IsInt()
  @IsPositive()
  organizationId: number;
}