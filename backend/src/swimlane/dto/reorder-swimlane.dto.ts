import { Type } from 'class-transformer';
import { IsArray, IsInt, IsPositive, Min, ValidateNested } from 'class-validator';

export class ReordereSwimlaneItemDto {
  @IsInt({ message: 'Swimlane ID must be an integer' })
  @IsPositive({ message: 'Swimlane ID must be a positive number' })
  id: number;

  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order must be non-negative' })
  order: number;
}

export class ReordereSwimlaneDto {
  @IsInt({ message: 'Board ID must be an integer' })
  @IsPositive({ message: 'Board ID must be a positive number' })
  boardId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReordereSwimlaneItemDto)
  items: ReordereSwimlaneItemDto[];
}