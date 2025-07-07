"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCoinPrices = fetchCoinPrices;
const axios_1 = __importDefault(require("axios"));
async function fetchCoinPrices(coinIds) {
    if (coinIds.length === 0) {
        return {};
    }
    const coinIdsString = coinIds.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIdsString}&vs_currencies=usd`;
    try {
        const response = await axios_1.default.get(url);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching coin prices from CoinGecko:', error);
        throw new Error('Failed to fetch coin prices.');
    }
}
