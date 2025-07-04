import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { calculatePortfolioMetrics } from '../services/portfolio.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  try {
    const userId = req.user.id;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    });

    // TODO: Fetch real-time prices from CoinGecko API
    const currentPrices: { [coinId: string]: number } = {
      bitcoin: 45000, // Placeholder
      ethereum: 2200, // Placeholder
    };

    const portfolio = calculatePortfolioMetrics(transactions, currentPrices);
    res.json({ success: true, data: portfolio });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
