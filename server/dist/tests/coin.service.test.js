"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const coin_service_1 = require("../services/coin.service");
jest.mock('axios');
describe('Coin Service', () => {
    describe('fetchCoinPrices', () => {
        test('should fetch prices for given coin IDs', async () => {
            const mockCoinGeckoResponse = {
                bitcoin: { usd: 50000 },
                ethereum: { usd: 3000 },
            };
            axios_1.default.get.mockResolvedValue({ data: mockCoinGeckoResponse });
            const coinIds = ['bitcoin', 'ethereum'];
            const prices = await (0, coin_service_1.fetchCoinPrices)(coinIds);
            expect(axios_1.default.get).toHaveBeenCalledWith('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
            expect(prices).toEqual(mockCoinGeckoResponse);
        });
        test('should return empty object if no coin IDs are provided', async () => {
            const prices = await (0, coin_service_1.fetchCoinPrices)([]);
            expect(axios_1.default.get).not.toHaveBeenCalled();
            expect(prices).toEqual({});
        });
        test('should handle API errors', async () => {
            axios_1.default.get.mockRejectedValue(new Error('Network error'));
            await expect((0, coin_service_1.fetchCoinPrices)(['bitcoin'])).rejects.toThrow('Failed to fetch coin prices.');
        });
    });
});
