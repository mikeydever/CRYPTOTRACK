import request from 'supertest';
import express from 'express';
import alertRoutes from '../routes/alert.route';
import * as alertService from '../services/alert.service';
import { authenticateToken } from '../../src/middleware/auth';

// Mock authMiddleware and alertService
jest.mock('../middleware/auth', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    req.user = { id: 'testUserId' };
    next();
  }),
}));
jest.mock('../services/alert.service');

const app = express();
app.use(express.json());
app.use('/api/alerts', alertRoutes);

describe('Alert API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/alerts', () => {
    test('should return all alerts for a user', async () => {
      const mockAlerts = [{ id: '1', coinId: 'bitcoin' }];
      (alertService.getAlerts as jest.Mock).mockResolvedValue(mockAlerts);

      const res = await request(app).get('/api/alerts');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ success: true, data: mockAlerts });
      expect(alertService.getAlerts).toHaveBeenCalledWith('testUserId');
    });

    test('should handle errors', async () => {
      (alertService.getAlerts as jest.Mock).mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/alerts');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ success: false, error: 'Database error' });
    });
  });

  describe('POST /api/alerts', () => {
    test('should create a new alert', async () => {
      const newAlertData = { coinId: 'ethereum', targetPrice: 3000, direction: 'above' };
      const createdAlert = { id: '2', ...newAlertData };
      (alertService.createAlert as jest.Mock).mockResolvedValue(createdAlert);

      const res = await request(app)
        .post('/api/alerts')
        .send(newAlertData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({ success: true, data: createdAlert });
      expect(alertService.createAlert).toHaveBeenCalledWith({
        ...newAlertData,
        userId: 'testUserId',
      });
    });

    test('should handle errors', async () => {
      (alertService.createAlert as jest.Mock).mockRejectedValue(new Error('Validation error'));

      const res = await request(app)
        .post('/api/alerts')
        .send({});

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ success: false, error: 'Validation error' });
    });
  });

  describe('PUT /api/alerts/:id', () => {
    test('should update an existing alert', async () => {
      const updatedData = { targetPrice: 3500 };
      (alertService.updateAlert as jest.Mock).mockResolvedValue({ count: 1 });

      const res = await request(app)
        .put('/api/alerts/1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ success: true, data: { count: 1 } });
      expect(alertService.updateAlert).toHaveBeenCalledWith('1', 'testUserId', updatedData);
    });

    test('should return 404 if alert not found or unauthorized', async () => {
      (alertService.updateAlert as jest.Mock).mockResolvedValue({ count: 0 });

      const res = await request(app)
        .put('/api/alerts/nonexistent')
        .send({ targetPrice: 1 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ success: false, error: 'Alert not found or unauthorized' });
    });

    test('should handle errors', async () => {
      (alertService.updateAlert as jest.Mock).mockRejectedValue(new Error('Update error'));

      const res = await request(app)
        .put('/api/alerts/1')
        .send({ targetPrice: 1 });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ success: false, error: 'Update error' });
    });
  });

  describe('DELETE /api/alerts/:id', () => {
    test('should delete an alert', async () => {
      (alertService.deleteAlert as jest.Mock).mockResolvedValue({ count: 1 });

      const res = await request(app).delete('/api/alerts/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ success: true, data: { count: 1 } });
      expect(alertService.deleteAlert).toHaveBeenCalledWith('1', 'testUserId');
    });

    test('should return 404 if alert not found or unauthorized', async () => {
      (alertService.deleteAlert as jest.Mock).mockResolvedValue({ count: 0 });

      const res = await request(app).delete('/api/alerts/nonexistent');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ success: false, error: 'Alert not found or unauthorized' });
    });

    test('should handle errors', async () => {
      (alertService.deleteAlert as jest.Mock).mockRejectedValue(new Error('Delete error'));

      const res = await request(app).delete('/api/alerts/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ success: false, error: 'Delete error' });
    });
  });
});
