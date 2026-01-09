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
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
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

  describe('create', () => {
    it('should successfully create an article', async () => {
      const createArticleDto = {
        title: 'Test Article',
        domain: 'AI',
        difficulty: 'intermediate' as const,
        content: 'This is a test article content.',
      };

      mockArticleModel.create.mockReturnValue({
        ...mockArticle,
        save: jest.fn().mockResolvedValue(mockArticle),
      });

      const result = await service.create(createArticleDto);

      expect(result).toHaveProperty('title', 'Test Article');
      expect(mockArticleModel.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of articles', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockArticle]),
      };

      mockArticleModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll({ offset: 0, limit: 10 });

      expect(result).toEqual([mockArticle]);
      expect(mockArticleModel.find).toHaveBeenCalled();
    });

    it('should filter articles by domain when provided', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockArticle]),
      };

      mockArticleModel.find.mockReturnValue(mockQuery);

      await service.findAll({ offset: 0, limit: 10, domain: 'AI' });

      expect(mockArticleModel.find).toHaveBeenCalledWith({ domain: 'AI' });
    });
  });

  describe('findOne', () => {
    it('should return a single article by id', async () => {
      mockArticleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockArticle),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockArticle);
      expect(mockArticleModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTodayArticle', () => {
    it('should return article scheduled for today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockArticle]),
      };

      mockArticleModel.find.mockReturnValue(mockQuery);

      const result = await service.getTodayArticle();

      expect(result).toEqual(mockArticle);
      expect(mockArticleModel.find).toHaveBeenCalled();
    });

    it('should return the first published article if no scheduled article for today', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockArticle]),
      };

      mockArticleModel.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }).mockReturnValueOnce(mockQuery);

      const result = await service.getTodayArticle();

      expect(result).toEqual(mockArticle);
    });
  });

  describe('update', () => {
    it('should successfully update an article', async () => {
      const updateArticleDto = {
        title: 'Updated Article Title',
      };

      mockArticleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockArticle, ...updateArticleDto }),
      });

      const result = await service.update('507f1f77bcf86cd799439011', updateArticleDto);

      expect(result).toHaveProperty('title', 'Updated Article Title');
      expect(mockArticleModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw NotFoundException if article to update not found', async () => {
      mockArticleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('nonexistent-id', { title: 'Updated' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully delete an article', async () => {
      mockArticleModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockArticle),
      });

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockArticle);
      expect(mockArticleModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if article to delete not found', async () => {
      mockArticleModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
