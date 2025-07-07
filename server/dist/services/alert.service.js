"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlert = createAlert;
exports.getAlerts = getAlerts;
exports.updateAlert = updateAlert;
exports.deleteAlert = deleteAlert;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createAlert(data) {
    return prisma.alert.create({ data });
}
async function getAlerts(userId) {
    return prisma.alert.findMany({ where: { userId } });
}
async function updateAlert(alertId, userId, data) {
    return prisma.alert.updateMany({
        where: { id: alertId, userId },
        data,
    });
}
async function deleteAlert(alertId, userId) {
    return prisma.alert.deleteMany({
        where: { id: alertId, userId },
    });
}
