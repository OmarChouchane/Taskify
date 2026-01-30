import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddOrgMemberDto } from './dto/add-org-member.dto';
import { UpdateOrgMemberRoleDto } from './dto/update-org-member-role.dto';
import { AuthGuard, PayloadRequest } from '@auth/auth/auth.guard';

@Controller('organization')
@UseGuards(AuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() dto: CreateOrganizationDto, @Request() req: PayloadRequest) {
    return this.organizationService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Request() req: PayloadRequest) {
    return this.organizationService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: PayloadRequest) {
    const isMember = await this.organizationService.isMember(+id, req.user.id);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this organization');
    }
    return this.organizationService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @Request() req: PayloadRequest,
  ) {
    const isAdmin = await this.organizationService.isAdmin(+id, req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can update the organization');
    }
    return this.organizationService.update(+id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    const isAdmin = await this.organizationService.isAdmin(+id, req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can delete the organization');
    }
    return this.organizationService.remove(+id, req.user.id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Request() req: PayloadRequest) {
    const isMember = await this.organizationService.isMember(+id, req.user.id);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this organization');
    }
    return this.organizationService.getMembers(+id);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddOrgMemberDto,
    @Request() req: PayloadRequest,
  ) {
    const isAdmin = await this.organizationService.isAdmin(+id, req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can add members');
    }
    return this.organizationService.addMember(+id, dto.email, dto.role);
  }

  @Patch(':id/members/:memberId')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateOrgMemberRoleDto,
    @Request() req: PayloadRequest,
  ) {
    const isAdmin = await this.organizationService.isAdmin(+id, req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can change member roles');
    }
    return this.organizationService.updateMemberRole(+id, +memberId, dto.role);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req: PayloadRequest,
  ) {
    const isAdmin = await this.organizationService.isAdmin(+id, req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can remove members');
    }
    return this.organizationService.removeMember(+id, +memberId, req.user.id);
  }

  @Get(':id/my-role')
  async getMyRole(@Param('id') id: string, @Request() req: PayloadRequest) {
    const role = await this.organizationService.getUserRole(+id, req.user.id);
    return { role };
  }
}