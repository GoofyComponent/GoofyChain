import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PortfolioDataPoint, PortfolioStats } from './types/portfolio.types';

@Injectable()
export class CryptoPriceService {
  constructor(private configService: ConfigService) {}

  async getPortfolioValueHistory(
    transactions: any[],
    currency: string = 'USD',
  ): Promise<PortfolioDataPoint[]> {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Trier les transactions par date
    const sortedTransactions = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    let runningBalance = 0;
    const dataPoints: PortfolioDataPoint[] = [];

    // Calculer la valeur du portfolio à chaque transaction
    for (const tx of sortedTransactions) {
      const valueChange = tx.netValue * tx.ethPrice;
      runningBalance += valueChange;

      dataPoints.push({
        timestamp: tx.timestamp,
        value: runningBalance,
        ethPrice: tx.ethPrice,
        netValue: tx.netValue,
      });
    }

    // Ajouter des points intermédiaires pour avoir une meilleure visualisation
    const enhancedDataPoints = this.addIntermediatePoints(dataPoints);

    return enhancedDataPoints;
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

      // Si l'écart entre deux points est supérieur à 1 jour
      const daysDiff =
        (next.timestamp.getTime() - current.timestamp.getTime()) / DAY_IN_MS;
      if (daysDiff > 1) {
        // Ajouter des points intermédiaires
        const numberOfPoints = Math.min(Math.floor(daysDiff), 30); // Maximum 30 points
        for (let j = 1; j < numberOfPoints; j++) {
          const timestamp = new Date(
            current.timestamp.getTime() + j * DAY_IN_MS,
          );
          const progress = j / numberOfPoints;
          const value = current.value + (next.value - current.value) * progress;
          const ethPrice =
            current.ethPrice + (next.ethPrice - current.ethPrice) * progress;

          result.push({
            timestamp,
            value,
            ethPrice,
            netValue: 0, // Pas de transaction réelle à ce point
          });
        }
      }
    }
    result.push(dataPoints[dataPoints.length - 1]);

    return result;
  }

  async getPortfolioStats(
    transactions: any[],
    currency: string = 'USD',
  ): Promise<PortfolioStats> {
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

    // Trier les transactions par date
    const sortedTransactions = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    // Calculer la valeur totale
    const totalValue = sortedTransactions.reduce(
      (sum, tx) => sum + tx.netValue * tx.ethPrice,
      0,
    );

    // Obtenir les dates pour les calculs de changement
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculer les changements
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

    // Retourner le changement en pourcentage
    const initialValue = transactions
      .filter((tx) => tx.timestamp < startDate)
      .reduce((sum, tx) => sum + tx.netValue * tx.ethPrice, 0);

    return initialValue !== 0
      ? (valueChange / Math.abs(initialValue)) * 100
      : 0;
  }
}
