import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CryptoPriceService {
  private readonly cryptocompareApi: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('CRYPTOCOMPARE_API_KEY');
    this.cryptocompareApi = `https://min-api.cryptocompare.com/data`;
    axios.defaults.headers.common['authorization'] = `Apikey ${apiKey}`;
  }

  async getHistoricalPrice(
    timestamp: number,
    currency = 'EUR',
  ): Promise<number> {
    try {
      const response = await axios.get(
        `${this.cryptocompareApi}/pricehistorical?fsym=ETH&tsyms=${currency}&ts=${timestamp}`,
      );
      return response.data.ETH[currency];
    } catch (error) {
      console.error('Erreur lors de la récupération du prix ETH:', error);
      return 0;
    }
  }

  async getDailyPrices(
    fromTimestamp: number,
    toTimestamp: number,
    currency = 'EUR',
  ): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.cryptocompareApi}/v2/histoday?fsym=ETH&tsym=${currency}&toTs=${toTimestamp}&limit=2000`,
      );
      return response.data.Data.Data.filter(
        (item: any) => item.time >= fromTimestamp && item.time <= toTimestamp,
      );
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des prix journaliers:',
        error,
      );
      return [];
    }
  }

  async getPortfolioValueHistory(
    walletTransactions: any[],
    currency = 'EUR',
  ): Promise<any[]> {
    // Trier les transactions par date
    const sortedTransactions = [...walletTransactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    if (sortedTransactions.length === 0) {
      return [];
    }

    // Obtenir les prix journaliers pour toute la période
    const fromTimestamp = Math.floor(
      sortedTransactions[0].timestamp.getTime() / 1000,
    );
    const toTimestamp = Math.floor(Date.now() / 1000);
    const dailyPrices = await this.getDailyPrices(
      fromTimestamp,
      toTimestamp,
      currency,
    );

    // Calculer la valeur du portfolio pour chaque jour
    let balance = 0;
    let txIndex = 0;
    return dailyPrices.map((priceData: any) => {
      // Appliquer toutes les transactions jusqu'à cette date
      while (
        txIndex < sortedTransactions.length &&
        sortedTransactions[txIndex].timestamp.getTime() / 1000 <= priceData.time
      ) {
        balance += sortedTransactions[txIndex].netValue;
        txIndex++;
      }

      return {
        timestamp: new Date(priceData.time * 1000),
        balance: balance * priceData.close,
        ethPrice: priceData.close,
        ethBalance: balance,
      };
    });
  }

  async getPortfolioStats(walletTransactions: any[], currency = 'EUR') {
    const history = await this.getPortfolioValueHistory(
      walletTransactions,
      currency,
    );
    if (history.length === 0) {
      return {
        currentValue: 0,
        allTimeHigh: 0,
        allTimeLow: 0,
        dailyChange: 0,
        weeklyChange: 0,
        monthlyChange: 0,
      };
    }

    const current = history[history.length - 1];
    const previousDay = history[history.length - 2] || current;
    const previousWeek = history[history.length - 8] || current;
    const previousMonth = history[history.length - 31] || current;

    const allTimeHigh = Math.max(...history.map((h) => h.balance));
    const allTimeLow = Math.min(...history.map((h) => h.balance));

    return {
      currentValue: current.balance,
      allTimeHigh,
      allTimeLow,
      dailyChange:
        ((current.balance - previousDay.balance) / previousDay.balance) * 100,
      weeklyChange:
        ((current.balance - previousWeek.balance) / previousWeek.balance) * 100,
      monthlyChange:
        ((current.balance - previousMonth.balance) / previousMonth.balance) *
        100,
    };
  }
}
