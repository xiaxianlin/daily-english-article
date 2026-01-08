import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoryItemsController } from './memory-items.controller';
import { MemoryItemsService } from './memory-items.service';
import { MemoryItemSchema } from './memory-items.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'MemoryItem', schema: MemoryItemSchema }]),
  ],
  controllers: [MemoryItemsController],
  providers: [MemoryItemsService],
  exports: [MemoryItemsService],
})
export class MemoryItemsModule {}
