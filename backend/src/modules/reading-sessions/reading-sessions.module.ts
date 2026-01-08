import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadingSessionsController } from './reading-sessions.controller';
import { ReadingSessionsService } from './reading-sessions.service';
import { ReadingSessionSchema } from './reading-sessions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ReadingSession', schema: ReadingSessionSchema }]),
  ],
  controllers: [ReadingSessionsController],
  providers: [ReadingSessionsService],
  exports: [ReadingSessionsService],
})
export class ReadingSessionsModule {}
