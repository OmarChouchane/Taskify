import { IsEnum } from 'class-validator';
import { Role } from '@common/common.module';

export class UpdateOrgMemberRoleDto {
  @IsEnum(Role)
  role: Role;
}