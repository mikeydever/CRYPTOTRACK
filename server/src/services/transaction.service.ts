import { PrismaClient } from '@prisma/client';
import { Transaction } from '@prisma/client';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { stringify } from 'csv-stringify';
import { parse } from 'csv-parse/sync';

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
  if (!csvContent.trim()) {
    return [];
  }

  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const transactionsToCreate: Omit<Transaction, 'id' | 'createdAt'>[] = [];

    for (const row of records) {
      const requiredColumns = ['coinId', 'coinSymbol', 'type', 'quantity', 'pricePerCoin', 'timestamp'];
      const missingColumns = requiredColumns.filter(col => !row[col]);

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns in CSV: ${missingColumns.join(', ')}`);
      }

      const quantity = parseFloat(row.quantity);
      const pricePerCoin = parseFloat(row.pricePerCoin);
      const fee = row.fee ? parseFloat(row.fee) : 0;
      const timestamp = new Date(row.timestamp);

      if (isNaN(quantity) || isNaN(pricePerCoin) || isNaN(fee) || isNaN(timestamp.getTime())) {
        throw new Error('Failed to parse CSV content. Please check your data format.');
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
    }

    const createdTransactions: Transaction[] = [];
    for (const transactionData of transactionsToCreate) {
      const created = await prisma.transaction.create({ data: transactionData });
      createdTransactions.push(created);
    }
    return createdTransactions;
  } catch (error: any) {
    console.error('Error importing transactions from CSV:', error);
    if (error.message.includes('Missing required columns') || error.message.includes('Failed to parse')) {
      throw error;
    } else {
      throw new Error('Failed to import transactions into the database.');
    }
  }
}

export async function exportTransactionsToCsv(userId: string): Promise<string> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { timestamp: 'asc' },
  });

  const columns = [
    'coinId',
    'coinSymbol',
    'type',
    'quantity',
    'pricePerCoin',
    'fee',
    'timestamp',
    'exchange',
    'notes',
  ];

  const data = transactions.map(t => ({
    coinId: t.coinId,
    coinSymbol: t.coinSymbol,
    type: t.type,
    quantity: t.quantity,
    pricePerCoin: t.pricePerCoin,
    fee: t.fee,
    timestamp: t.timestamp.toISOString(), // Convert Date to ISO string for CSV
    exchange: t.exchange || '',
    notes: t.notes || '',
  }));

  return new Promise((resolve, reject) => {
    stringify(data, { header: true, columns: columns }, (err, output) => {
      if (err) {
        return reject(err);
      }
      resolve(output || '');
    });
  });
}
