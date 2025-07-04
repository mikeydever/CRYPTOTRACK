import { PrismaClient } from '@prisma/client';
import { Transaction } from '@prisma/client';

const prisma = new PrismaClient();

export async function getTransactionsByUserId(userId: string): Promise<Transaction[]> {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
  });
}

export async function createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
  return prisma.transaction.create({
    data: {
      ...data,
      timestamp: new Date(data.timestamp),
      fee: data.fee || 0,
    },
  });
}

export async function updateTransaction(id: string, userId: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>): Promise<Transaction> {
  return prisma.transaction.update({
    where: { id, userId },
    data: {
      ...data,
      ...(data.timestamp && { timestamp: new Date(data.timestamp) }),
      ...(data.fee && { fee: data.fee || 0 }),
    },
  });
}

export async function deleteTransaction(id: string, userId: string): Promise<void> {
  await prisma.transaction.delete({
    where: { id, userId },
  });
}
