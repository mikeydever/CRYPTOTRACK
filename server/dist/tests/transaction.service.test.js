"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const transaction_service_1 = require("../services/transaction.service");
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
    let prisma;
    beforeEach(() => {
        prisma = new client_1.PrismaClient();
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
                exchange: null,
                notes: null,
            };
            prisma.transaction.create.mockResolvedValueOnce({ id: 'trans1', ...transactionData });
            const result = await (0, transaction_service_1.createTransaction)(transactionData);
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
            prisma.transaction.findMany.mockResolvedValueOnce(transactions);
            const result = await (0, transaction_service_1.getTransactionsByUserId)('user123');
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
            prisma.transaction.update.mockResolvedValueOnce({ ...existingTransaction, ...updatedData });
            const result = await (0, transaction_service_1.updateTransaction)('trans1', 'user123', updatedData);
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
            prisma.transaction.update.mockResolvedValueOnce({ ...existingTransaction, ...updatedData });
            const result = await (0, transaction_service_1.updateTransaction)('trans1', 'user123', updatedData);
            expect(prisma.transaction.update).toHaveBeenCalledWith({
                where: { id: 'trans1', userId: 'user123' },
                data: { timestamp: new Date(newTimestamp) },
            });
            expect(result).toEqual({ ...existingTransaction, ...updatedData });
        });
    });
    describe('deleteTransaction', () => {
        test('should delete a transaction', async () => {
            prisma.transaction.delete.mockResolvedValueOnce(undefined);
            await expect((0, transaction_service_1.deleteTransaction)('trans1', 'user123')).resolves.toBeUndefined();
            expect(prisma.transaction.delete).toHaveBeenCalledWith({
                where: { id: 'trans1', userId: 'user123' },
            });
        });
    });
    describe('importTransactionsFromCsv', () => {
        test('should import transactions from a CSV string', async () => {
            const csvContent = `coinId,coinSymbol,type,quantity,pricePerCoin,fee,timestamp,exchange,notes
bitcoin,BTC,buy,0.5,40000,10,2023-01-01T10:00:00Z,Binance,Initial buy
ethereum,ETH,sell,1,2000,5,2023-01-02T11:00:00Z,Coinbase,Quick sale`;
            const userId = 'testUserId';
            const mockCreatedTransactions = [
                {
                    id: '1',
                    userId,
                    coinId: 'bitcoin',
                    coinSymbol: 'BTC',
                    type: 'buy',
                    quantity: 0.5,
                    pricePerCoin: 40000,
                    fee: 10,
                    timestamp: new Date('2023-01-01T10:00:00Z'),
                    exchange: 'Binance',
                    notes: 'Initial buy',
                    createdAt: new Date(),
                },
                {
                    id: '2',
                    userId,
                    coinId: 'ethereum',
                    coinSymbol: 'ETH',
                    type: 'sell',
                    quantity: 1,
                    pricePerCoin: 2000,
                    fee: 5,
                    timestamp: new Date('2023-01-02T11:00:00Z'),
                    exchange: 'Coinbase',
                    notes: 'Quick sale',
                    createdAt: new Date(),
                },
            ];
            prisma.transaction.create
                .mockResolvedValueOnce(mockCreatedTransactions[0])
                .mockResolvedValueOnce(mockCreatedTransactions[1]);
            const result = await (0, transaction_service_1.importTransactionsFromCsv)(userId, csvContent);
            expect(prisma.transaction.create).toHaveBeenCalledTimes(2);
            expect(prisma.transaction.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    coinId: 'bitcoin',
                    coinSymbol: 'BTC',
                    type: 'buy',
                    quantity: 0.5,
                    pricePerCoin: 40000,
                    fee: 10,
                    timestamp: new Date('2023-01-01T10:00:00Z'),
                    exchange: 'Binance',
                    notes: 'Initial buy',
                },
            });
            expect(prisma.transaction.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    coinId: 'ethereum',
                    coinSymbol: 'ETH',
                    type: 'sell',
                    quantity: 1,
                    pricePerCoin: 2000,
                    fee: 5,
                    timestamp: new Date('2023-01-02T11:00:00Z'),
                    exchange: 'Coinbase',
                    notes: 'Quick sale',
                },
            });
            expect(result).toEqual(mockCreatedTransactions);
        });
        test('should handle CSV parsing errors', async () => {
            const malformedCsv = `coinId,coinSymbol,type,quantity,pricePerCoin,fee,timestamp,exchange,notes
bitcoin,BTC,buy,invalid_quantity,40000,10,2023-01-01T10:00:00Z,Binance,Initial buy`;
            const userId = 'testUserId';
            await expect((0, transaction_service_1.importTransactionsFromCsv)(userId, malformedCsv)).rejects.toThrow('Failed to parse CSV content. Please check your data format.');
        });
        test('should reject if required columns are missing', async () => {
            const csvContent = `coinId,type,quantity,pricePerCoin\nbitcoin,buy,1,50000`;
            const userId = 'testUserId';
            await expect((0, transaction_service_1.importTransactionsFromCsv)(userId, csvContent)).rejects.toThrow(/Missing required columns in CSV/);
        });
        test('should handle empty CSV content', async () => {
            const csvContent = '';
            const userId = 'testUserId';
            const result = await (0, transaction_service_1.importTransactionsFromCsv)(userId, csvContent);
            expect(result).toEqual([]);
            expect(prisma.transaction.create).not.toHaveBeenCalled();
        });
        test('should handle CSV with only a header', async () => {
            const csvContent = `coinId,coinSymbol,type,quantity,pricePerCoin,fee,timestamp,exchange,notes`;
            const userId = 'testUserId';
            const result = await (0, transaction_service_1.importTransactionsFromCsv)(userId, csvContent);
            expect(result).toEqual([]);
            expect(prisma.transaction.create).not.toHaveBeenCalled();
        });
        test('should handle CSV with extra columns', async () => {
            const csvContent = `coinId,coinSymbol,type,quantity,pricePerCoin,timestamp,extra_column\nbitcoin,BTC,buy,1,50000,2023-01-01T10:00:00Z,some_value`;
            const userId = 'testUserId';
            prisma.transaction.create.mockResolvedValueOnce({ id: '1', userId, coinId: 'bitcoin', coinSymbol: 'BTC', type: 'buy', quantity: 1, pricePerCoin: 50000 });
            const result = await (0, transaction_service_1.importTransactionsFromCsv)(userId, csvContent);
            expect(result).toHaveLength(1);
            expect(prisma.transaction.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    coinId: 'bitcoin',
                    quantity: 1,
                }),
            });
        });
        test('should handle database errors during transaction creation', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            const csvContent = `coinId,coinSymbol,type,quantity,pricePerCoin,fee,timestamp,exchange,notes
bitcoin,BTC,buy,0.5,40000,10,2023-01-01T10:00:00Z,Binance,Initial buy`;
            const userId = 'testUserId';
            prisma.transaction.create.mockRejectedValue(new Error('Database connection error'));
            await expect((0, transaction_service_1.importTransactionsFromCsv)(userId, csvContent)).rejects.toThrow('Failed to import transactions into the database.');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating transactions from CSV:', expect.any(Error));
            consoleErrorSpy.mockRestore();
        });
    });
    describe('exportTransactionsToCsv', () => {
        test('should export transactions to a CSV string', async () => {
            const mockTransactions = [
                {
                    id: '1',
                    userId: 'testUserId',
                    coinId: 'bitcoin',
                    coinSymbol: 'BTC',
                    type: 'buy',
                    quantity: 0.5,
                    pricePerCoin: 40000,
                    fee: 10,
                    timestamp: new Date('2023-01-01T10:00:00Z'),
                    exchange: 'Binance',
                    notes: 'Initial buy',
                    createdAt: new Date(),
                },
                {
                    id: '2',
                    userId: 'testUserId',
                    coinId: 'ethereum',
                    coinSymbol: 'ETH',
                    type: 'sell',
                    quantity: 1,
                    pricePerCoin: 2000,
                    fee: 5,
                    timestamp: new Date('2023-01-02T11:00:00Z'),
                    exchange: 'Coinbase',
                    notes: 'Quick sale',
                    createdAt: new Date(),
                },
            ];
            prisma.transaction.findMany.mockResolvedValue(mockTransactions);
            const expectedCsv = `coinId,coinSymbol,type,quantity,pricePerCoin,fee,timestamp,exchange,notes
bitcoin,BTC,buy,0.5,40000,10,2023-01-01T10:00:00.000Z,Binance,Initial buy
ethereum,ETH,sell,1,2000,5,2023-01-02T11:00:00.000Z,Coinbase,Quick sale
`;
            const result = await (0, transaction_service_1.exportTransactionsToCsv)('testUserId');
            expect(prisma.transaction.findMany).toHaveBeenCalledWith({
                where: { userId: 'testUserId' },
                orderBy: { timestamp: 'asc' },
            });
            expect(result).toEqual(expectedCsv);
        });
        test('should return only headers for empty transactions', async () => {
            prisma.transaction.findMany.mockResolvedValue([]);
            const expectedCsv = `coinId,coinSymbol,type,quantity,pricePerCoin,fee,timestamp,exchange,notes
`;
            const result = await (0, transaction_service_1.exportTransactionsToCsv)('testUserId');
            expect(prisma.transaction.findMany).toHaveBeenCalledWith({
                where: { userId: 'testUserId' },
                orderBy: { timestamp: 'asc' },
            });
            expect(result).toEqual(expectedCsv);
        });
    });
});
