"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.validateUser = validateUser;
exports.getUserProfile = getUserProfile;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function createUser(email, password) {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    return prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });
}
async function validateUser(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return null;
    }
    const isValidPassword = await bcrypt_1.default.compare(password, user.password);
    if (!isValidPassword) {
        return null;
    }
    return user;
}
async function getUserProfile(userId) {
    return prisma.user.findUnique({ where: { id: userId } });
}
