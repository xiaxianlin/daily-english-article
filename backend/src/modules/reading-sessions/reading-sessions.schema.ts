import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

@Schema({ timestamps: true })
export class ReadingSession extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Article' })
  articleId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
  })
  status: SessionStatus;

  @Prop({ required: true, type: Date })
  startedAt: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({
    type: {
      readingMapViewed: { type: Boolean, default: false },
      keyParagraphsViewed: [Number],
      languageBreakdownViewed: { type: Boolean, default: false },
      understandingAnswered: { type: Boolean, default: false },
      outputSubmitted: { type: Boolean, default: false },
    },
    default: {},
  })
  progress: {
    readingMapViewed: boolean;
    keyParagraphsViewed: number[];
    languageBreakdownViewed: boolean;
    understandingAnswered: boolean;
    outputSubmitted: boolean;
  };

  @Prop({
    type: {
      questionId: Types.ObjectId,
      answer: String,
      answeredAt: Date,
    },
  })
  understandingAnswer?: {
    questionId: Types.ObjectId;
    answer: string;
    answeredAt: Date;
  };

  @Prop({
    type: {
      sentencePattern: String,
      concept: String,
      expression: String,
    },
  })
  dailySummary?: {
    sentencePattern: string;
    concept: string;
    expression: string;
  };

  @Prop({ type: Number, default: 0 })
  timeSpentMinutes?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export const ReadingSessionSchema = SchemaFactory.createForClass(ReadingSession);

// Indexes for faster queries
ReadingSessionSchema.index({ userId: 1, articleId: 1 }, { unique: true }); // One session per user per article
ReadingSessionSchema.index({ userId: 1, status: 1 });
ReadingSessionSchema.index({ startedAt: -1 });
