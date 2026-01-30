import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@user/entities/user.entity';
import { Board } from '@board/entities/board.entity';
import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { Card } from '@card/entities/card.entity';
import { Organization } from '@organization/entities/organization.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { HashService } from '@common/common.module';
import { Role } from '@common/common.module';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private organizationMemberRepository: Repository<OrganizationMember>,
    private hashService: HashService,
  ) {}

  async seed() {
    console.log('Seeding database...');

    // Create users
    const users = await this.seedUsers();
    console.log(`Created ${users.length} users`);

    // Create organizations
    const organizations = await this.seedOrganizations(users);
    console.log(`Created ${organizations.length} organizations`);

    // Create boards
    const boards = await this.seedBoards(organizations);
    console.log(`Created ${boards.length} boards`);

    // Create swimlanes
    const swimlanes = await this.seedSwimlanes(boards);
    console.log(`Created ${swimlanes.length} swimlanes`);

    // Create cards
    const cards = await this.seedCards(swimlanes, users);
    console.log(`Created ${cards.length} cards`);

    console.log('Seeding completed!');
  }

  private async seedUsers(): Promise<User[]> {
    const existingUser = await this.userRepository.findOne({
      where: { email: 'admin@taskify.com' },
    });

    if (existingUser) {
      console.log('Users already seeded, skipping...');
      return this.userRepository.find();
    }

    const usersData = [
      {
        email: 'admin@taskify.com',
        password: await this.hashService.hash('admin123'),
        firstName: 'Admin',
        lastName: 'User',
      },
      {
        email: 'john@taskify.com',
        password: await this.hashService.hash('john123'),
        firstName: 'John',
        lastName: 'Doe',
      },
      {
        email: 'jane@taskify.com',
        password: await this.hashService.hash('jane123'),
        firstName: 'Jane',
        lastName: 'Smith',
      },
    ];

    const users: User[] = [];
    for (const userData of usersData) {
      const user = this.userRepository.create(userData);
      users.push(await this.userRepository.save(user));
    }

    return users;
  }

  private async seedOrganizations(users: User[]): Promise<Organization[]> {
    const existingOrg = await this.organizationRepository.findOne({
      where: { name: 'Taskify Inc' },
    });

    if (existingOrg) {
      console.log('Organizations already seeded, skipping...');
      return this.organizationRepository.find();
    }

    const orgsData = [
      { name: 'Taskify Inc', description: 'Main company organization' },
      { name: 'Marketing Team', description: 'Marketing department' },
    ];

    const organizations: Organization[] = [];
    for (let i = 0; i < orgsData.length; i++) {
      const org = this.organizationRepository.create(orgsData[i]);
      const savedOrg = await this.organizationRepository.save(org);

      // Add admin user as admin to all orgs
      const adminMember = this.organizationMemberRepository.create({
        user: users[0],
        organization: savedOrg,
        role: Role.ADMIN,
      });
      await this.organizationMemberRepository.save(adminMember);

      // Add other users to first org
      if (i === 0) {
        const editorMember = this.organizationMemberRepository.create({
          user: users[1],
          organization: savedOrg,
          role: Role.EDITOR,
        });
        await this.organizationMemberRepository.save(editorMember);

        const viewerMember = this.organizationMemberRepository.create({
          user: users[2],
          organization: savedOrg,
          role: Role.VIEWER,
        });
        await this.organizationMemberRepository.save(viewerMember);
      }

      organizations.push(savedOrg);
    }

    return organizations;
  }

  private async seedBoards(organizations: Organization[]): Promise<Board[]> {
    const existingBoard = await this.boardRepository.findOne({
      where: { name: 'Project Alpha' },
    });

    if (existingBoard) {
      console.log('Boards already seeded, skipping...');
      return this.boardRepository.find({ relations: ['organization'] });
    }

    const boardsData = [
      { name: 'Project Alpha', description: 'Main development project', orgIndex: 0 },
      { name: 'Marketing Campaign', description: 'Q1 Marketing initiatives', orgIndex: 1 },
      { name: 'Bug Tracker', description: 'Track and fix bugs', orgIndex: 0 },
    ];

    const boards: Board[] = [];
    for (const boardData of boardsData) {
      const board = this.boardRepository.create({
        name: boardData.name,
        description: boardData.description,
        organization: organizations[boardData.orgIndex],
      });
      boards.push(await this.boardRepository.save(board));
    }

    return boards;
  }

  private async seedSwimlanes(boards: Board[]): Promise<Swimlane[]> {
    const existingSwimlane = await this.swimlaneRepository.findOne({
      where: { name: 'To Do' },
    });

    if (existingSwimlane) {
      console.log('Swimlanes already seeded, skipping...');
      return this.swimlaneRepository.find();
    }

    const swimlanesData = ['To Do', 'In Progress', 'Review', 'Done'];
    const swimlanes: Swimlane[] = [];

    for (const board of boards) {
      for (let i = 0; i < swimlanesData.length; i++) {
        const swimlane = this.swimlaneRepository.create({
          name: swimlanesData[i],
          order: i,
          board,
        });
        swimlanes.push(await this.swimlaneRepository.save(swimlane));
      }
    }

    return swimlanes;
  }

  private async seedCards(
    swimlanes: Swimlane[],
    users: User[],
  ): Promise<Card[]> {
    const existingCard = await this.cardRepository.findOne({
      where: { name: 'Setup project structure' },
    });

    if (existingCard) {
      console.log('Cards already seeded, skipping...');
      return this.cardRepository.find();
    }

    const cardsData = [
      {
        name: 'Setup project structure',
        content: 'Initialize the project with proper folder structure',
      },
      {
        name: 'Design database schema',
        content: 'Create ERD and define all entities',
      },
      {
        name: 'Implement authentication',
        content: 'JWT + session based auth',
      },
      {
        name: 'Create API endpoints',
        content: 'RESTful API for all resources',
      },
      {
        name: 'Write unit tests',
        content: 'Achieve 80% code coverage',
      },
      {
        name: 'Setup CI/CD',
        content: 'GitHub Actions for automated testing and deployment',
      },
    ];

    const cards: Card[] = [];
    const todoSwimlanes = swimlanes.filter((s) => s.name === 'To Do');

    for (let i = 0; i < cardsData.length; i++) {
      const swimlane = todoSwimlanes[i % todoSwimlanes.length];
      const card = this.cardRepository.create({
        ...cardsData[i],
        order: i,
        swimlane,
        assigne: users[i % users.length],
      });
      cards.push(await this.cardRepository.save(card));
    }

    return cards;
  }

  async clear() {
    console.log('Clearing database...');

    await this.cardRepository.delete({});
    await this.swimlaneRepository.delete({});
    await this.boardRepository.delete({});
    await this.organizationMemberRepository.delete({});
    await this.organizationRepository.delete({});
    await this.userRepository.delete({});

    console.log('Database cleared!');
  }
}
