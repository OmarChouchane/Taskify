import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AuthGuard, PayloadRequest } from '@auth/auth/auth.guard';
import { OrganizationService } from '@organization/organization.service';

@Controller('invitation')
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly organizationService: OrganizationService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateInvitationDto, @Request() req: PayloadRequest) {
    return this.invitationService.create(dto, req.user.id);
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.invitationService.findByCode(code);
  }

  @Post(':code/accept')
  @UseGuards(AuthGuard)
  accept(@Param('code') code: string, @Request() req: PayloadRequest) {
    return this.invitationService.accept(code, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  revoke(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.invitationService.revoke(+id, req.user.id);
  }

  @Get('organization/:orgId')
  @UseGuards(AuthGuard)
  async findByOrganization(
    @Param('orgId') orgId: string,
    @Request() req: PayloadRequest,
  ) {
    const isAdmin = await this.organizationService.isAdmin(+orgId, req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can view invitations');
    }
    return this.invitationService.findByOrganization(+orgId);
  }
}