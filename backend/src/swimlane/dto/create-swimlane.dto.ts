import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateSwimlaneDto {
  @IsString()
  @IsNotEmpty({ message: 'Swimlane name is required' })
  @MaxLength(100, { message: 'Swimlane name cannot exceed 100 characters' })
  name: string;

  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order must be non-negative' })
  order: number;

  @IsInt({ message: 'Board ID must be an integer' })
  @IsPositive({ message: 'Board ID must be a positive number' })
  boardId: number;
}