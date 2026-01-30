import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Card } from '@card/entities/card.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { Invitation } from '@invitation/entities/invitation.entity';
import { BoardHistory } from '@board/entities/board-history.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 200 })
  password: string;

  @Column({ default: false })
  emailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrganizationMember, (member) => member.user)
  organizationMemberships: OrganizationMember[];

  @OneToMany(() => Card, (card) => card.assigne)
  cards: Card[];

  @OneToMany(() => Invitation, (invitation) => invitation.invitedBy)
  invitationsSent: Invitation[];

  @OneToMany(() => BoardHistory, (history) => history.user)
  boardHistories: BoardHistory[];
}