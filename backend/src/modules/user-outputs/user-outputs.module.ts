import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserOutputsController } from './user-outputs.controller';
import { UserOutputsService } from './user-outputs.service';
import { UserOutputSchema } from './user-outputs.schema';
import { LLMAgentsModule } from '../llm-agents/llm-agents.module';
import { ArticlesModule } from '../articles/articles.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'UserOutput', schema: UserOutputSchema }]),
    LLMAgentsModule,
    ArticlesModule,
  ],
  controllers: [UserOutputsController],
  providers: [UserOutputsService],
  exports: [UserOutputsService],
})
export class UserOutputsModule {}
