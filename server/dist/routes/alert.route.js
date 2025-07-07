"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alert_service_1 = require("../services/alert.service");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all alerts for a user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const alerts = await (0, alert_service_1.getAlerts)(userId);
        res.json({ success: true, data: alerts });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Create a new alert
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const alertData = { ...req.body, userId };
        const newAlert = await (0, alert_service_1.createAlert)(alertData);
        res.status(201).json({ success: true, data: newAlert });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Update an alert
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const alertId = req.params.id;
        const alertData = req.body;
        const updatedAlert = await (0, alert_service_1.updateAlert)(alertId, userId, alertData);
        if (updatedAlert.count === 0) {
            return res.status(404).json({ success: false, error: 'Alert not found or unauthorized' });
        }
        res.json({ success: true, data: updatedAlert });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Delete an alert
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const alertId = req.params.id;
        const deletedAlert = await (0, alert_service_1.deleteAlert)(alertId, userId);
        if (deletedAlert.count === 0) {
            return res.status(404).json({ success: false, error: 'Alert not found or unauthorized' });
        }
        res.json({ success: true, data: deletedAlert });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
