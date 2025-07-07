"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Use a strong secret in production
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const existingUser = await (0, auth_service_1.validateUser)(email, password);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User with this email already exists' });
        }
        const user = await (0, auth_service_1.createUser)(email, password);
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ success: true, data: { user: { id: user.id, email: user.email }, token } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const user = await (0, auth_service_1.validateUser)(email, password);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ success: true, data: { user: { id: user.id, email: user.email }, token } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await (0, auth_service_1.getUserProfile)(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: { user: { id: user.id, email: user.email } } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
