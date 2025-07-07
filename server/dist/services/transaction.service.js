"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsByUserId = getTransactionsByUserId;
exports.createTransaction = createTransaction;
exports.updateTransaction = updateTransaction;
exports.deleteTransaction = deleteTransaction;
exports.importTransactionsFromCsv = importTransactionsFromCsv;
exports.exportTransactionsToCsv = exportTransactionsToCsv;
const client_1 = require("@prisma/client");
const csv_stringify_1 = require("csv-stringify");
const sync_1 = require("csv-parse/sync");
const prisma = new client_1.PrismaClient();
async function getTransactionsByUserId(userId) {
    return prisma.transaction.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
    });
}
async function createTransaction(data) {
    return prisma.transaction.create({
        data: {
            ...data,
            timestamp: new Date(data.timestamp),
            fee: data.fee || 0,
        },
    });
}
async function updateTransaction(id, userId, data) {
    return prisma.transaction.update({
        where: { id, userId },
        data: {
            ...data,
            ...(data.timestamp && { timestamp: new Date(data.timestamp) }),
            ...(data.fee && { fee: data.fee || 0 }),
        },
    });
}
async function deleteTransaction(id, userId) {
    await prisma.transaction.delete({
        where: { id, userId },
    });
}
async function importTransactionsFromCsv(userId, csvContent) {
    if (!csvContent.trim()) {
        return [];
    }
    try {
        const records = (0, sync_1.parse)(csvContent, {
            columns: true,
            skip_empty_lines: true,
        });
        const transactionsToCreate = [];
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
            const transaction = {
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
        const createdTransactions = [];
        for (const transactionData of transactionsToCreate) {
            const created = await prisma.transaction.create({ data: transactionData });
            createdTransactions.push(created);
        }
        return createdTransactions;
    }
    catch (error) {
        console.error('Error importing transactions from CSV:', error);
        if (error.message.includes('Missing required columns') || error.message.includes('Failed to parse')) {
            throw error;
        }
        else {
            throw new Error('Failed to import transactions into the database.');
        }
    }
}
async function exportTransactionsToCsv(userId) {
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
        (0, csv_stringify_1.stringify)(data, { header: true, columns: columns }, (err, output) => {
            if (err) {
                return reject(err);
            }
            resolve(output || '');
        });
    });
}
