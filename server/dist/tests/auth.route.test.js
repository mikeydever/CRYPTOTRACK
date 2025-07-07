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
const auth_route_1 = __importDefault(require("../routes/auth.route"));
const authService = __importStar(require("../services/auth.service"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/auth', auth_route_1.default);
jest.mock('../services/auth.service');
jest.mock('jsonwebtoken');
describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/auth/register', () => {
        test('should register a new user and return a token', async () => {
            authService.validateUser.mockResolvedValue(null);
            authService.createUser.mockResolvedValue({
                id: 'user123',
                email: 'test@example.com',
            });
            jsonwebtoken_1.default.sign.mockReturnValue('mockToken');
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: 'password123' });
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('test@example.com');
            expect(response.body.data.token).toBe('mockToken');
            expect(authService.createUser).toHaveBeenCalledWith('test@example.com', 'password123');
        });
        test('should return 400 if email or password are missing', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com' });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email and password are required');
        });
        test('should return 409 if user already exists', async () => {
            authService.validateUser.mockResolvedValue({
                id: 'user123',
                email: 'test@example.com',
            });
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: 'password123' });
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User with this email already exists');
        });
        test('should return 500 on internal server error', async () => {
            authService.validateUser.mockRejectedValue(new Error('Database error'));
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: 'password123' });
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Database error');
        });
    });
    describe('POST /api/auth/login', () => {
        test('should login a user and return a token', async () => {
            authService.validateUser.mockResolvedValue({
                id: 'user123',
                email: 'test@example.com',
            });
            jsonwebtoken_1.default.sign.mockReturnValue('mockToken');
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('test@example.com');
            expect(response.body.data.token).toBe('mockToken');
            expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
        });
        test('should return 400 if email or password are missing', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email and password are required');
        });
        test('should return 401 if invalid credentials', async () => {
            authService.validateUser.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });
        test('should return 500 on internal server error', async () => {
            authService.validateUser.mockRejectedValue(new Error('Database error'));
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Database error');
        });
    });
});
