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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const auth_service_1 = require("../services/auth.service");
jest.mock('bcrypt');
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
        __esModule: true, // This is important for default exports
    };
});
describe('Auth Service', () => {
    let prisma;
    beforeEach(() => {
        prisma = new client_1.PrismaClient();
        jest.clearAllMocks();
    });
    describe('createUser', () => {
        test('should create a new user and hash the password', async () => {
            bcrypt.hash.mockResolvedValue('hashedPassword');
            prisma.user.create.mockResolvedValue({
                id: '1',
                email: 'test@example.com',
                password: 'hashedPassword',
                createdAt: new Date(),
                transactions: [],
                alerts: [],
            });
            const user = await (0, auth_service_1.createUser)('test@example.com', 'password123');
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@example.com',
                    password: 'hashedPassword',
                },
            });
            expect(user).toEqual(expect.objectContaining({
                email: 'test@example.com',
            }));
        });
    });
    describe('validateUser', () => {
        test('should return user if credentials are valid', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password: 'hashedPassword',
                createdAt: new Date(),
                transactions: [],
                alerts: [],
            };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            const user = await (0, auth_service_1.validateUser)('test@example.com', 'password123');
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(user).toEqual(mockUser);
        });
        test('should return null if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            const user = await (0, auth_service_1.validateUser)('nonexistent@example.com', 'password123');
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
            expect(user).toBeNull();
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });
        test('should return null if password is invalid', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password: 'hashedPassword',
                createdAt: new Date(),
                transactions: [],
                alerts: [],
            };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            const user = await (0, auth_service_1.validateUser)('test@example.com', 'wrongpassword');
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
            expect(user).toBeNull();
        });
    });
});
