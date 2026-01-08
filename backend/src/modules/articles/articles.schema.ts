import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ArticleDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ArticleDomain = 'AI' | 'finance' | 'economics' | 'technology' | 'sociology';

@Schema({ timestamps: true })
export class Article extends Document {
  // Basic Information
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({
    required: true,
    enum: ['AI', 'finance', 'economics', 'technology', 'sociology'],
  })
  domain: ArticleDomain;

  @Prop({ required: true, enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty: ArticleDifficulty;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: Number })
  wordCount: number;

  // AI-generated content
  @Prop({
    type: {
      coreQuestion: String,
      mainConclusion: String,
      argumentStructure: [String],
    },
  })
  readingMap?: {
    coreQuestion: string;
    mainConclusion: string;
    argumentStructure: string[];
  };

  @Prop({
    type: [
      {
        paragraphIndex: Number,
        text: String,
        role: { type: String, enum: ['definition', 'argument', 'refutation'] },
        keySentences: [String],
      },
    ],
  })
  keyParagraphs?: {
    paragraphIndex: number;
    text: string;
    role: 'definition' | 'argument' | 'refutation';
    keySentences: string[];
  }[];

  @Prop({
    type: [
      {
        expression: String,
        explanation: String,
        transferable: Boolean,
      },
    ],
  })
  languageBreakdown?: {
    expression: string;
    explanation: string;
    transferable: boolean;
  }[];

  @Prop({
    type: [
      {
        question: String,
        sampleAnswer: String,
      },
    ],
  })
  understandingQuestions?: {
    question: string;
    sampleAnswer: string;
  }[];

  // Metadata
  @Prop({
    type: {
      sourceUrl: String,
      author: String,
      tags: [String],
    },
  })
  metadata?: {
    sourceUrl?: string;
    author?: string;
    tags?: string[];
  };

  // Scheduling
  @Prop({ type: Date })
  scheduledFor?: Date;

  @Prop({ type: Date })
  publishedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

// Indexes for faster queries
ArticleSchema.index({ domain: 1, difficulty: 1 });
ArticleSchema.index({ scheduledFor: 1 });
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ title: 'text', content: 'text' }); // Full-text search
