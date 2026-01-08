import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnglishLevel = 'A2' | 'B1' | 'B2';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ enum: ['A2', 'B1', 'B2'], default: 'B1' })
  englishLevel: EnglishLevel;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ default: 'AI' })
  currentDomain: string;

  @Prop({ type: Date, default: Date.now })
  lastLoginAt: Date;

  @Prop({ select: false }) // Don't return passwordHash by default
  refreshToken?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Virtual for _id
  _id: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ interests: 1 });
