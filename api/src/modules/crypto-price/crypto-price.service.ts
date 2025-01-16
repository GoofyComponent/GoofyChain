import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PortfolioDataPoint, PortfolioStats } from './types/portfolio.types';

@Injectable()
export class CryptoPriceService {
  private readonly cryptocompareApiKey: string;
  private readonly requestQueue: Map<string, Promise<number>> = new Map();
  private readonly secondWindow: number[] = [];
  private readonly minuteWindow: number[] = [];
  private readonly baseRetryDelay = 2000;
  private retryMultiplier = 1;
  private maxRequestsPerSecond: number;
  private maxRequestsPerMinute: number;
  private readonly baseUrl = 'https://min-api.cryptocompare.com/data';

  constructor(private configService: ConfigService) {
    this.cryptocompareApiKey = this.configService.get('CRYPTOCOMPARE_API_KEY');

    if (!this.cryptocompareApiKey) {
      this.maxRequestsPerSecond = 5; // Limites plus restrictives en mode non authentifié
      this.maxRequestsPerMinute = 50;
      console.log(
        'CryptoCompare API: Mode non authentifié (limites restreintes)',
      );
    } else {
      this.maxRequestsPerSecond = 15;
      this.maxRequestsPerMinute = 250;
      console.log('CryptoCompare API: Mode authentifié (limites étendues)');
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async handleRateLimitError(): Promise<void> {
    // console.log(
    // ` Rate limit atteint, augmentation du délai (x${this.retryMultiplier})`,
    // );
    const waitTime = this.baseRetryDelay * this.retryMultiplier;
    this.retryMultiplier = Math.min(this.retryMultiplier * 2, 8);
    await this.delay(waitTime);
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    while (this.secondWindow.length > 0 && this.secondWindow[0] < now - 1000) {
      this.secondWindow.shift();
    }

    while (this.minuteWindow.length > 0 && this.minuteWindow[0] < now - 60000) {
      this.minuteWindow.shift();
    }

    let waitTime = 0;

    if (this.secondWindow.length >= this.maxRequestsPerSecond) {
      const oldestSecondRequest = this.secondWindow[0];
      const waitForSecond = oldestSecondRequest + 1000 - now;
      waitTime = Math.max(waitTime, waitForSecond);
    }

    if (this.minuteWindow.length >= this.maxRequestsPerMinute) {
      const oldestMinuteRequest = this.minuteWindow[0];
      const waitForMinute = oldestMinuteRequest + 60000 - now;
      waitTime = Math.max(waitTime, waitForMinute);
    }

    waitTime = Math.max(waitTime, 300);

    if (waitTime > 0) {
      // const secondRate = this.secondWindow.length;
      // const minuteRate = this.minuteWindow.length;
      // console.log(
      // ` Rate limit atteint (${secondRate}/${this.maxRequestsPerSecond} req/sec, ${minuteRate}/${this.maxRequestsPerMinute} req/min). Attente de ${waitTime}ms`,
      // );
      await this.delay(waitTime);
    }

    const currentTime = Date.now();
    this.secondWindow.push(currentTime);
    this.minuteWindow.push(currentTime);
  }

  private getDayTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    date.setHours(0, 0, 0, 0);
    return `${date.getTime() / 1000}_${date.getTimezoneOffset()}`;
  }

  private getUrl(endpoint: string): string {
    const baseUrl = `${this.baseUrl}${endpoint}`;
    return this.cryptocompareApiKey
      ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}api_key=${this.cryptocompareApiKey}`
      : baseUrl;
  }

  async getHistoricalPrice(
    timestamp: number,
    currency: string = 'EUR',
  ): Promise<number> {
    const date = new Date(timestamp * 1000);
    const dayKey = this.getDayTimestamp(timestamp);

    console.error(
      `\x1b[34m Récupération du prix ETH/${currency} pour le ${date.toLocaleString()}\x1b[0m`,
    );
    console.log(
      ` Utilisation API: ${this.secondWindow.length}/${this.maxRequestsPerSecond} req/sec, ${this.minuteWindow.length}/${this.maxRequestsPerMinute} req/min`,
    );
    console.log(` Clé de cache pour la journée: ${dayKey}`);

    const cachedPrice = this.requestQueue.get(dayKey);
    if (cachedPrice) {
      // console.log(' Prix trouvé dans le cache pour cette journée');
      this.retryMultiplier = 1;
      return cachedPrice;
    }

    const pricePromise = new Promise<number>(async (resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        try {
          await this.checkRateLimit();

          // console.log(
          // ` Envoi de la requête à CryptoCompare... (tentative ${attempts + 1}/${maxAttempts})`,
          // );
          const dayTimestamp = Math.floor(
            new Date(date.setHours(0, 0, 0, 0)).getTime() / 1000,
          );

          const response = await axios.get(this.getUrl('/v2/histoday'), {
            params: {
              fsym: 'ETH',
              tsym: currency,
              limit: 1,
              toTs: dayTimestamp,
            },
          });

          // console.log(response.data.Data.Data[0]);

          if (response.data.Response === 'Error') {
            if (response.data.Message.includes('rate limit')) {
              // console.error(' Erreur de rate limit CryptoCompare');
              await this.handleRateLimitError();
              attempts++;
              continue;
            }
            throw new Error(response.data.Message);
          }

          const price = response.data.Data.Data[0].close;
          // console.log(
          // ` Prix journalier récupéré: ${price} ${currency} (${date.toLocaleDateString()})`,
          // );
          this.retryMultiplier = 1;
          resolve(price);
          break;
        } catch (error) {
          if (attempts === maxAttempts - 1) {
            // console.error(' Nombre maximum de tentatives atteint');
            reject(error);
          } else {
            // console.error(
            //   ` Erreur lors de la tentative ${attempts + 1}:`,
            //   error,
            // );
            await this.handleRateLimitError();
            attempts++;
          }
        }
      }
    });

    this.requestQueue.set(dayKey, pricePromise);
    // console.log(' Prix journalier mis en cache pour 1 heure');

    pricePromise.finally(() => {
      setTimeout(() => {
        this.requestQueue.delete(dayKey);
        // console.log(
        // ` Prix journalier supprimé du cache pour ${date.toLocaleDateString()}`,
        // );
      }, 3600000);
    });

    return pricePromise;
  }

  async getPortfolioValueHistory(
    transactions: any[],
  ): Promise<PortfolioDataPoint[]> {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const sortedTransactions = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    const dataPoints: PortfolioDataPoint[] = [];

    for (const tx of sortedTransactions) {
      dataPoints.push({
        timestamp: tx.timestamp,
        ethBalance: tx.balance,
        fiatBalance: tx.balance * tx.ethPrice,
        ethPrice: tx.ethPrice,
      });
    }

    return this.addIntermediatePoints(dataPoints);
  }

  private addIntermediatePoints(
    dataPoints: PortfolioDataPoint[],
  ): PortfolioDataPoint[] {
    if (dataPoints.length < 2) return dataPoints;

    const result: PortfolioDataPoint[] = [];
    const DAY_IN_MS = 24 * 60 * 60 * 1000;

    for (let i = 0; i < dataPoints.length - 1; i++) {
      const current = dataPoints[i];
      const next = dataPoints[i + 1];
      result.push(current);

      const daysDiff =
        (next.timestamp.getTime() - current.timestamp.getTime()) / DAY_IN_MS;
      if (daysDiff > 1) {
        const numberOfPoints = Math.min(Math.floor(daysDiff), 30);
        for (let j = 1; j < numberOfPoints; j++) {
          const timestamp = new Date(
            current.timestamp.getTime() + j * DAY_IN_MS,
          );
          const progress = j / numberOfPoints;
          const ethBalance =
            current.ethBalance +
            (next.ethBalance - current.ethBalance) * progress;
          const ethPrice =
            current.ethPrice + (next.ethPrice - current.ethPrice) * progress;
          const fiatBalance = ethBalance * ethPrice;

          result.push({
            timestamp,
            ethBalance,
            fiatBalance,
            ethPrice,
          });
        }
      }
    }
    result.push(dataPoints[dataPoints.length - 1]);

    return result;
  }

  async getPortfolioStats(transactions: any[]): Promise<PortfolioStats> {
    if (!transactions || transactions.length === 0) {
      return {
        totalValue: 0,
        dailyChange: 0,
        weeklyChange: 0,
        monthlyChange: 0,
        numberOfTransactions: 0,
        averageTransactionValue: 0,
        lastUpdated: new Date(),
      };
    }

    const sortedTransactions = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    const totalValue = sortedTransactions.reduce(
      (sum, tx) => sum + tx.value,
      0,
    );

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyChange = this.calculateChange(
      sortedTransactions,
      oneDayAgo,
      now,
    );
    const weeklyChange = this.calculateChange(
      sortedTransactions,
      oneWeekAgo,
      now,
    );
    const monthlyChange = this.calculateChange(
      sortedTransactions,
      oneMonthAgo,
      now,
    );

    return {
      totalValue,
      dailyChange,
      weeklyChange,
      monthlyChange,
      numberOfTransactions: transactions.length,
      averageTransactionValue: totalValue / transactions.length,
      lastUpdated: now,
    };
  }

  private calculateChange(
    transactions: any[],
    startDate: Date,
    endDate: Date,
  ): number {
    const periodTransactions = transactions.filter(
      (tx) => tx.timestamp >= startDate && tx.timestamp <= endDate,
    );

    if (periodTransactions.length === 0) return 0;

    const valueChange = periodTransactions.reduce(
      (sum, tx) => sum + tx.netValue * tx.ethPrice,
      0,
    );

    const initialValue = transactions
      .filter((tx) => tx.timestamp < startDate)
      .reduce((sum, tx) => sum + tx.netValue * tx.ethPrice, 0);

    return initialValue !== 0
      ? (valueChange / Math.abs(initialValue)) * 100
      : 0;
  }
}
