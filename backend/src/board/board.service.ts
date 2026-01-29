import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Board } from "./entities/board.entity";
import { Repository } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const board = new Board();
    board.name = createBoardDto.name;
    board.description = createBoardDto.description;
    board.users = [user];

    return this.boardRepository.save(board);
  }

  async findAll(userId: number) {
    return this.boardRepository.find({
      where: {
        users: {
          id: userId,
        },
      },
      relations: ["users"],
    });
  }

  async findOne(id: number) {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ["users", "swimlanes", "swimlanes.cards"],
      order: {
        swimlanes: {
          order: "ASC",
          cards: {
            order: "ASC",
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
}
