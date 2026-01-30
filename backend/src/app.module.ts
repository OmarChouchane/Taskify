import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from '@common/common.module';
import { UserModule } from '@user/user.module';
import { AuthModule } from '@auth/auth.module';
import { BoardModule } from '@board/board.module';
import { SwimlaneModule } from '@swimlane/swimlane.module';
import { CardModule } from '@card/card.module';
import { OrganizationModule } from '@organization/organization.module';
import { InvitationModule } from '@invitation/invitation.module';
import { User } from '@user/entities/user.entity';
import { Board } from '@board/entities/board.entity';
import { BoardHistory } from '@board/entities/board-history.entity';
import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { Card } from '@card/entities/card.entity';
import { Organization } from '@organization/entities/organization.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { Invitation } from '@invitation/entities/invitation.entity';
import { Session } from '@auth/entities/session.entity';
import { AuthGuard } from '@auth/auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    UserModule,
    AuthModule,
    BoardModule,
    SwimlaneModule,
    CardModule,
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
    OrganizationModule,
    InvitationModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
