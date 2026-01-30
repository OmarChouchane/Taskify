import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { User } from '@user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  content: string;

  @Column()
  order: number;

  @Column({ nullable: true })
  assigneId: number;

  @ManyToOne(() => User, (user) => user.cards)
  @JoinColumn()
  assigne: User;

  @Column()
  swimlaneId: number;

  @ManyToOne(() => Swimlane, (swimlane) => swimlane.cards)
  @JoinColumn()
  swimlane: Swimlane;
}
