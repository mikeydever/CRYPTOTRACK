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
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const transactionService = __importStar(require("../services/transaction.service"));
const router = (0, express_1.Router)();
// Get all transactions for a user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const transactions = await transactionService.getTransactionsByUserId(userId);
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Add a new transaction
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update a transaction
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { body } = req;
        const updateData = {};
        // List of allowed fields to update
        const allowedFields = [
            'coinId', 'coinSymbol', 'type', 'quantity', 'pricePerCoin', 'fee', 'timestamp', 'exchange', 'notes'
        ];
        allowedFields.forEach((field) => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });
        const updatedTransaction = await transactionService.updateTransaction(id, userId, updateData);
        res.json(updatedTransaction);
    }
    catch (error) {
        if (error.code === 'P2025') { // Prisma error code for record not found
            return res.status(404).json({ error: 'Transaction not found or not authorized' });
        }
        res.status(500).json({ error: error.message });
    }
});
// Delete a transaction
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        await transactionService.deleteTransaction(id, userId);
        res.status(204).send(); // No content
    }
    catch (error) {
        if (error.code === 'P2025') { // Prisma error code for record not found
            return res.status(404).json({ error: 'Transaction not found or not authorized' });
        }
        res.status(500).json({ error: error.message });
    }
});
// Import transactions from CSV
router.post('/import', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const csvContent = req.body.csv; // Assuming CSV content is sent as a string in the 'csv' field of the request body
        if (!csvContent) {
            return res.status(400).json({ error: 'CSV content is required' });
        }
        const importedTransactions = await transactionService.importTransactionsFromCsv(userId, csvContent);
        res.status(201).json({ message: `Successfully imported ${importedTransactions.length} transactions.`, importedTransactions });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Export transactions to CSV
router.get('/export', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const csv = await transactionService.exportTransactionsToCsv(userId);
        res.header('Content-Type', 'text/csv');
        res.attachment('transactions.csv');
        res.send(csv);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
