import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MemoryItemType = 'sentencePattern' | 'concept' | 'expression';

@Schema({ timestamps: true })
export class MemoryItem extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['sentencePattern', 'concept', 'expression'] })
  type: MemoryItemType;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  context: string; // 来自哪篇文章

  @Prop({ required: true, type: Types.ObjectId, ref: 'Article' })
  sourceArticleId: Types.ObjectId;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ type: Date })
  lastReviewedAt?: Date;

  @Prop({ type: Number, default: 0, min: 0, max: 1 })
  masteryLevel: number; // 0-1, 掌握程度

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export const MemoryItemSchema = SchemaFactory.createForClass(MemoryItem);

// Indexes for faster queries
MemoryItemSchema.index({ userId: 1, type: 1 });
MemoryItemSchema.index({ userId: 1, createdAt: -1 });
MemoryItemSchema.index({ sourceArticleId: 1 });
