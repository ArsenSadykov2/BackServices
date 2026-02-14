import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Posts (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let postId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const authResponse = await request('http://localhost:3001')
      .post('/auth/register')
      .send({
        email: `test${Date.now()}@test.com`,
        password: 'password123',
      });

    authToken = authResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/posts (POST)', () => {
    it('should create a new post with valid token', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post',
          content: 'Test Content',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Post');
          expect(res.body.content).toBe('Test Content');
          postId = res.body.id;
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          title: 'Test Post',
          content: 'Test Content',
        })
        .expect(401);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'ab',
          content: 'Content',
        })
        .expect(400);
    });
  });

  describe('/posts (GET)', () => {
    it('should return all posts', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/posts/:id (GET)', () => {
    it('should return a post by id', () => {
      return request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(postId);
          expect(res.body).toHaveProperty('title');
        });
    });

    it('should return 404 for non-existent post', () => {
      return request(app.getHttpServer()).get('/posts/99999').expect(404);
    });
  });

  describe('/posts/:id (PUT)', () => {
    it('should update own post', () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Title');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .send({
          title: 'Updated Title',
        })
        .expect(401);
    });

    it('should return 403 when updating other user post', async () => {
      const otherAuthResponse = await request('http://localhost:3001')
        .post('/auth/register')
        .send({
          email: `other${Date.now()}@test.com`,
          password: 'password123',
        });

      const otherToken = otherAuthResponse.body.access_token;

      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: 'Hacked Title',
        })
        .expect(403);
    });
  });

  describe('/posts/:id (DELETE)', () => {
    it('should return 403 when deleting other user post', async () => {
      const otherAuthResponse = await request('http://localhost:3001')
        .post('/auth/register')
        .send({
          email: `delete${Date.now()}@test.com`,
          password: 'password123',
        });

      const otherToken = otherAuthResponse.body.access_token;

      return request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });

    it('should delete own post', () => {
      return request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .expect(401);
    });
  });
});
