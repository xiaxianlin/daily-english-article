import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './articles.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { DomainCuratorAgent } from '../llm-agents/agents/domain-curator.agent';
import { ArgumentMapperAgent } from '../llm-agents/agents/argument-mapper.agent';
import { LanguageReasoningAgent } from '../llm-agents/agents/language-reasoning.agent';
import { ProfessionalFeedbackAgent } from '../llm-agents/agents/professional-feedback.agent';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectModel('Article') private articleModel: Model<Article>,
    private domainCuratorAgent: DomainCuratorAgent,
    private argumentMapperAgent: ArgumentMapperAgent,
    private languageReasoningAgent: LanguageReasoningAgent,
    private professionalFeedbackAgent: ProfessionalFeedbackAgent,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    // Check if article with same title already exists
    const existingArticle = await this.articleModel.findOne({
      title: createArticleDto.title,
    });

    if (existingArticle) {
      throw new BadRequestException('Article with this title already exists');
    }

    const article = new this.articleModel({
      ...createArticleDto,
      metadata: {
        sourceUrl: createArticleDto.sourceUrl,
        author: createArticleDto.author,
        tags: createArticleDto.tags || [],
      },
    });

    return article.save();
  }

  async findAll(query: QueryArticlesDto) {
    const { offset = 0, limit = 10, domain, difficulty, search } = query;

    const filter: any = {};

    // Filter by domain
    if (domain) {
      filter.domain = domain;
    }

    // Filter by difficulty
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Get published articles only (not scheduled for future)
    filter.$or = [
      { scheduledFor: { $exists: false } },
      { scheduledFor: { $lte: new Date() } },
    ];

    const [articles, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      this.articleModel.countDocuments(filter),
    ]);

    return {
      data: articles,
      meta: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const article = await this.articleModel.findById(id).lean().exec();
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async getTodayArticle(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find article scheduled for today
    const article = await this.articleModel
      .findOne({
        scheduledFor: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .lean()
      .exec();

    if (article) {
      return article;
    }

    // If no article scheduled for today, get the most recent published article
    const recentArticle = await this.articleModel
      .findOne({
        publishedAt: { $exists: true },
      })
      .sort({ publishedAt: -1 })
      .lean()
      .exec();

    if (recentArticle) {
      return recentArticle;
    }

    throw new NotFoundException('No article available for today');
  }

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.articleModel.findById(id).exec();

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // If publishing for the first time and scheduledFor is today or in the past, set publishedAt
    if (!article.publishedAt && (updateArticleDto.publishedAt || this.shouldPublishNow(article))) {
      updateArticleDto.publishedAt = updateArticleDto.publishedAt || new Date();
    }

    Object.assign(article, updateArticleDto);
    return article.save();
  }

  async remove(id: string): Promise<Article> {
    const article = await this.articleModel.findById(id).exec();

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.articleModel.findByIdAndDelete(id).exec();
    return article;
  }

  async scheduleArticle(id: string, scheduledDate: Date): Promise<Article> {
    const article = await this.articleModel.findById(id).exec();

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    article.scheduledFor = scheduledDate;

    // If scheduled date is in the past or today, also publish it
    if (scheduledDate <= new Date()) {
      article.publishedAt = new Date();
    }

    return article.save();
  }

  private shouldPublishNow(article: Article): boolean {
    if (!article.scheduledFor) {
      return false;
    }
    return article.scheduledFor <= new Date();
  }

  async getStatistics() {
    const [
      totalArticles,
      publishedArticles,
      scheduledArticles,
      articlesByDomain,
      articlesByDifficulty,
    ] = await Promise.all([
      this.articleModel.countDocuments(),
      this.articleModel.countDocuments({ publishedAt: { $exists: true } }),
      this.articleModel.countDocuments({
        scheduledFor: { $gt: new Date() },
        publishedAt: { $exists: false },
      }),
      this.articleModel.aggregate([
        { $group: { _id: '$domain', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.articleModel.aggregate([
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      totalArticles,
      publishedArticles,
      scheduledArticles,
      articlesByDomain,
      articlesByDifficulty,
    };
  }

  /**
   * Process article with LLM Agents to generate AI content
   * This is a long-running operation that calls multiple LLM agents
   */
  async processWithAI(articleId: string): Promise<Article> {
    this.logger.log(`Starting AI processing for article ${articleId}`);

    const article = await this.articleModel.findById(articleId).exec();
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    try {
      // Step 1: Analyze with Domain Curator
      this.logger.log('Step 1: Domain analysis');
      const domainAnalysis = await this.domainCuratorAgent.analyzeArticle(article.content);

      // Step 2: Extract Reading Map and Key Paragraphs
      this.logger.log('Step 2: Extracting reading map and key paragraphs');
      const argumentAnalysis = await this.argumentMapperAgent.generateFullArticleAnalysis(
        article.content,
      );

      // Step 3: Extract Language Breakdown
      this.logger.log('Step 3: Extracting language breakdown');
      const languageBreakdown = await this.languageReasoningAgent.extractLanguageBreakdown(
        article.content,
        argumentAnalysis.keyParagraphs,
      );

      // Step 4: Generate Understanding Questions
      this.logger.log('Step 4: Generating understanding questions');
      const understandingQuestions = await this.professionalFeedbackAgent.generateUnderstandingQuestions(
        article.content,
        argumentAnalysis.readingMap,
      );

      // Update article with AI-generated content
      article.readingMap = argumentAnalysis.readingMap;
      article.keyParagraphs = argumentAnalysis.keyParagraphs;
      article.languageBreakdown = languageBreakdown;
      article.understandingQuestions = understandingQuestions;

      // Update domain and difficulty if AI analysis suggests different values
      article.domain = domainAnalysis.domain as any;
      article.difficulty = domainAnalysis.difficulty as any;

      const savedArticle = await article.save();
      this.logger.log(`AI processing completed for article ${articleId}`);

      return savedArticle;
    } catch (error) {
      this.logger.error(`AI processing failed for article ${articleId}: ${error.message}`);
      throw error;
    }
  }
}
