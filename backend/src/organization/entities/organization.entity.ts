import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationMember } from './organization-member.entity';
import { Board } from '@board/entities/board.entity';
import { Invitation } from '@invitation/entities/invitation.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrganizationMember, (member) => member.organization)
  members: OrganizationMember[];

  @OneToMany(() => Board, (board) => board.organization)
  boards: Board[];

  @OneToMany(() => Invitation, (invitation) => invitation.organization)
  invitations: Invitation[];
}
