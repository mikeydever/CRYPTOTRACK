import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createUser, validateUser } from '../services/auth.service';

jest.mock('bcrypt');

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    __esModule: true, // This is important for default exports
  };
});

describe('Auth Service', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    test('should create a new user and hash the password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        transactions: [],
        alerts: [],
      });

      const user = await createUser('test@example.com', 'password123');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword',
        },
      });
      expect(user).toEqual(expect.objectContaining({
        email: 'test@example.com',
      }));
    });
  });

  describe('validateUser', () => {
    test('should return user if credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        transactions: [],
        alerts: [],
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const user = await validateUser('test@example.com', 'password123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(user).toEqual(mockUser);
    });

    test('should return null if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const user = await validateUser('nonexistent@example.com', 'password123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(user).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    test('should return null if password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        transactions: [],
        alerts: [],
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const user = await validateUser('test@example.com', 'wrongpassword');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(user).toBeNull();
    });
  });
});