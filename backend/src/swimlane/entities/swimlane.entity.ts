import { Board } from '@board/entities/board.entity';
import { Card } from '@card/entities/card.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Swimlane {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  order: number;

  @ManyToOne(() => Board, (board) => board.swimlanes)
  board: Board;

  @OneToMany(() => Card, (card) => card.swimlane)
  cards: Card[];
}
