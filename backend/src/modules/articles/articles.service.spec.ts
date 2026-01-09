import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ArticlesService } from './articles.service';
import { Article } from './articles.schema';

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
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: 'ArticleModel',
          useValue: mockArticleModel,
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
