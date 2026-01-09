import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ReadingSessionsService } from './reading-sessions.service';
import { ReadingSession } from './reading-sessions.schema';

describe('ReadingSessionsService', () => {
  let service: ReadingSessionsService;
  let model: Model<ReadingSession>;

  const mockReadingSession = {
    _id: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439012',
    articleId: '507f1f77bcf86cd799439013',
    status: 'in_progress',
    startedAt: new Date(),
    completedAt: null,
    progress: {
      readingMapViewed: false,
      keyParagraphsViewed: [],
      languageBreakdownViewed: false,
      understandingAnswered: false,
      outputSubmitted: false,
    },
  };

  const mockReadingSessionModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockSessionInstance = {
    save: jest.fn(),
    progress: {
      readingMapViewed: false,
      keyParagraphsViewed: [],
      languageBreakdownViewed: false,
      understandingAnswered: false,
      outputSubmitted: false,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingSessionsService,
        {
          provide: 'ReadingSessionModel',
          useValue: mockReadingSessionModel,
        },
      ],
    }).compile();

    service = module.get<ReadingSessionsService>(ReadingSessionsService);
    model = module.get<Model<ReadingSession>>('ReadingSessionModel');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a new reading session', async () => {
      const createSessionDto = {
        userId: '507f1f77bcf86cd799439012',
        articleId: '507f1f77bcf86cd799439013',
      };

      mockReadingSessionModel.findOne.mockResolvedValue(null);
      mockReadingSessionModel.create.mockReturnValue(mockSessionInstance);
      mockSessionInstance.save.mockResolvedValue({
        ...mockReadingSession,
        ...mockSessionInstance,
      });

      const result = await service.create('507f1f77bcf86cd799439012', createSessionDto);

      expect(result).toHaveProperty('status', 'in_progress');
      expect(result).toHaveProperty('startedAt');
      expect(mockReadingSessionModel.create).toHaveBeenCalled();
    });

    it('should return existing session if one already exists', async () => {
      const createSessionDto = {
        userId: '507f1f77bcf86cd799439012',
        articleId: '507f1f77bcf86cd799439013',
      };

      mockReadingSessionModel.findOne.mockResolvedValue(mockReadingSession);

      const result = await service.create('507f1f77bcf86cd799439012', createSessionDto);

      expect(result).toEqual(mockReadingSession);
      expect(mockReadingSessionModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a reading session by id', async () => {
      mockReadingSessionModel.findById.mockResolvedValue(mockReadingSession);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockReadingSession);
      expect(mockReadingSessionModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if session not found', async () => {
      mockReadingSessionModel.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProgress', () => {
    it('should successfully update session progress with boolean value', async () => {
      const updateProgressDto = {
        field: 'readingMapViewed',
        booleanValue: true,
      };

      const updatedSession = {
        ...mockReadingSession,
        progress: {
          ...mockReadingSession.progress,
          readingMapViewed: true,
        },
      };

      mockReadingSessionModel.findById.mockResolvedValue(updatedSession);
      (updatedSession as any).save = jest.fn().mockResolvedValue(updatedSession);

      const result = await service.updateProgress('507f1f77bcf86cd799439011', updateProgressDto);

      expect(result.progress.readingMapViewed).toBe(true);
    });

    it('should successfully update session progress with array value', async () => {
      const updateProgressDto = {
        field: 'keyParagraphsViewed',
        arrayValue: [0, 1],
      };

      const updatedSession = {
        ...mockReadingSession,
        progress: {
          ...mockReadingSession.progress,
          keyParagraphsViewed: [0, 1],
        },
      };

      mockReadingSessionModel.findById.mockResolvedValue(updatedSession);
      (updatedSession as any).save = jest.fn().mockResolvedValue(updatedSession);

      const result = await service.updateProgress('507f1f77bcf86cd799439011', updateProgressDto);

      expect(result.progress.keyParagraphsViewed).toEqual([0, 1]);
    });
  });

  describe('completeSession', () => {
    it('should successfully complete a reading session', async () => {
      const completedSession = {
        ...mockReadingSession,
        status: 'completed',
        completedAt: new Date(),
      };

      mockReadingSessionModel.findById.mockResolvedValue(mockReadingSession);
      (completedSession as any).save = jest.fn().mockResolvedValue(completedSession);

      const result = await service.completeSession('507f1f77bcf86cd799439011');

      expect(result.status).toBe('completed');
      expect(result).toHaveProperty('completedAt');
    });

    it('should throw NotFoundException if session not found', async () => {
      mockReadingSessionModel.findById.mockResolvedValue(null);

      await expect(service.completeSession('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('abandonSession', () => {
    it('should successfully abandon a reading session', async () => {
      const abandonedSession = {
        ...mockReadingSession,
        status: 'abandoned',
        completedAt: new Date(),
      };

      mockReadingSessionModel.findById.mockResolvedValue(mockReadingSession);
      (abandonedSession as any).save = jest.fn().mockResolvedValue(abandonedSession);

      const result = await service.abandonSession('507f1f77bcf86cd799439011');

      expect(result.status).toBe('abandoned');
    });
  });

  describe('findByUser', () => {
    it('should return all sessions for a user', async () => {
      mockReadingSessionModel.find.mockResolvedValue([mockReadingSession]);

      const result = await service.findByUser('507f1f77bcf86cd799439012');

      expect(result).toEqual([mockReadingSession]);
      expect(mockReadingSessionModel.find).toHaveBeenCalledWith({
        userId: '507f1f77bcf86cd799439012',
      });
    });

    it('should filter by status when provided', async () => {
      mockReadingSessionModel.find.mockResolvedValue([mockReadingSession]);

      await service.findByUser('507f1f77bcf86cd799439012', 'in_progress');

      expect(mockReadingSessionModel.find).toHaveBeenCalledWith({
        userId: '507f1f77bcf86cd799439012',
        status: 'in_progress',
      });
    });
  });
});
