import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { User } from '@user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @ManyToOne(() => User, (user) => user.cards, { nullable: true })
  assigne: User;

  @ManyToOne(() => Swimlane, (swimlane) => swimlane.cards)
  swimlane: Swimlane;
}
