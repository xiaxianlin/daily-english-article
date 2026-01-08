import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { LLMAgentsModule } from './modules/llm-agents/llm-agents.module';
import { ReadingSessionsModule } from './modules/reading-sessions/reading-sessions.module';
import { UserOutputsModule } from './modules/user-outputs/user-outputs.module';
import { MemoryItemsModule } from './modules/memory-items/memory-items.module';
import { JwtAuthGuard } from './modules/auth/jwt.guard';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-english-article'),
    UsersModule,
    AuthModule,
    ArticlesModule,
    LLMAgentsModule,
    ReadingSessionsModule,
    UserOutputsModule,
    MemoryItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AppModule {}
