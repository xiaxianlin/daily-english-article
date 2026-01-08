import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReadingSession } from './reading-sessions.schema';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { SubmitUnderstandingDto } from './dto/submit-understanding.dto';

@Injectable()
export class ReadingSessionsService {
  private readonly logger = new Logger(ReadingSessionsService.name);

  constructor(@InjectModel('ReadingSession') private sessionModel: Model<ReadingSession>) {}

  async create(userId: string, createSessionDto: CreateSessionDto): Promise<ReadingSession> {
    // Check if user already has an active session for this article
    const existingSession = await this.sessionModel.findOne({
      userId,
      articleId: createSessionDto.articleId,
      status: 'in_progress',
    });

    if (existingSession) {
      return existingSession;
    }

    const session = new this.sessionModel({
      userId,
      articleId: createSessionDto.articleId,
      status: 'in_progress',
      startedAt: new Date(),
      progress: {},
    });

    return session.save();
  }

  async findByUser(userId: string, status?: string) {
    const filter: any = { userId };
    if (status) {
      filter.status = status;
    }

    const sessions = await this.sessionModel
      .find(filter)
      .sort({ startedAt: -1 })
      .populate('articleId', 'title domain difficulty')
      .lean()
      .exec();

    return sessions;
  }

  async findOne(id: string): Promise<ReadingSession> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) {
      throw new NotFoundException('Reading session not found');
    }
    return session;
  }

  async findByUserAndArticle(userId: string, articleId: string): Promise<ReadingSession | null> {
    const session = await this.sessionModel.findOne({ userId, articleId }).exec();
    return session;
  }

  async updateProgress(
    id: string,
    updateProgressDto: UpdateProgressDto,
  ): Promise<ReadingSession> {
    const session = await this.findOne(id);

    if (session.status !== 'in_progress') {
      throw new BadRequestException('Cannot update progress on completed or abandoned sessions');
    }

    const { field, booleanValue, arrayValue } = updateProgressDto;

    if (field && booleanValue !== undefined) {
      (session.progress as any)[field] = booleanValue;
    } else if (field && arrayValue) {
      (session.progress as any)[field] = arrayValue;
    }

    return session.save();
  }

  async submitUnderstandingAnswer(
    id: string,
    submitUnderstandingDto: SubmitUnderstandingDto,
  ): Promise<ReadingSession> {
    const session = await this.findOne(id);

    if (session.status !== 'in_progress') {
      throw new BadRequestException('Cannot submit answer on completed or abandoned sessions');
    }

    if (session.progress.understandingAnswered) {
      throw new BadRequestException('Understanding answer already submitted');
    }

    session.understandingAnswer = {
      questionId: submitUnderstandingDto.questionId as any,
      answer: submitUnderstandingDto.answer,
      answeredAt: new Date(),
    };

    session.progress.understandingAnswered = true;

    return session.save();
  }

  async completeSession(id: string): Promise<ReadingSession> {
    const session = await this.findOne(id);

    if (session.status !== 'in_progress') {
      throw new BadRequestException('Session is not in progress');
    }

    session.status = 'completed';
    session.completedAt = new Date();

    // Calculate time spent
    const startTime = new Date(session.startedAt).getTime();
    const endTime = new Date().getTime();
    const timeSpentMinutes = Math.round((endTime - startTime) / 60000);
    session.timeSpentMinutes = timeSpentMinutes;

    this.logger.log(`Session ${id} completed in ${timeSpentMinutes} minutes`);

    return session.save();
  }

  async abandonSession(id: string): Promise<ReadingSession> {
    const session = await this.findOne(id);

    if (session.status !== 'in_progress') {
      throw new BadRequestException('Session is not in progress');
    }

    session.status = 'abandoned';

    return session.save();
  }

  async getUserStats(userId: string) {
    const [
      totalSessions,
      completedSessions,
      inProgressSessions,
      avgTimeSpent,
      recentSessions,
    ] = await Promise.all([
      this.sessionModel.countDocuments({ userId }),
      this.sessionModel.countDocuments({ userId, status: 'completed' }),
      this.sessionModel.countDocuments({ userId, status: 'in_progress' }),
      this.sessionModel.aggregate([
        { $match: { userId, status: 'completed', timeSpentMinutes: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgTime: { $avg: '$timeSpentMinutes' } } },
      ]),
      this.sessionModel
        .find({ userId })
        .sort({ startedAt: -1 })
        .limit(5)
        .populate('articleId', 'title domain difficulty')
        .lean()
        .exec(),
    ]);

    return {
      totalSessions,
      completedSessions,
      inProgressSessions,
      avgTimeSpent: avgTimeSpent[0]?.avgTime || 0,
      recentSessions,
    };
  }
}
