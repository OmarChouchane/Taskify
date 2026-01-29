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
} from "@nestjs/common";
import { BoardService } from "./board.service";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { AuthGuard, PayloadRequest } from "src/auth/auth/auth.guard";

@Controller("board")
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

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.boardService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardService.update(+id, updateBoardDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.boardService.remove(+id);
  }
}
