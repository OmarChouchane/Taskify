import {
  Controller,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { AuthGuard, PayloadRequest } from '@auth/auth/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { Role } from '@common/common.module';
import { ReorderedCardDto } from './dto/reorder-cards.dto';

@Controller('card')
@UseGuards(AuthGuard, RolesGuard)
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  @Roles(Role.EDITOR)
  create(@Body() createCardDto: CreateCardDto, @Request() req: PayloadRequest) {
    return this.cardService.create(createCardDto, req.user.id);
  }

  @Put('update-order')
  @Roles(Role.EDITOR)
  updateOrder(
    @Body() reorderCards: ReorderedCardDto,
    @Request() req: PayloadRequest,
  ) {
    return this.cardService.updateCardOrdersAndSwimlanes(
      reorderCards,
      req.user.id,
    );
  }

  @Patch(':id')
  @Roles(Role.EDITOR)
  update(
    @Param('id') id: string,
    @Request() req: PayloadRequest,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardService.update(+id, req.user.id, updateCardDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.cardService.remove(+id, req.user.id);
  }
}