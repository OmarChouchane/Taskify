import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@common/common.module';
import { Board } from '@board/entities/board.entity';
import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { Card } from '@card/entities/card.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly roleHierarchy: Record<Role, number> = {
    [Role.ADMIN]: 3,
    [Role.EDITOR]: 2,
    [Role.VIEWER]: 1,
  };

  constructor(
    private reflector: Reflector,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(OrganizationMember)
    private organizationMemberRepository: Repository<OrganizationMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const boardId = await this.extractBoardId(request);

    if (!userId || !boardId) {
      throw new ForbiddenException('Cannot determine board access');
    }

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['organization'],
    });

    if (!board) {
      throw new ForbiddenException('Board not found');
    }

    if (!board.organization) {
      throw new ForbiddenException('Board must belong to an organization');
    }

    // Check organization membership
    const orgMembership = await this.organizationMemberRepository.findOne({
      where: {
        user: { id: userId },
        organization: { id: board.organization.id },
      },
    });

    if (!orgMembership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    const requestedOrgId = request.params?.orgId;
    if (requestedOrgId && +requestedOrgId !== board.organization.id) {
      throw new ForbiddenException('Board does not belong to this organization');
    }

    request.effectiveRole = orgMembership.role;

    const userRoleLevel = this.roleHierarchy[orgMembership.role];
    const hasPermission = requiredRoles.some(
      (role) => userRoleLevel >= this.roleHierarchy[role],
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private async extractBoardId(request: any): Promise<number | null> {
    if (request.body?.boardId) return +request.body.boardId;
    if (request.params?.boardId) return +request.params.boardId;

    if (request.body?.swimlaneId) {
      return this.getBoardIdFromSwimlane(+request.body.swimlaneId);
    }

    const path = request.route?.path || '';

    if (path.includes('/board/')) {
      if (request.params?.id) return +request.params.id;
    }

    if (path.includes('/swimlane/')) {
      if (request.params?.id) {
        return this.getBoardIdFromSwimlane(+request.params.id);
      }
    }

    if (path.includes('/card/')) {
      if (request.params?.id) {
        return this.getBoardIdFromCard(+request.params.id);
      }
    }

    return null;
  }

  private async getBoardIdFromSwimlane(swimlaneId: number): Promise<number | null> {
    const swimlane = await this.swimlaneRepository.findOne({
      where: { id: swimlaneId },
      relations: ['board'],
    });
    return swimlane?.board?.id || null;
  }

  private async getBoardIdFromCard(cardId: number): Promise<number | null> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['swimlane', 'swimlane.board'],
    });
    return card?.swimlane?.board?.id || null;
  }
}
