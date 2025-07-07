import axios from 'axios';

interface CoinPrice {
  [key: string]: {
    usd: number;
  };
}

export async function fetchCoinPrices(coinIds: string[]): Promise<CoinPrice> {
  if (coinIds.length === 0) {
    return {};
  }

  const coinIdsString = coinIds.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIdsString}&vs_currencies=usd`;

  try {
    const response = await axios.get<CoinPrice>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching coin prices from CoinGecko:', error);
    throw new Error('Failed to fetch coin prices.');
  }
}
