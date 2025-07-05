import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Request, Response } from 'express';
import * as transactionService from '../services/transaction.service';
const router = Router();

// Get all transactions for a user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const transactions = await transactionService.getTransactionsByUserId(userId);
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new transaction
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { coinId, coinSymbol, type, quantity, pricePerCoin, fee, timestamp, exchange, notes } = req.body;

    if (!coinId || !coinSymbol || !type || !quantity || !pricePerCoin || !timestamp) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    const newTransaction = await transactionService.createTransaction({
      userId,
      coinId,
      coinSymbol,
      type,
      quantity,
      pricePerCoin,
      fee: fee || 0,
      timestamp: new Date(timestamp),
      exchange,
      notes,
    });
    res.status(201).json(newTransaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a transaction
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { body } = req;
    const updateData: { [key: string]: any } = {};

    // List of allowed fields to update
    const allowedFields: (keyof typeof body)[] = [
      'coinId', 'coinSymbol', 'type', 'quantity', 'pricePerCoin', 'fee', 'timestamp', 'exchange', 'notes'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const updatedTransaction = await transactionService.updateTransaction(id, userId, updateData);
    res.json(updatedTransaction);
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error code for record not found
      return res.status(404).json({ error: 'Transaction not found or not authorized' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a transaction
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await transactionService.deleteTransaction(id, userId);
    res.status(204).send(); // No content
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error code for record not found
      return res.status(404).json({ error: 'Transaction not found or not authorized' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Import transactions from CSV
router.post('/import', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const csvContent = req.body.csv; // Assuming CSV content is sent as a string in the 'csv' field of the request body

    if (!csvContent) {
      return res.status(400).json({ error: 'CSV content is required' });
    }

    const importedTransactions = await transactionService.importTransactionsFromCsv(userId, csvContent);
    res.status(201).json({ message: `Successfully imported ${importedTransactions.length} transactions.`, importedTransactions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
