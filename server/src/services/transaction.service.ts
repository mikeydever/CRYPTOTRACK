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
    let hasError = false;

    const csvStream = Readable.from(csvContent).pipe(csv());

    csvStream.on('data', (row) => {
      if (hasError) return; // Stop processing if an error has already occurred

      const quantity = parseFloat(row.quantity);
      const pricePerCoin = parseFloat(row.pricePerCoin);
      const fee = row.fee ? parseFloat(row.fee) : 0;
      const timestamp = new Date(row.timestamp);

      if (isNaN(quantity) || isNaN(pricePerCoin) || isNaN(fee) || isNaN(timestamp.getTime())) {
        hasError = true;
        csvStream.destroy(new Error('Failed to parse CSV content. Please check your data format.'));
        reject(new Error('Failed to parse CSV content. Please check your data format.'));
        return;
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
      if (hasError) return; // Do not resolve if an error has occurred
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
      if (hasError) return; // Do not reject again if an error has already occurred
      console.error('CSV parsing error:', error);
      reject(new Error('Failed to parse CSV content.'));
    });
  });
}
