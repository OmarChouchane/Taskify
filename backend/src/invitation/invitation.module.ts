import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { Invitation } from './entities/invitation.entity';
import { Organization } from '@organization/entities/organization.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { User } from '@user/entities/user.entity';
import { AuthModule } from '@auth/auth.module';
import { OrganizationModule } from '@organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation, Organization, OrganizationMember, User]),
    AuthModule,
    OrganizationModule,
  ],
  providers: [InvitationService],
  controllers: [InvitationController],
  exports: [InvitationService],
})
export class InvitationModule {}