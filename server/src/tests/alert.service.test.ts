import { PrismaClient } from '@prisma/client';
import { createAlert, getAlerts, updateAlert, deleteAlert } from '../services/alert.service';

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mPrisma = {
    alert: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrisma),
  };
});

describe('Alert Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAlert', () => {
    test('should create a new alert', async () => {
      const alertData = {
        userId: 'user123',
        coinId: 'bitcoin',
        targetPrice: 50000,
        direction: 'above',
      };
      (prisma.alert.create as jest.Mock).mockResolvedValue({ id: 'alert1', ...alertData });

      const result = await createAlert(alertData);

      expect(prisma.alert.create).toHaveBeenCalledWith({ data: alertData });
      expect(result).toEqual({ id: 'alert1', ...alertData });
    });
  });

  describe('getAlerts', () => {
    test('should return all alerts for a user', async () => {
      const mockAlerts = [
        { id: 'alert1', userId: 'user123', coinId: 'bitcoin' },
        { id: 'alert2', userId: 'user123', coinId: 'ethereum' },
      ];
      (prisma.alert.findMany as jest.Mock).mockResolvedValue(mockAlerts);

      const result = await getAlerts('user123');

      expect(prisma.alert.findMany).toHaveBeenCalledWith({ where: { userId: 'user123' } });
      expect(result).toEqual(mockAlerts);
    });
  });

  describe('updateAlert', () => {
    test('should update an alert', async () => {
      const updatedData = { targetPrice: 55000 };
      (prisma.alert.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await updateAlert('alert1', 'user123', updatedData);

      expect(prisma.alert.updateMany).toHaveBeenCalledWith({
        where: { id: 'alert1', userId: 'user123' },
        data: updatedData,
      });
      expect(result).toEqual({ count: 1 });
    });
  });

  describe('deleteAlert', () => {
    test('should delete an alert', async () => {
      (prisma.alert.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await deleteAlert('alert1', 'user123');

      expect(prisma.alert.deleteMany).toHaveBeenCalledWith({
        where: { id: 'alert1', userId: 'user123' },
      });
      expect(result).toEqual({ count: 1 });
    });
  });
});
