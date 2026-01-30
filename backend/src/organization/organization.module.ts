import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { User } from '@user/entities/user.entity';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, OrganizationMember, User]),
    AuthModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
