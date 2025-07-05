import { PrismaClient } from '@prisma/client';
import { Transaction } from '@prisma/client';
import csv from 'csv-parser';
import { Readable } from 'stream';

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

export async function importTransactionsFromCsv(userId: string, csvContent: string): Promise<Transaction[]> {
  const transactionsToCreate: Omit<Transaction, 'id' | 'createdAt'>[] = [];

  return new Promise((resolve, reject) => {
    const csvStream = Readable.from(csvContent).pipe(csv());

    csvStream.on('headers', (headers) => {
      const requiredHeaders = ['coinId', 'coinSymbol', 'type', 'quantity', 'pricePerCoin', 'timestamp'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        const errorMessage = `Missing required columns in CSV: ${missingHeaders.join(', ')}`;
        csvStream.destroy(new Error(errorMessage)); // Destroy stream to stop further processing
        reject(new Error(errorMessage));
      }
    });

    csvStream.on('data', (row) => {
      const quantity = parseFloat(row.quantity);
      const pricePerCoin = parseFloat(row.pricePerCoin);
      const fee = row.fee ? parseFloat(row.fee) : 0;
      const timestamp = new Date(row.timestamp);

      if (isNaN(quantity) || isNaN(pricePerCoin) || isNaN(fee) || isNaN(timestamp.getTime())) {
        const errorMessage = 'Failed to parse CSV content. Please check your data format.';
        csvStream.destroy(new Error(errorMessage)); // Destroy stream to stop further processing
        reject(new Error(errorMessage));
        return; // Stop further processing of this row
      }

      const transaction: Omit<Transaction, 'id' | 'createdAt'> = {
        userId,
        coinId: row.coinId,
        coinSymbol: row.coinSymbol,
        type: row.type,
        quantity,
        pricePerCoin,
        fee,
        timestamp,
        exchange: row.exchange || null,
        notes: row.notes || null,
      };
      transactionsToCreate.push(transaction);
    })
    .on('end', async () => {
      try {
        const createdTransactions: Transaction[] = [];
        for (const transactionData of transactionsToCreate) {
          const created = await prisma.transaction.create({ data: transactionData });
          createdTransactions.push(created);
        }
        resolve(createdTransactions);
      } catch (error) {
        console.error('Error creating transactions from CSV:', error);
        reject(new Error('Failed to import transactions into the database.'));
      }
    })
    .on('error', (error) => {
      console.error('CSV parsing error:', error);
      reject(new Error('Failed to parse CSV content.'));
    });
  });
}
