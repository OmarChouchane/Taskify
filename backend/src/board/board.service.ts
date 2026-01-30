import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { User } from '@user/entities/user.entity';
import { Organization } from '@organization/entities/organization.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { Role } from '@common/common.module';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private organizationMemberRepository: Repository<OrganizationMember>,
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const organization = await this.organizationRepository.findOne({
      where: { id: createBoardDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const orgMembership = await this.organizationMemberRepository.findOne({
      where: {
        user: { id: userId },
        organization: { id: createBoardDto.organizationId },
      },
    });

    if (!orgMembership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    const board = this.boardRepository.create({
      name: createBoardDto.name,
      description: createBoardDto.description,
      organization,
    });

    return this.boardRepository.save(board);
  }

  async findAll(userId: number) {
    // Find all boards in organizations where the user is a member
    return this.boardRepository
      .createQueryBuilder('board')
      .innerJoin('board.organization', 'org')
      .innerJoin(
        OrganizationMember,
        'member',
        'member.organizationId = org.id AND member.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('board.organization', 'organization')
      .getMany();
  }

  async findOne(id: number) {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['swimlanes', 'swimlanes.cards', 'organization'],
      order: {
        swimlanes: {
          order: 'ASC',
          cards: {
            order: 'ASC',
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    const board = await this.findOne(id);

    if (updateBoardDto.name !== undefined) {
      board.name = updateBoardDto.name;
    }
    if (updateBoardDto.description !== undefined) {
      board.description = updateBoardDto.description;
    }

    return this.boardRepository.save(board);
  }

  async remove(id: number) {
    const board = await this.findOne(id);
    await this.boardRepository.remove(board);
    return { message: `Board with ID ${id} has been deleted` };
  }

  async getUserRole(boardId: number, userId: number): Promise<Role | null> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['organization'],
    });

    if (!board || !board.organization) {
      return null;
    }

    const orgMember = await this.organizationMemberRepository.findOne({
      where: {
        user: { id: userId },
        organization: { id: board.organization.id },
      },
    });

    return orgMember?.role || null;
  }
}
