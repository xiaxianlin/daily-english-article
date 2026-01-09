import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ArticlesService } from './articles.service';
import { Article } from './articles.schema';
import { DomainCuratorAgent } from '../llm-agents/agents/domain-curator.agent';
import { ArgumentMapperAgent } from '../llm-agents/agents/argument-mapper.agent';
import { LanguageReasoningAgent } from '../llm-agents/agents/language-reasoning.agent';
import { ProfessionalFeedbackAgent } from '../llm-agents/agents/professional-feedback.agent';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let model: Model<Article>;

  const mockArticle = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Article',
    domain: 'AI',
    difficulty: 'intermediate',
    content: 'This is a test article content.',
    wordCount: 100,
    publishedAt: new Date(),
    scheduledFor: new Date(),
    createdAt: new Date(),
  };

  const mockArticleModel = {
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockArticle]),
    }),
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockArticle),
    }),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((data: any) => ({
      ...data,
      save: jest.fn().mockResolvedValue(mockArticle),
    })),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockArticle),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockArticle),
    }),
    countDocuments: jest.fn().mockResolvedValue(1),
  };

  const mockDomainCuratorAgent = {
    analyzeArticle: jest.fn(),
  };

  const mockArgumentMapperAgent = {
    generateFullArticleAnalysis: jest.fn(),
  };

  const mockLanguageReasoningAgent = {
    extractLanguageBreakdown: jest.fn(),
  };

  const mockProfessionalFeedbackAgent = {
    generateUnderstandingQuestions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: 'ArticleModel',
          useValue: mockArticleModel,
        },
        {
          provide: DomainCuratorAgent,
          useValue: mockDomainCuratorAgent,
        },
        {
          provide: ArgumentMapperAgent,
          useValue: mockArgumentMapperAgent,
        },
        {
          provide: LanguageReasoningAgent,
          useValue: mockLanguageReasoningAgent,
        },
        {
          provide: ProfessionalFeedbackAgent,
          useValue: mockProfessionalFeedbackAgent,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    model = module.get<Model<Article>>('ArticleModel');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('create', () => {
    it('should successfully create an article', async () => {
      const createArticleDto = {
        title: 'Test Article',
        domain: 'AI',
        difficulty: 'intermediate' as const,
        content: 'This is a test article content.',
        wordCount: 100,
      };

      const mockInstance = {
        ...mockArticle,
        save: jest.fn().mockResolvedValue(mockArticle),
      };

      mockArticleModel.create.mockReturnValue(mockInstance);

      const result = await service.create(createArticleDto);

      expect(result).toHaveProperty('title', 'Test Article');
      expect(mockArticleModel.create).toHaveBeenCalled();
    });
  });
});
