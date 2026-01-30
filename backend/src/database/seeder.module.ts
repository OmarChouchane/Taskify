import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '@user/entities/user.entity';
import { Board } from '@board/entities/board.entity';
import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { Card } from '@card/entities/card.entity';
import { Organization } from '@organization/entities/organization.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([User, Board, Swimlane, Card, Organization, OrganizationMember]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
