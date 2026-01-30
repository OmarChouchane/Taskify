import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { Board } from './entities/board.entity';
import { User } from '@user/entities/user.entity';
import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { Card } from '@card/entities/card.entity';
import { Organization } from '@organization/entities/organization.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Board,
      User,
      Swimlane,
      Card,
      Organization,
      OrganizationMember,
    ]),
    AuthModule,
  ],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}