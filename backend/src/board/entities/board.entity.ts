import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "src/user/entities/user.entity";
import { Swimlane } from "src/swimlane/entities/swimlane.entity";

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User, (user) => user.boards)
  users: User[];

  @OneToMany(() => Swimlane, (swimlane) => swimlane.board)
  swimlanes: Swimlane[];
}
