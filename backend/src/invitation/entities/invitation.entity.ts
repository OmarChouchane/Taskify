import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from '@organization/entities/organization.entity';
import { User } from '@user/entities/user.entity';
import { Role } from '@common/common.module';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 255 })
  email: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ default: false })
  used: boolean;

  @Column()
  expiresAt: Date;

  @ManyToOne(() => Organization, (org) => org.invitations)
  organization: Organization;

  @ManyToOne(() => User, (user) => user.invitationsSent)
  invitedBy: User;
}
