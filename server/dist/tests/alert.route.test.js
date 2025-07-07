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
const alert_route_1 = __importDefault(require("../routes/alert.route"));
const alertService = __importStar(require("../services/alert.service"));
// Mock authMiddleware and alertService
jest.mock('../middleware/auth', () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { id: 'testUserId' };
        next();
    }),
}));
jest.mock('../services/alert.service');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/alerts', alert_route_1.default);
describe('Alert API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /api/alerts', () => {
        test('should return all alerts for a user', async () => {
            const mockAlerts = [{ id: '1', coinId: 'bitcoin' }];
            alertService.getAlerts.mockResolvedValue(mockAlerts);
            const res = await (0, supertest_1.default)(app).get('/api/alerts');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ success: true, data: mockAlerts });
            expect(alertService.getAlerts).toHaveBeenCalledWith('testUserId');
        });
        test('should handle errors', async () => {
            alertService.getAlerts.mockRejectedValue(new Error('Database error'));
            const res = await (0, supertest_1.default)(app).get('/api/alerts');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ success: false, error: 'Database error' });
        });
    });
    describe('POST /api/alerts', () => {
        test('should create a new alert', async () => {
            const newAlertData = { coinId: 'ethereum', targetPrice: 3000, direction: 'above' };
            const createdAlert = { id: '2', ...newAlertData };
            alertService.createAlert.mockResolvedValue(createdAlert);
            const res = await (0, supertest_1.default)(app)
                .post('/api/alerts')
                .send(newAlertData);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual({ success: true, data: createdAlert });
            expect(alertService.createAlert).toHaveBeenCalledWith({
                ...newAlertData,
                userId: 'testUserId',
            });
        });
        test('should handle errors', async () => {
            alertService.createAlert.mockRejectedValue(new Error('Validation error'));
            const res = await (0, supertest_1.default)(app)
                .post('/api/alerts')
                .send({});
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ success: false, error: 'Validation error' });
        });
    });
    describe('PUT /api/alerts/:id', () => {
        test('should update an existing alert', async () => {
            const updatedData = { targetPrice: 3500 };
            alertService.updateAlert.mockResolvedValue({ count: 1 });
            const res = await (0, supertest_1.default)(app)
                .put('/api/alerts/1')
                .send(updatedData);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ success: true, data: { count: 1 } });
            expect(alertService.updateAlert).toHaveBeenCalledWith('1', 'testUserId', updatedData);
        });
        test('should return 404 if alert not found or unauthorized', async () => {
            alertService.updateAlert.mockResolvedValue({ count: 0 });
            const res = await (0, supertest_1.default)(app)
                .put('/api/alerts/nonexistent')
                .send({ targetPrice: 1 });
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ success: false, error: 'Alert not found or unauthorized' });
        });
        test('should handle errors', async () => {
            alertService.updateAlert.mockRejectedValue(new Error('Update error'));
            const res = await (0, supertest_1.default)(app)
                .put('/api/alerts/1')
                .send({ targetPrice: 1 });
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ success: false, error: 'Update error' });
        });
    });
    describe('DELETE /api/alerts/:id', () => {
        test('should delete an alert', async () => {
            alertService.deleteAlert.mockResolvedValue({ count: 1 });
            const res = await (0, supertest_1.default)(app).delete('/api/alerts/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ success: true, data: { count: 1 } });
            expect(alertService.deleteAlert).toHaveBeenCalledWith('1', 'testUserId');
        });
        test('should return 404 if alert not found or unauthorized', async () => {
            alertService.deleteAlert.mockResolvedValue({ count: 0 });
            const res = await (0, supertest_1.default)(app).delete('/api/alerts/nonexistent');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ success: false, error: 'Alert not found or unauthorized' });
        });
        test('should handle errors', async () => {
            alertService.deleteAlert.mockRejectedValue(new Error('Delete error'));
            const res = await (0, supertest_1.default)(app).delete('/api/alerts/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ success: false, error: 'Delete error' });
        });
    });
});
