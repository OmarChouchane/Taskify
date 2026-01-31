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
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AuthGuard, PayloadRequest } from '@auth/auth/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { Role } from '@common/common.module';

@Controller('board')
@UseGuards(AuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(
    @Body() createBoardDto: CreateBoardDto,
    @Request() req: PayloadRequest,
  ) {
    return this.boardService.create(createBoardDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: PayloadRequest) {
    return this.boardService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.VIEWER)
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardService.update(+id, updateBoardDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.boardService.remove(+id);
  }

  @Get(':id/my-role')
  @UseGuards(RolesGuard)
  @Roles(Role.VIEWER)
  async getMyRole(@Param('id') id: string, @Request() req: PayloadRequest) {
    const role = await this.boardService.getUserRole(+id, req.user.id);
    return { role };
  }
}
