import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ReorderedCardDto } from './dto/reorder-cards.dto';
import { Card } from './entities/card.entity';
import { Swimlane } from '@swimlane/entities/swimlane.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>,
  ) {}

  async create(createCardDto: CreateCardDto, userId: number) {
    const swimlane = await this.swimlaneRepository.findOne({
      where: { id: createCardDto.swimlaneId },
    });

    if (!swimlane) {
      throw new NotFoundException(`Swimlane with ID ${createCardDto.swimlaneId} not found`);
    }

    const card = this.cardRepository.create({
      name: createCardDto.name,
      content: createCardDto.content,
      order: createCardDto.order,
      swimlane,
    });

    return this.cardRepository.save(card);
  }

  async updateCardOrdersAndSwimlanes(reorder: ReorderedCardDto, userId: number) {
    const promises = reorder.cards.map(async (cardData) => {
      const swimlane = await this.swimlaneRepository.findOne({
        where: { id: cardData.swimlaneId },
      });
      if (!swimlane) {
        throw new NotFoundException(`Swimlane with ID ${cardData.swimlaneId} not found`);
      }
      return this.cardRepository.update(cardData.id, {
        order: cardData.order,
        swimlane,
      });
    });

    await Promise.all(promises);

    return true;
  }

  async update(id: number, userId: number, updateCardDto: UpdateCardDto) {
    return this.cardRepository.update(id, {
      name: updateCardDto.name,
      content: updateCardDto.content,
    });
  }

  async remove(id: number, userId: number) {
    const card = await this.cardRepository.findOne({
      where: { id },
    });
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    return this.cardRepository.delete(id);
  }
}
