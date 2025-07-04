import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.route';
import * as authService from '../services/auth.service';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

jest.mock('../services/auth.service');
jest.mock('jsonwebtoken');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user and return a token', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue(null);
      (authService.createUser as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
      });
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBe('mockToken');
      expect(authService.createUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    test('should return 400 if email or password are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });

    test('should return 409 if user already exists', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });

    test('should return 500 on internal server error', async () => {
      (authService.validateUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login a user and return a token', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
      });
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBe('mockToken');
      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    test('should return 400 if email or password are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });

    test('should return 401 if invalid credentials', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return 500 on internal server error', async () => {
      (authService.validateUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
    });
  });
});
