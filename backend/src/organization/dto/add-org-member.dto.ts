import { IsEmail, IsEnum } from 'class-validator';
import { Role } from '@common/common.module';

export class AddOrgMemberDto {
  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;
}