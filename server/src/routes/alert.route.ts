import { Router, Request, Response } from 'express';
import { createAlert, getAlerts, updateAlert, deleteAlert } from '../services/alert.service';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all alerts for a user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const alerts = await getAlerts(userId);
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new alert
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const alertData = { ...req.body, userId };
    const newAlert = await createAlert(alertData);
    res.status(201).json({ success: true, data: newAlert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update an alert
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const alertId = req.params.id;
    const alertData = req.body;
    const updatedAlert = await updateAlert(alertId, userId, alertData);
    if (updatedAlert.count === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found or unauthorized' });
    }
    res.json({ success: true, data: updatedAlert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete an alert
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const alertId = req.params.id;
    const deletedAlert = await deleteAlert(alertId, userId);
    if (deletedAlert.count === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found or unauthorized' });
    }
    res.json({ success: true, data: deletedAlert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
