"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const transaction_route_1 = __importDefault(require("../routes/transaction.route"));
const transactionService = __importStar(require("../services/transaction.service"));
const auth_1 = require("../middleware/auth");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(auth_1.authenticateToken); // Use the mocked middleware
app.use('/api/transactions', transaction_route_1.default);
jest.mock('../services/transaction.service');
jest.mock('../middleware/auth', () => ({
    authenticateToken: jest.fn((req, res, next) => {
        req.user = { id: 'testUserId', email: 'test@example.com' }; // Mock authenticated user
        next();
    }),
}));
describe('Transaction Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /api/transactions', () => {
        test('should return all transactions for a user', async () => {
            const mockTransactions = [
                { id: '1', userId: 'testUserId', coinId: 'bitcoin', coinSymbol: 'BTC', type: 'buy', quantity: 1, pricePerCoin: 50000, fee: 0, timestamp: new Date().toISOString() },
            ];
            transactionService.getTransactionsByUserId.mockResolvedValue(mockTransactions);
            const res = await (0, supertest_1.default)(app).get('/api/transactions');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockTransactions);
            expect(transactionService.getTransactionsByUserId).toHaveBeenCalledWith('testUserId');
        });
        test('should handle errors', async () => {
            transactionService.getTransactionsByUserId.mockRejectedValue(new Error('Database error'));
            const res = await (0, supertest_1.default)(app).get('/api/transactions');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Database error' });
        });
    });
    describe('POST /api/transactions', () => {
        test('should create a new transaction', async () => {
            const newTransactionData = {
                coinId: 'ethereum',
                coinSymbol: 'ETH',
                type: 'buy',
                quantity: 0.5,
                pricePerCoin: 3000,
                fee: 5,
                timestamp: new Date().toISOString(),
                exchange: 'Binance',
                notes: 'First ETH buy',
            };
            const createdTransaction = { id: '2', userId: 'testUserId', ...newTransactionData, timestamp: new Date(newTransactionData.timestamp).toISOString() };
            transactionService.createTransaction.mockResolvedValue(createdTransaction);
            const res = await (0, supertest_1.default)(app)
                .post('/api/transactions')
                .send(newTransactionData);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual(createdTransaction);
            expect(transactionService.createTransaction).toHaveBeenCalledWith({
                userId: 'testUserId',
                coinId: newTransactionData.coinId,
                coinSymbol: newTransactionData.coinSymbol,
                type: newTransactionData.type,
                quantity: newTransactionData.quantity,
                pricePerCoin: newTransactionData.pricePerCoin,
                fee: newTransactionData.fee,
                timestamp: expect.any(Date),
                exchange: newTransactionData.exchange,
                notes: newTransactionData.notes,
            });
        });
        test('should return 400 if required fields are missing', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/api/transactions')
                .send({ coinId: 'ethereum' }); // Missing other required fields
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ error: 'Missing required transaction fields' });
        });
        test('should handle errors', async () => {
            transactionService.createTransaction.mockRejectedValue(new Error('Database error'));
            const res = await (0, supertest_1.default)(app)
                .post('/api/transactions')
                .send({
                coinId: 'ethereum',
                coinSymbol: 'ETH',
                type: 'buy',
                quantity: 0.5,
                pricePerCoin: 3000,
                timestamp: new Date().toISOString(),
            });
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Database error' });
        });
    });
    describe('PUT /api/transactions/:id', () => {
        test('should update an existing transaction', async () => {
            const updatedData = { quantity: 0.75, pricePerCoin: 3200 };
            const existingTransaction = { id: '1', userId: 'testUserId', coinId: 'ethereum', coinSymbol: 'ETH', type: 'buy', quantity: 0.5, pricePerCoin: 3000, fee: 5, timestamp: new Date().toISOString(), exchange: 'Binance', notes: 'First ETH buy' };
            const updatedTransaction = { ...existingTransaction, ...updatedData };
            transactionService.updateTransaction.mockResolvedValue(updatedTransaction);
            const res = await (0, supertest_1.default)(app)
                .put('/api/transactions/1')
                .send(updatedData);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(updatedTransaction);
            expect(transactionService.updateTransaction).toHaveBeenCalledWith('1', 'testUserId', updatedData);
        });
        test('should return 404 if transaction not found', async () => {
            transactionService.updateTransaction.mockRejectedValue({ code: 'P2025' });
            const res = await (0, supertest_1.default)(app)
                .put('/api/transactions/nonexistent')
                .send({ quantity: 1 });
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Transaction not found or not authorized' });
        });
        test('should handle errors', async () => {
            transactionService.updateTransaction.mockRejectedValue(new Error('Database error'));
            const res = await (0, supertest_1.default)(app)
                .put('/api/transactions/1')
                .send({ quantity: 1 });
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Database error' });
        });
    });
    describe('DELETE /api/transactions/:id', () => {
        test('should delete a transaction', async () => {
            transactionService.deleteTransaction.mockResolvedValue(undefined);
            const res = await (0, supertest_1.default)(app).delete('/api/transactions/1');
            expect(res.statusCode).toEqual(204);
            expect(res.body).toEqual({}); // 204 No Content should return an empty body
            expect(transactionService.deleteTransaction).toHaveBeenCalledWith('1', 'testUserId');
        });
        test('should return 404 if transaction not found', async () => {
            transactionService.deleteTransaction.mockRejectedValue({ code: 'P2025' });
            const res = await (0, supertest_1.default)(app).delete('/api/transactions/nonexistent');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Transaction not found or not authorized' });
        });
        test('should handle errors', async () => {
            transactionService.deleteTransaction.mockRejectedValue(new Error('Database error'));
            const res = await (0, supertest_1.default)(app).delete('/api/transactions/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Database error' });
        });
    });
    describe('POST /api/transactions/import', () => {
        test('should import transactions from CSV', async () => {
            const csvContent = `coinId,coinSymbol,type,quantity,pricePerCoin,fee,timestamp,exchange,notes
bitcoin,BTC,buy,0.1,50000,10,2023-01-01T12:00:00.000Z,Coinbase,notes 1
ethereum,ETH,buy,2,2000,5,2023-01-02T12:00:00.000Z,Binance,notes 2`;
            const mockImportedTransactions = [
                { id: '3', userId: 'testUserId', coinId: 'bitcoin', coinSymbol: 'BTC', type: 'buy', quantity: 0.1, pricePerCoin: 50000, fee: 10, timestamp: new Date('2023-01-01T12:00:00.000Z'), exchange: 'Coinbase', notes: 'notes 1' },
                { id: '4', userId: 'testUserId', coinId: 'ethereum', coinSymbol: 'ETH', type: 'buy', quantity: 2, pricePerCoin: 2000, fee: 5, timestamp: new Date('2023-01-02T12:00:00.000Z'), exchange: 'Binance', notes: 'notes 2' },
            ];
            transactionService.importTransactionsFromCsv.mockResolvedValue(mockImportedTransactions);
            const res = await (0, supertest_1.default)(app)
                .post('/api/transactions/import')
                .send({ csv: csvContent });
            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toEqual('Successfully imported 2 transactions.');
            expect(res.body.importedTransactions).toEqual(mockImportedTransactions.map(t => ({ ...t, timestamp: t.timestamp.toISOString() })));
            expect(transactionService.importTransactionsFromCsv).toHaveBeenCalledWith('testUserId', csvContent);
        });
        test('should return 400 if CSV content is missing', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/api/transactions/import')
                .send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ error: 'CSV content is required' });
        });
        test('should handle errors during CSV import', async () => {
            const csvContent = 'invalid csv';
            transactionService.importTransactionsFromCsv.mockRejectedValue(new Error('Invalid CSV format'));
            const res = await (0, supertest_1.default)(app)
                .post('/api/transactions/import')
                .send({ csv: csvContent });
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Invalid CSV format' });
        });
    });
    describe('GET /api/transactions/export', () => {
        test('should export transactions to CSV', async () => {
            const mockCsvContent = 'coinId,coinSymbol\nbitcoin,BTC';
            transactionService.exportTransactionsToCsv.mockResolvedValue(mockCsvContent);
            const res = await (0, supertest_1.default)(app).get('/api/transactions/export');
            expect(res.statusCode).toEqual(200);
            expect(res.headers['content-type']).toEqual('text/csv; charset=utf-8');
            expect(res.headers['content-disposition']).toEqual('attachment; filename="transactions.csv"');
            expect(res.text).toEqual(mockCsvContent);
            expect(transactionService.exportTransactionsToCsv).toHaveBeenCalledWith('testUserId');
        });
        test('should handle errors during CSV export', async () => {
            transactionService.exportTransactionsToCsv.mockRejectedValue(new Error('Export error'));
            const res = await (0, supertest_1.default)(app).get('/api/transactions/export');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Export error' });
        });
    });
});
