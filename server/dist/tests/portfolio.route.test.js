"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
// Mock PrismaClient and its methods
const mockFindMany = jest.fn();
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => ({
        transaction: {
            findMany: mockFindMany,
        },
    })),
}));
// Mock authMiddleware
jest.mock('../middleware/auth', () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { id: 'testUserId' };
        next();
    }),
}));
describe('Portfolio API', () => {
    let app;
    let portfolioService; // Declare portfolioService here
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules(); // Reset module registry before each test
        // Re-mock portfolioService after resetting modules
        portfolioService = require('../services/portfolio.service');
        jest.mock('../services/portfolio.service', () => ({
            calculatePortfolioMetrics: jest.fn(),
        }));
        // Re-import the route after resetting modules and re-mocking services
        const portfolioRoutes = require('../routes/portfolio.route').default;
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/api/portfolio', portfolioRoutes);
        mockFindMany.mockClear(); // Clear mock calls for findMany
    });
    describe('GET /api/portfolio', () => {
        test('should return user portfolio metrics', async () => {
            const mockTransactions = [
                { id: '1', coinId: 'bitcoin', type: 'buy', quantity: 0.5, pricePerCoin: 40000, fee: 0, timestamp: new Date() },
            ];
            const mockPortfolioMetrics = {
                holdings: [{ coinId: 'bitcoin', quantity: 0.5, averagePrice: 40000, currentPrice: 45000, value: 22500, profitLoss: 2500, profitLossPercent: 6.25 }],
                totalValue: 22500,
                totalProfitLoss: 2500,
                totalProfitLossPercent: 6.25,
            };
            mockFindMany.mockResolvedValue(mockTransactions);
            portfolioService.calculatePortfolioMetrics.mockReturnValue(mockPortfolioMetrics);
            const res = await (0, supertest_1.default)(app).get('/api/portfolio');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ success: true, data: mockPortfolioMetrics });
            expect(mockFindMany).toHaveBeenCalledWith({ where: { userId: 'testUserId' }, orderBy: { timestamp: 'desc' } });
            expect(portfolioService.calculatePortfolioMetrics).toHaveBeenCalledWith(mockTransactions, expect.any(Object));
        });
        test('should handle errors', async () => {
            mockFindMany.mockRejectedValue(new Error('Database error'));
            const res = await (0, supertest_1.default)(app).get('/api/portfolio');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ success: false, error: 'Database error' });
        });
    });
});
