import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MemoryItem } from './memory-items.schema';
import { CreateMemoryItemDto } from './dto/create-memory-item.dto';

@Injectable()
export class MemoryItemsService {
  private readonly logger = new Logger(MemoryItemsService.name);

  constructor(@InjectModel('MemoryItem') private memoryItemModel: Model<MemoryItem>) {}

  async create(userId: string, createMemoryItemDto: CreateMemoryItemDto): Promise<MemoryItem> {
    const memoryItem = new this.memoryItemModel({
      userId: userId as any,
      type: createMemoryItemDto.type,
      content: createMemoryItemDto.content,
      context: createMemoryItemDto.context,
      sourceArticleId: createMemoryItemDto.sourceArticleId as any,
      reviewCount: 0,
      masteryLevel: 0,
    });

    return memoryItem.save();
  }

  async findByUser(userId: string, type?: string) {
    const filter: any = { userId };
    if (type) {
      filter.type = type;
    }

    const memoryItems = await this.memoryItemModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return memoryItems;
  }

  async findOne(id: string): Promise<MemoryItem> {
    const memoryItem = await this.memoryItemModel.findById(id).exec();
    if (!memoryItem) {
      throw new NotFoundException('Memory item not found');
    }
    return memoryItem;
  }

  async remove(id: string): Promise<MemoryItem> {
    const memoryItem = await this.findOne(id);
    await this.memoryItemModel.findByIdAndDelete(id).exec();
    return memoryItem;
  }

  async incrementReviewCount(id: string): Promise<MemoryItem> {
    const memoryItem = await this.findOne(id);

    memoryItem.reviewCount += 1;
    memoryItem.lastReviewedAt = new Date();

    // Gradually increase mastery level with each review
    // Simple spaced repetition formula: mastery = min(1, 0.1 + reviewCount * 0.15)
    const newMasteryLevel = Math.min(1, 0.1 + memoryItem.reviewCount * 0.15);
    memoryItem.masteryLevel = newMasteryLevel;

    return memoryItem.save();
  }

  async getUserStats(userId: string) {
    const [
      totalItems,
      itemsByType,
      lowMasteryItems,
      highMasteryItems,
      recentItems,
    ] = await Promise.all([
      this.memoryItemModel.countDocuments({ userId }),
      this.memoryItemModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.memoryItemModel.countDocuments({
        userId,
        masteryLevel: { $lt: 0.5 },
      }),
      this.memoryItemModel.countDocuments({
        userId,
        masteryLevel: { $gte: 0.8 },
      }),
      this.memoryItemModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec(),
    ]);

    return {
      totalItems,
      itemsByType,
      lowMasteryItems,
      highMasteryItems,
      recentItems,
    };
  }

  /**
   * Batch create memory items from a completed reading session
   * This is typically called automatically when a user completes a reading session
   */
  async createFromSession(
    userId: string,
    articleId: string,
    dailySummary: {
      sentencePattern: string;
      concept: string;
      expression: string;
    },
    context: string,
  ) {
    const items = [
      {
        userId: userId as any,
        type: 'sentencePattern',
        content: dailySummary.sentencePattern,
        context,
        sourceArticleId: articleId as any,
      },
      {
        userId: userId as any,
        type: 'concept',
        content: dailySummary.concept,
        context,
        sourceArticleId: articleId as any,
      },
      {
        userId: userId as any,
        type: 'expression',
        content: dailySummary.expression,
        context,
        sourceArticleId: articleId as any,
      },
    ];

    const createdItems = await this.memoryItemModel.insertMany(items);
    this.logger.log(`Created ${createdItems.length} memory items for user ${userId}`);

    return createdItems;
  }
}
