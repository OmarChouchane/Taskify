import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'kanban.db',
      entities: [],
      synchronize: true,
    }),
    // TODO: Import modules here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
