import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { calculatePortfolioMetrics } from '../services/portfolio.service';
import { PrismaClient } from '@prisma/client';
import { fetchCoinPrices } from '../services/coin.service';

const router = Router();
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  try {
    const userId = req.user.userId;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    });

    const uniqueCoinIds = [...new Set(transactions.map(t => t.coinId))];
    const currentPrices = await fetchCoinPrices(uniqueCoinIds);
    const formattedPrices: { [coinId: string]: number } = {};
    for (const coinId in currentPrices) {
      formattedPrices[coinId] = currentPrices[coinId].usd;
    }

    const portfolio = calculatePortfolioMetrics(transactions, formattedPrices);
    res.json({ success: true, data: portfolio });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
