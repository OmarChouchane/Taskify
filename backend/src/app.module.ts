import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { BoardModule } from "./board/board.module";
import { User } from "./user/entities/user.entity";
import { Board } from "./board/entities/board.entity";
import { AuthGuard } from "./auth/auth/auth.guard";

@Module({
  imports: [
    UserModule,
    AuthModule,
    BoardModule,
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "kanban.db",
      entities: [User, Board],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
