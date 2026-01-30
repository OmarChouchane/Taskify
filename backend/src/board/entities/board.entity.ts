import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { Organization } from '@organization/entities/organization.entity';
import { BoardHistory } from './board-history.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Organization, (org) => org.boards, { nullable: false })
  organization: Organization;

  @OneToMany(() => Swimlane, (swimlane) => swimlane.board)
  swimlanes: Swimlane[];

  @OneToMany(() => BoardHistory, (history) => history.board)
  histories: BoardHistory[];
}