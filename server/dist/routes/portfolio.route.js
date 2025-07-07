"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const portfolio_service_1 = require("../services/portfolio.service");
const client_1 = require("@prisma/client");
const coin_service_1 = require("../services/coin.service");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    const prisma = new client_1.PrismaClient();
    try {
        const userId = req.user.userId;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' }
        });
        const uniqueCoinIds = [...new Set(transactions.map(t => t.coinId))];
        const currentPrices = await (0, coin_service_1.fetchCoinPrices)(uniqueCoinIds);
        const formattedPrices = {};
        for (const coinId in currentPrices) {
            formattedPrices[coinId] = currentPrices[coinId].usd;
        }
        const portfolio = (0, portfolio_service_1.calculatePortfolioMetrics)(transactions, formattedPrices);
        res.json({ success: true, data: portfolio });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
