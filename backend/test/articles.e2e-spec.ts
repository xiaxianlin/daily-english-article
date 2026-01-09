import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from './../src/app.module';

describe('Articles Reading Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let articleId: string;
  let sessionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-english-article-test'),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.setGlobalPrefix('api');
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Article Discovery', () => {
    it('should get today\'s article', () => {
      return request(app.getHttpServer())
        .get('/api/articles/today')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('content');
          articleId = res.body._id;
        });
    });

    it('should get article by id', () => {
      return request(app.getHttpServer())
        .get(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id', articleId);
          expect(res.body).toHaveProperty('readingMap');
          expect(res.body).toHaveProperty('keyParagraphs');
        });
    });

    it('should get article history', () => {
      return request(app.getHttpServer())
        .get('/api/articles/history?offset=0&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Reading Session Flow', () => {
    it('should start a reading session', () => {
      return request(app.getHttpServer())
        .post(`/api/reading-sessions/start/${articleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('status', 'in_progress');
          expect(res.body).toHaveProperty('startedAt');
          sessionId = res.body._id;
        });
    });

    it('should get reading session', () => {
      return request(app.getHttpServer())
        .get(`/api/reading-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id', sessionId);
          expect(res.body).toHaveProperty('progress');
        });
    });

    it('should update session progress', () => {
      return request(app.getHttpServer())
        .put(`/api/reading-sessions/${sessionId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          progress: {
            readingMapViewed: true,
            keyParagraphsViewed: [0, 1],
            languageBreakdownViewed: false,
            understandingAnswered: false,
            outputSubmitted: false,
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.progress.readingMapViewed).toBe(true);
          expect(res.body.progress.keyParagraphsViewed).toEqual([0, 1]);
        });
    });

    it('should complete reading session', () => {
      return request(app.getHttpServer())
        .post(`/api/reading-sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'completed');
          expect(res.body).toHaveProperty('completedAt');
        });
    });

    it('should get user sessions', () => {
      return request(app.getHttpServer())
        .get('/api/reading-sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('User Output and Feedback', () => {
    it('should submit user output', () => {
      return request(app.getHttpServer())
        .post('/api/user-outputs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          articleId: articleId,
          sessionId: sessionId,
          prompt: 'Summarize the main argument',
          userOutput: 'This article discusses the impact of AI on modern society.',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('userOutput');
        });
    });

    it('should generate AI feedback', () => {
      return request(app.getHttpServer())
        .post(`/api/user-outputs/${sessionId}/feedback`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('aiFeedback');
        });
    });
  });

  describe('Memory Items', () => {
    it('should get user memory items', () => {
      return request(app.getHttpServer())
        .get('/api/memory-items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter memory items by type', () => {
      return request(app.getHttpServer())
        .get('/api/memory-items?type=sentencePattern')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Unauthorized Access', () => {
    it('should deny access to articles without token', () => {
      return request(app.getHttpServer())
        .get('/api/articles/today')
        .expect(401);
    });

    it('should deny access to reading sessions without token', () => {
      return request(app.getHttpServer())
        .post(`/api/reading-sessions/start/${articleId}`)
        .expect(401);
    });
  });
});
