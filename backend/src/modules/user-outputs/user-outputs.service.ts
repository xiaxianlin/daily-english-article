import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserOutput } from './user-outputs.schema';
import { CreateUserOutputDto } from './dto/create-user-output.dto';
import { ProfessionalFeedbackAgent } from '../llm-agents/agents/professional-feedback.agent';
import { ArticlesService } from '../articles/articles.service';
import { Article } from '../articles/articles.schema';

@Injectable()
export class UserOutputsService {
  private readonly logger = new Logger(UserOutputsService.name);

  constructor(
    @InjectModel('UserOutput') private userOutputModel: Model<UserOutput>,
    private professionalFeedbackAgent: ProfessionalFeedbackAgent,
    private articlesService: ArticlesService,
  ) {}

  async create(userId: string, createUserOutputDto: CreateUserOutputDto): Promise<UserOutput> {
    const userOutput = new this.userOutputModel({
      userId: userId as any,
      articleId: createUserOutputDto.articleId as any,
      sessionId: createUserOutputDto.sessionId as any,
      prompt: createUserOutputDto.prompt,
      userOutput: createUserOutputDto.userOutput,
      submittedAt: new Date(),
    });

    return userOutput.save();
  }

  async generateFeedback(userOutputId: string): Promise<UserOutput> {
    const userOutput = await this.userOutputModel.findById(userOutputId).exec();

    if (!userOutput) {
      throw new NotFoundException('User output not found');
    }

    if (userOutput.aiFeedback) {
      return userOutput; // Feedback already generated
    }

    try {
      // Get article to provide context to LLM
      const article = await this.articlesService.findOne(userOutput.articleId.toString());

      // Generate AI feedback
      const feedback = await this.professionalFeedbackAgent.evaluateOutput(
        article.content,
        article.readingMap,
        userOutput.prompt,
        userOutput.userOutput,
      );

      userOutput.aiFeedback = feedback.feedback;
      userOutput.feedbackGeneratedAt = new Date();

      const saved = await userOutput.save();
      this.logger.log(`Feedback generated for user output ${userOutputId}`);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to generate feedback: ${error.message}`);
      throw error;
    }
  }

  async findByUser(userId: string, articleId?: string) {
    const filter: any = { userId };
    if (articleId) {
      filter.articleId = articleId;
    }

    const outputs = await this.userOutputModel
      .find(filter)
      .sort({ submittedAt: -1 })
      .lean()
      .exec();

    return outputs;
  }

  async findOne(id: string): Promise<UserOutput> {
    const userOutput = await this.userOutputModel.findById(id).exec();
    if (!userOutput) {
      throw new NotFoundException('User output not found');
    }
    return userOutput;
  }

  async getFeedback(id: string): Promise<UserOutput> {
    const userOutput = await this.findOne(id);

    if (!userOutput.aiFeedback) {
      throw new NotFoundException('Feedback not yet generated');
    }

    return userOutput;
  }
}
