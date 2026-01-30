import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { Card } from './entities/card.entity';
import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { Board } from '@board/entities/board.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card, Swimlane, Board, OrganizationMember]), AuthModule],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}