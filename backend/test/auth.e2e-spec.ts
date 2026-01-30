import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const testUser = {
    email: 'e2e-test@example.com',
    password: 'testPassword123',
    firstName: 'E2E',
    lastName: 'Test',
  };

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
    app.setGlobalPrefix('api');
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    // Clean up test data
    await dataSource.query(`DELETE FROM session WHERE 1=1`);
    await dataSource.query(
      `DELETE FROM user WHERE email = '${testUser.email}'`,
    );
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...testUser, email: 'new@example.com', password: '12345' })
        .expect(400);
    });

    it('should fail with missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
        });
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongPassword' })
        .expect(401);
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password' })
        .expect(404);
    });
  });

  describe('/api/auth/logout (POST)', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      accessToken = response.body.accessToken;
    });

    it('should logout with valid token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Logged out successfully');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);
    });

    it('should fail with revoked session', () => {
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });
});