import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto';
import { Swimlane } from './entities/swimlane.entity';
import { Board } from '@board/entities/board.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';

@Injectable()
export class SwimlaneService {
  constructor(
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(OrganizationMember)
    private organizationMemberRepository: Repository<OrganizationMember>,
  ) {}

  async create(createSwimlaneDto: CreateSwimlaneDto, userId: number) {
    const board = await this.boardRepository.findOne({
      where: { id: createSwimlaneDto.boardId },
    });

    const swimlane = this.swimlaneRepository.create({
      name: createSwimlaneDto.name,
      order: createSwimlaneDto.order,
      board,
    });

    return this.swimlaneRepository.save(swimlane);
  }

  async updateSwimlaneOrders(reorder: ReordereSwimlaneDto, userId: number) {
    const promises = reorder.items.map((swimlane) =>
      this.swimlaneRepository.update(swimlane.id, { order: swimlane.order }),
    );

    await Promise.all(promises);

    return true;
  }

  async hasAccessToSwimlane(swimlaneId: number, userId: number) {
    const swimlane = await this.swimlaneRepository.findOne({
      where: { id: swimlaneId },
      relations: ['board', 'board.organization'],
    });

    if (!swimlane?.board?.organization) {
      return false;
    }

    const membership = await this.organizationMemberRepository.findOne({
      where: {
        user: { id: userId },
        organization: { id: swimlane.board.organization.id },
      },
    });

    return !!membership;
  }

  findAllByBoardId(boardId: number, userId: number) {
    return this.swimlaneRepository.find({
      where: {
        board: { id: boardId },
      },
    });
  }

  async update(id: number, userId: number, updateSwimlaneDto: UpdateSwimlaneDto) {
    return this.swimlaneRepository.update(id, {
      name: updateSwimlaneDto.name,
    });
  }

  async remove(id: number, userId: number) {
    return this.swimlaneRepository.delete(id);
  }
}
