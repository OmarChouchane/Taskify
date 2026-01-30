import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { SwimlaneModule } from '@swimlane/swimlane.module';
import { UserModule } from '@user/user.module';

@Module({
  controllers: [CardController],
  providers: [CardService],
  imports: [TypeOrmModule.forFeature([Card]), SwimlaneModule, UserModule],
})
export class CardModule {}
