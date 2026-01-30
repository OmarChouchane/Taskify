import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './entities/invitation.entity';
import { Organization } from '@organization/entities/organization.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { User } from '@user/entities/user.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Role } from '@common/common.module';
import { UuidService } from '@common/common.module';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private uuidService: UuidService,
  ) {}

  async create(dto: CreateInvitationDto, inviterId: number) {
    const inviter = await this.userRepository.findOne({ where: { id: inviterId } });
    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }

    const org = await this.organizationRepository.findOne({
      where: { id: dto.organizationId },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const isAdmin = await this.memberRepository.findOne({
      where: {
        organization: { id: dto.organizationId },
        user: { id: inviterId },
        role: Role.ADMIN,
      },
    });
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can send invitations');
    }

    // Normalize email to lowercase
    const normalizedEmail = dto.email.toLowerCase();

    const targetUser = await this.userRepository.findOne({ where: { email: normalizedEmail } });
    if (targetUser) {
      const existingMember = await this.memberRepository.findOne({
        where: {
          organization: { id: dto.organizationId },
          user: { id: targetUser.id },
        },
      });
      if (existingMember) {
        throw new BadRequestException('User is already a member of this organization');
      }
    }

    const existingInvite = await this.invitationRepository.findOne({
      where: {
        email: normalizedEmail,
        organization: { id: dto.organizationId },
        used: false,
      },
    });
    if (existingInvite && new Date() < existingInvite.expiresAt) {
      throw new BadRequestException('An active invitation already exists for this email');
    }

    const code = this.uuidService.generate();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepository.create({
      code,
      email: normalizedEmail,
      role: dto.role,
      organization: org,
      invitedBy: inviter,
      expiresAt,
    });

    return this.invitationRepository.save(invitation);
  }

  async findByCode(code: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { code },
      relations: ['organization', 'invitedBy'],
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    return invitation;
  }

  async accept(code: string, userId: number) {
    const invitation = await this.findByCode(code);

    if (invitation.used) {
      throw new BadRequestException('Invitation has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException('This invitation is not for your email');
    }

    const existingMember = await this.memberRepository.findOne({
      where: {
        organization: { id: invitation.organization.id },
        user: { id: userId },
      },
    });
    if (existingMember) {
      throw new BadRequestException('You are already a member of this organization');
    }

    const member = this.memberRepository.create({
      user,
      organization: invitation.organization,
      role: invitation.role,
    });
    await this.memberRepository.save(member);

    invitation.used = true;
    await this.invitationRepository.save(invitation);

    return { message: 'Invitation accepted', organization: invitation.organization };
  }

  async revoke(id: number, userId: number) {
    const invitation = await this.invitationRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const isAdmin = await this.memberRepository.findOne({
      where: {
        organization: { id: invitation.organization.id },
        user: { id: userId },
        role: Role.ADMIN,
      },
    });
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can revoke invitations');
    }

    await this.invitationRepository.remove(invitation);
    return { message: 'Invitation revoked' };
  }

  async findByOrganization(orgId: number) {
    return this.invitationRepository.find({
      where: { organization: { id: orgId } },
      relations: ['invitedBy'],
      order: { expiresAt: 'DESC' },
    });
  }
}