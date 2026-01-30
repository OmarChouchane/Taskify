import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty({ message: 'Card name is required' })
  @MaxLength(100, { message: 'Card name cannot exceed 100 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Card content is required' })
  @MaxLength(5000, { message: 'Card content cannot exceed 5000 characters' })
  content: string;

  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order must be non-negative' })
  order: number;

  @IsInt({ message: 'Swimlane ID must be an integer' })
  @IsPositive({ message: 'Swimlane ID must be a positive number' })
  swimlaneId: number;
}