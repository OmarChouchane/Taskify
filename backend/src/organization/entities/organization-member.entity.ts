import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from '@user/entities/user.entity';
import { Role } from '@common/common.module';

@Entity()
export class OrganizationMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => User, (user) => user.organizationMemberships)
  user: User;

  @ManyToOne(() => Organization, (org) => org.members)
  organization: Organization;
}
