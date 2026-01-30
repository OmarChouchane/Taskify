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
  Put,
} from '@nestjs/common';
import { SwimlaneService } from './swimlane.service';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { AuthGuard, PayloadRequest } from '@auth/auth/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { Role } from '@common/common.module';
import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto';

@Controller('swimlane')
@UseGuards(AuthGuard, RolesGuard)
export class SwimlaneController {
  constructor(private readonly swimlaneService: SwimlaneService) {}

  @Post()
  @Roles(Role.EDITOR)
  create(
    @Request() req: PayloadRequest,
    @Body() createSwimlaneDto: CreateSwimlaneDto,
  ) {
    return this.swimlaneService.create(createSwimlaneDto, req.user.id);
  }

  @Put('update-order')
  @Roles(Role.EDITOR)
  updateOrder(
    @Request() req: PayloadRequest,
    @Body() reorderedSwimlanes: ReordereSwimlaneDto,
  ) {
    return this.swimlaneService.updateSwimlaneOrders(
      reorderedSwimlanes,
      req.user.id,
    );
  }

  @Get('/board/:boardId')
  @Roles(Role.VIEWER)
  findAll(@Param('boardId') boardId: string, @Request() req: PayloadRequest) {
    return this.swimlaneService.findAllByBoardId(Number(boardId), req.user.id);
  }

  @Patch(':id')
  @Roles(Role.EDITOR)
  update(
    @Param('id') id: string,
    @Body() updateSwimlaneDto: UpdateSwimlaneDto,
    @Request() req: PayloadRequest,
  ) {
    return this.swimlaneService.update(+id, req.user.id, updateSwimlaneDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.swimlaneService.remove(+id, req.user.id);
  }
}