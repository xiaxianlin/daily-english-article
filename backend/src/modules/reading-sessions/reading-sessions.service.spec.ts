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
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    sort: jest.fn(),
    exec: jest.fn(),
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

      mockReadingSessionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockReadingSessionModel.create.mockReturnValue({
        ...mockReadingSession,
        save: jest.fn().mockResolvedValue(mockReadingSession),
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

      mockReadingSessionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReadingSession),
      });

      const result = await service.create('507f1f77bcf86cd799439012', createSessionDto);

      expect(result).toEqual(mockReadingSession);
      expect(mockReadingSessionModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a reading session by id', async () => {
      mockReadingSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReadingSession),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockReadingSession);
      expect(mockReadingSessionModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if session not found', async () => {
      mockReadingSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProgress', () => {
    it('should successfully update session progress', async () => {
      const updateProgressDto = {
        progress: {
          readingMapViewed: true,
          keyParagraphsViewed: [0, 1],
          languageBreakdownViewed: false,
          understandingAnswered: false,
          outputSubmitted: false,
        },
      };

      const updatedSession = {
        ...mockReadingSession,
        progress: updateProgressDto.progress,
      };

      mockReadingSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReadingSession),
      });

      mockReadingSessionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedSession),
      });

      const result = await service.updateProgress('507f1f77bcf86cd799439011', updateProgressDto);

      expect(result.progress).toEqual(updateProgressDto.progress);
      expect(mockReadingSessionModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw NotFoundException if session not found', async () => {
      mockReadingSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateProgress('nonexistent-id', { progress: { readingMapViewed: true, keyParagraphsViewed: [], languageBreakdownViewed: false, understandingAnswered: false, outputSubmitted: false } })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should successfully complete a reading session', async () => {
      const completedSession = {
        ...mockReadingSession,
        status: 'completed',
        completedAt: new Date(),
      };

      mockReadingSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReadingSession),
      });

      mockReadingSessionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(completedSession),
      });

      const result = await service.complete('507f1f77bcf86cd799439011');

      expect(result.status).toBe('completed');
      expect(result).toHaveProperty('completedAt');
      expect(mockReadingSessionModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw NotFoundException if session not found', async () => {
      mockReadingSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.complete('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('abandon', () => {
    it('should successfully abandon a reading session', async () => {
      const abandonedSession = {
        ...mockReadingSession,
        status: 'abandoned',
        completedAt: new Date(),
      };

      mockReadingSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReadingSession),
      });

      mockReadingSessionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(abandonedSession),
      });

      const result = await service.abandon('507f1f77bcf86cd799439011');

      expect(result.status).toBe('abandoned');
      expect(mockReadingSessionModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return all sessions for a user', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockReadingSession]),
      };

      mockReadingSessionModel.find.mockReturnValue(mockQuery);

      const result = await service.findByUser('507f1f77bcf86cd799439012');

      expect(result).toEqual([mockReadingSession]);
      expect(mockReadingSessionModel.find).toHaveBeenCalledWith({
        userId: '507f1f77bcf86cd799439012',
      });
    });

    it('should filter by status when provided', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockReadingSession]),
      };

      mockReadingSessionModel.find.mockReturnValue(mockQuery);

      await service.findByUser('507f1f77bcf86cd799439012', 'in_progress');

      expect(mockReadingSessionModel.find).toHaveBeenCalledWith({
        userId: '507f1f77bcf86cd799439012',
        status: 'in_progress',
      });
    });
  });
});
