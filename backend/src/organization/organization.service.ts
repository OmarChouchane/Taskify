import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { User } from '@user/entities/user.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Role } from '@common/common.module';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateOrganizationDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const organization = this.organizationRepository.create({
      name: dto.name,
      description: dto.description,
    });
    const savedOrg = await this.organizationRepository.save(organization);

    const member = this.memberRepository.create({
      user,
      organization: savedOrg,
      role: Role.ADMIN,
    });
    await this.memberRepository.save(member);

    return savedOrg;
  }

  async findAll(userId: number) {
    const userMemberships = await this.memberRepository.find({
      where: { user: { id: userId } },
      relations: ['organization'],
    });

    const orgIds = userMemberships.map((m) => m.organization.id);

    if (orgIds.length === 0) {
      return [];
    }

    return this.organizationRepository
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.members', 'members')
      .leftJoinAndSelect('members.user', 'user')
      .whereInIds(orgIds)
      .getMany();
  }

  async findOne(id: number) {
    const org = await this.organizationRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'boards', 'boards.swimlanes'],
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async update(id: number, dto: UpdateOrganizationDto) {
    const org = await this.findOne(id);
    if (dto.name !== undefined) org.name = dto.name;
    if (dto.description !== undefined) org.description = dto.description;
    return this.organizationRepository.save(org);
  }

  async remove(id: number, userId: number) {
    const org = await this.findOne(id);
    const adminCount = await this.memberRepository.count({
      where: { organization: { id }, role: Role.ADMIN },
    });
    if (adminCount <= 1) {
      const isAdmin = await this.memberRepository.findOne({
        where: { organization: { id }, user: { id: userId }, role: Role.ADMIN },
      });
      if (isAdmin) {
        await this.organizationRepository.remove(org);
        return { message: 'Organization deleted' };
      }
    }
    await this.organizationRepository.remove(org);
    return { message: 'Organization deleted' };
  }

  async getMembers(orgId: number) {
    return this.memberRepository.find({
      where: { organization: { id: orgId } },
      relations: ['user'],
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    });
  }

  async addMember(orgId: number, email: string, role: Role) {
    const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.memberRepository.findOne({
      where: { organization: { id: orgId }, user: { id: user.id } },
    });
    if (existing) {
      throw new ConflictException('User is already a member');
    }

    const org = await this.organizationRepository.findOne({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const member = this.memberRepository.create({
      user,
      organization: org,
      role,
    });
    return this.memberRepository.save(member);
  }

  async updateMemberRole(orgId: number, memberId: number, role: Role) {
    const member = await this.memberRepository.findOne({
      where: { id: memberId, organization: { id: orgId } },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    member.role = role;
    return this.memberRepository.save(member);
  }

  async removeMember(orgId: number, memberId: number, currentUserId: number) {
    const member = await this.memberRepository.findOne({
      where: { id: memberId, organization: { id: orgId } },
      relations: ['user'],
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.user.id === currentUserId) {
      const adminCount = await this.memberRepository.count({
        where: { organization: { id: orgId }, role: Role.ADMIN },
      });
      if (adminCount <= 1 && member.role === Role.ADMIN) {
        throw new ForbiddenException('Cannot remove the last admin');
      }
    }

    await this.memberRepository.remove(member);
    return { message: 'Member removed' };
  }

  async getUserRole(orgId: number, userId: number): Promise<Role | null> {
    const member = await this.memberRepository.findOne({
      where: { organization: { id: orgId }, user: { id: userId } },
    });
    return member?.role || null;
  }

  async isMember(orgId: number, userId: number): Promise<boolean> {
    const member = await this.memberRepository.findOne({
      where: { organization: { id: orgId }, user: { id: userId } },
    });
    return !!member;
  }

  async isAdmin(orgId: number, userId: number): Promise<boolean> {
    const member = await this.memberRepository.findOne({
      where: { organization: { id: orgId }, user: { id: userId }, role: Role.ADMIN },
    });
    return !!member;
  }
}