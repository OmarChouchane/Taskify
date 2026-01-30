import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import { Session } from './entities/session.entity';
import { Board } from '@board/entities/board.entity';
import { Swimlane } from '@swimlane/entities/swimlane.entity';
import { Card } from '@card/entities/card.entity';
import { OrganizationMember } from '@organization/entities/organization-member.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@user/user.module';
import { RolesGuard } from './guards/roles.guard';
import { AuthGuard } from './auth/auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesGuard, AuthGuard],
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([User, Session, Board, Swimlane, Card, OrganizationMember]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '3h') },
      }),
    }),
  ],
  exports: [AuthService, RolesGuard, AuthGuard],
})
export class AuthModule {}