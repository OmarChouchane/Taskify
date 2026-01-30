import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';
import { User } from '@user/entities/user.entity';
import { Board } from '@board/entities/board.entity';
import { BoardHistory } from '@board/entities/board-history.entity';
import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { Card } from '@card/entities/card.entity';
import { Organization } from '@organization/entities/organization.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { Invitation } from '@invitation/entities/invitation.entity';
import { Session } from '@auth/entities/session.entity';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [
          User,
          Board,
          BoardHistory,
          Swimlane,
          Card,
          Organization,
          OrganizationMember,
          Invitation,
          Session,
        ],
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
    }),
    SeederModule,
  ],
})
class SeedModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  const seeder = app.get(SeederService);
  const args = process.argv.slice(2);

  if (args.includes('--clear')) {
    await seeder.clear();
  }

  if (!args.includes('--clear-only')) {
    await seeder.seed();
  }

  await app.close();
}

bootstrap()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });