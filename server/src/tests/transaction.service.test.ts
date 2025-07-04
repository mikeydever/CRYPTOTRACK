import { PrismaClient } from '@prisma/client';
import { createTransaction, getTransactionsByUserId, updateTransaction, deleteTransaction } from '../services/transaction.service';

jest.mock('@prisma/client', () => {
  const prismaMock = {
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => prismaMock),
  };
});

describe('Transaction Service', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    test('should create a new transaction', async () => {
      const transactionData = {
        userId: 'user123',
        coinId: 'bitcoin',
        coinSymbol: 'BTC',
        type: 'buy',
        quantity: 1,
        pricePerCoin: 50000,
        fee: 0,
        timestamp: new Date(),
      };
      (prisma.transaction.create as jest.Mock).mockResolvedValueOnce({ id: 'trans1', ...transactionData });

      const result = await createTransaction(transactionData);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          ...transactionData,
          timestamp: expect.any(Date),
        },
      });
      expect(result).toEqual({ id: 'trans1', ...transactionData });
    });
  });

  describe('getTransactionsByUserId', () => {
    test('should return all transactions for a user', async () => {
      const transactions = [
        { id: 'trans1', userId: 'user123', coinId: 'bitcoin', coinSymbol: 'BTC', type: 'buy', quantity: 1, pricePerCoin: 50000, fee: 0, timestamp: new Date() },
      ];
      (prisma.transaction.findMany as jest.Mock).mockResolvedValueOnce(transactions);

      const result = await getTransactionsByUserId('user123');

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { timestamp: 'desc' },
      });
      expect(result).toEqual(transactions);
    });
  });

  describe('updateTransaction', () => {
    test('should update an existing transaction', async () => {
      const updatedData = { quantity: 2, pricePerCoin: 55000 };
      const existingTransaction = { id: 'trans1', userId: 'user123', coinId: 'bitcoin', coinSymbol: 'BTC', type: 'buy', quantity: 1, pricePerCoin: 50000, fee: 0, timestamp: new Date() };
      (prisma.transaction.update as jest.Mock).mockResolvedValueOnce({ ...existingTransaction, ...updatedData });

      const result = await updateTransaction('trans1', 'user123', updatedData);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'trans1', userId: 'user123' },
        data: updatedData,
      });
      expect(result).toEqual({ ...existingTransaction, ...updatedData });
    });

    test('should handle timestamp update correctly', async () => {
      const newTimestamp = new Date('2024-01-01T10:00:00Z');
      const updatedData = { timestamp: newTimestamp };
      const existingTransaction = { id: 'trans1', userId: 'user123', coinId: 'bitcoin', coinSymbol: 'BTC', type: 'buy', quantity: 1, pricePerCoin: 50000, fee: 0, timestamp: new Date() };
      (prisma.transaction.update as jest.Mock).mockResolvedValueOnce({ ...existingTransaction, ...updatedData });

      const result = await updateTransaction('trans1', 'user123', updatedData);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'trans1', userId: 'user123' },
        data: { timestamp: new Date(newTimestamp) },
      });
      expect(result).toEqual({ ...existingTransaction, ...updatedData });
    });
  });

  describe('deleteTransaction', () => {
    test('should delete a transaction', async () => {
      (prisma.transaction.delete as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(deleteTransaction('trans1', 'user123')).resolves.toBeUndefined();

      expect(prisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'trans1', userId: 'user123' },
      });
    });
  });
});