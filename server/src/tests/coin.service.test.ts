import axios from 'axios';
import { fetchCoinPrices } from '../services/coin.service';

jest.mock('axios');

describe('Coin Service', () => {
  describe('fetchCoinPrices', () => {
    test('should fetch prices for given coin IDs', async () => {
      const mockCoinGeckoResponse = {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 3000 },
      };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockCoinGeckoResponse });

      const coinIds = ['bitcoin', 'ethereum'];
      const prices = await fetchCoinPrices(coinIds);

      expect(axios.get).toHaveBeenCalledWith('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
      expect(prices).toEqual(mockCoinGeckoResponse);
    });

    test('should return empty object if no coin IDs are provided', async () => {
      const prices = await fetchCoinPrices([]);
      expect(axios.get).not.toHaveBeenCalled();
      expect(prices).toEqual({});
    });

    test('should handle API errors', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(fetchCoinPrices(['bitcoin'])).rejects.toThrow('Failed to fetch coin prices.');
    });
  });
});
