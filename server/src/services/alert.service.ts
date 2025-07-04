import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AlertData {
  userId: string;
  coinId: string;
  targetPrice: number;
  direction: 'above' | 'below';
}

export async function createAlert(data: AlertData) {
  return prisma.alert.create({ data });
}

export async function getAlerts(userId: string) {
  return prisma.alert.findMany({ where: { userId } });
}

export async function updateAlert(alertId: string, userId: string, data: Partial<AlertData>) {
  return prisma.alert.updateMany({
    where: { id: alertId, userId },
    data,
  });
}

export async function deleteAlert(alertId: string, userId: string) {
  return prisma.alert.deleteMany({
    where: { id: alertId, userId },
  });
}
