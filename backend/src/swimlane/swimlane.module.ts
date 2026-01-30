import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwimlaneService } from './swimlane.service';
import { SwimlaneController } from './swimlane.controller';
import { Swimlane } from './entities/swimlane.entity';
import { Board } from '@board/entities/board.entity';
import { Card } from '@card/entities/card.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Swimlane, Board, Card, OrganizationMember]), AuthModule],
  controllers: [SwimlaneController],
  providers: [SwimlaneService],
  exports: [SwimlaneService],
})
export class SwimlaneModule {}