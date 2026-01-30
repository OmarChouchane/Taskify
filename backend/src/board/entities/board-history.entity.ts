import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActionType } from '@common/common.module';
import { User } from '@user/entities/user.entity';
import { Board } from './board.entity';

@Entity()
export class BoardHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ActionType })
  action: ActionType;

  @Column({ length: 20 })
  entityType: string;

  @Column()
  entityId: number;

  @Column({ type: 'json', nullable: true })
  changes: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.boardHistories)
  user: User;

  @ManyToOne(() => Board, (board) => board.histories)
  board: Board;
}