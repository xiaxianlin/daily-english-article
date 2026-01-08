import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserOutput extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Article' })
  articleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ReadingSession' })
  sessionId: Types.ObjectId;

  @Prop({ required: true })
  prompt: string;

  @Prop({ required: true })
  userOutput: string;

  @Prop({ required: true, type: Date })
  submittedAt: Date;

  @Prop({
    type: {
      logicScore: { type: Number, min: 1, max: 5 },
      toneScore: { type: Number, min: 1, max: 5 },
      clarityScore: { type: Number, min: 1, max: 5 },
      strengths: [String],
      logicFeedback: String,
      toneFeedback: String,
      suggestions: [
        {
          original: String,
          improvement: String,
          reason: String,
        },
      ],
      overallAssessment: String,
    },
  })
  aiFeedback?: {
    logicScore: number;
    toneScore: number;
    clarityScore: number;
    strengths: string[];
    logicFeedback: string;
    toneFeedback: string;
    suggestions: {
      original: string;
      improvement: string;
      reason: string;
    }[];
    overallAssessment: string;
  };

  @Prop({ type: Date })
  feedbackGeneratedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export const UserOutputSchema = SchemaFactory.createForClass(UserOutput);

// Indexes for faster queries
UserOutputSchema.index({ userId: 1, articleId: 1 });
UserOutputSchema.index({ sessionId: 1 });
UserOutputSchema.index({ userId: 1, submittedAt: -1 });
