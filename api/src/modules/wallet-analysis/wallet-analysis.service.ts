import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as ethers from 'ethers';
import { Repository } from 'typeorm';
import { AccountLockoutService } from '../auth/services/account-lockout.service';
import { CryptoPriceService } from '../crypto-price/crypto-price.service';
import {
  PortfolioDataPoint,
  PortfolioStats,
  TransactionPoint,
} from '../crypto-price/types/portfolio.types';
import { WalletAnalysis } from './entities/wallet-analysis.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';

@Injectable()
export class WalletAnalysisService {
  private readonly etherscanApiKey: string;
  private readonly etherscanApiUrl = 'https://api.etherscan.io/v2/api';

  constructor(
    @InjectRepository(WalletAnalysis)
    private walletAnalysisRepository: Repository<WalletAnalysis>,
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,
    private configService: ConfigService,
    private accountLockoutService: AccountLockoutService,
    private cryptoPriceService: CryptoPriceService,
  ) {
    this.etherscanApiKey = this.configService.get('ETHERSCAN_API_KEY');
  }
  // TODO recuperr les transaction internes aussi
  private async getTransactionList(
    address: string,
    startBlock = 0,
    endBlock = 99999999,
  ): Promise<any[]> {
    try {
      const response = await axios.get(this.etherscanApiUrl, {
        params: {
          chainId: '1',
          module: 'account',
          action: 'txlist',
          address,
          startblock: startBlock,
          endblock: endBlock,
          sort: 'asc',
          apikey: this.etherscanApiKey,
        },
      });

      if (response.data.status === '1' && response.data.message === 'OK') {
        console.log(response.data.result);
        return response.data.result;
      }

      console.error('Etherscan API error:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async analyzeWallet(walletAddress: string): Promise<any> {
    // Vérifier si une analyse existe déjà pour cette période
    const existingAnalysis = await this.walletAnalysisRepository.findOne({
      where: {
        walletAddress,
      },
      relations: ['transactions'],
    });

    // if (existingAnalysis) {
    //   return existingAnalysis;
    // }

    // Récupérer l'historique des transactions via l'API Etherscan
    const transactions = await this.getTransactionList(walletAddress);

    // Calculer les totaux et le solde pour chaque transaction
    let currentBalance = 0;
    const totals = await transactions.reduce(
      async (acc, tx) => {
        const value = parseFloat(ethers.formatEther(tx.value));
        const gasUsed = parseFloat(ethers.formatEther(tx.gasUsed));
        const gasPrice = parseFloat(ethers.formatUnits(tx.gasPrice, 'gwei'));
        const gasCost = gasUsed * gasPrice;
        const isIncoming = tx.to.toLowerCase() === walletAddress.toLowerCase();
        const netValue = isIncoming ? value : -(value + gasCost);

        // Mettre à jour le solde courant
        currentBalance += netValue;
        tx.balance = currentBalance;

        if (isIncoming) {
          (await acc).totalIncoming += value;
        } else {
          (await acc).totalOutgoing += value;
        }

        (await acc).totalGasFees += gasCost;
        (await acc).totalTransactions += 1;

        return acc;
      },
      Promise.resolve({
        totalIncoming: 0,
        totalOutgoing: 0,
        totalGasFees: 0,
        totalTransactions: 0,
      }),
    );

    // Créer l'analyse
    const analysis = this.walletAnalysisRepository.create({
      walletAddress,
      totalTransactions: totals.totalTransactions,
      totalIncoming: totals.totalIncoming,
      totalOutgoing: totals.totalOutgoing,
      totalGasFees: totals.totalGasFees,
      netBalance:
        totals.totalIncoming - totals.totalOutgoing - totals.totalGasFees,
    });

    // console.log(analysis);

    // Sauvegarder l'analyse
    const savedAnalysis = await this.walletAnalysisRepository.save(analysis);

    // Sauvegarder les transactions avec leur solde
    await Promise.all(
      transactions.map(async (tx) => {
        // Vérifier si la transaction existe déjà
        let transaction = await this.walletTransactionRepository.findOne({
          where: {
            hash: tx.hash,
            walletAddress: walletAddress.toLowerCase(),
          },
        });

        if (!transaction) {
          transaction = this.walletTransactionRepository.create();
        }

        transaction.hash = tx.hash;
        transaction.walletAddress = walletAddress.toLowerCase();
        transaction.value = parseFloat(ethers.formatEther(tx.value));
        transaction.gasUsed = parseFloat(ethers.formatEther(tx.gasUsed));
        transaction.gasPrice = parseFloat(ethers.formatEther(tx.gasPrice));
        transaction.netValue = parseFloat(ethers.formatEther(tx.value));
        transaction.ethPrice = 2;
        transaction.fiatValue = parseFloat(ethers.formatEther(tx.value)) * 2;
        transaction.timestamp = new Date(parseInt(tx.timeStamp) * 1000);
        transaction.isIncoming =
          tx.to.toLowerCase() === walletAddress.toLowerCase();
        transaction.analysis = savedAnalysis;
        transaction.balance = tx.balance;

        return this.walletTransactionRepository.save(transaction);
      }),
    );

    // return {
    //   walletAddress,
    //   startDate,
    //   endDate,
    //   currency,
    //   initialBalance: 0,
    //   totalTransactions: totals.totalTransactions,
    //   totalIncoming: totals.totalIncoming,
    //   totalOutgoing: totals.totalOutgoing,
    //   totalGasFees: totals.totalGasFees,
    //   netBalance:
    //     totals.totalIncoming - totals.totalOutgoing - totals.totalGasFees,
    // };

    return this.walletAnalysisRepository.findOne({
      where: { id: savedAnalysis.id },
      relations: ['transactions'],
    });
  }

  private async getEthPrice(
    timestamp: number,
    currency: string,
  ): Promise<number> {
    try {
      const date = new Date(timestamp * 1000).toISOString().split('T')[0];
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${date}`,
      );
      return response.data.market_data.current_price[currency.toLowerCase()];
    } catch (error) {
      console.error('Erreur lors de la récupération du prix ETH:', error);
      return 0;
    }
  }

  private async getBalanceAtDate(address: string, date: Date): Promise<number> {
    try {
      const blockNumber = await this.getBlockNumberByTimestamp(
        date.getTime() / 1000,
      );
      const balance = await this.getBalance(address, blockNumber);
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      return 0;
    }
  }

  private async getBlockNumberByTimestamp(timestamp: number): Promise<number> {
    try {
      const response = await axios.get(this.etherscanApiUrl, {
        params: {
          module: 'block',
          action: 'getblocknobytime',
          timestamp,
          closest: 'before',
          apikey: this.etherscanApiKey,
        },
      });

      if (response.data.status === '1' && response.data.message === 'OK') {
        return parseInt(response.data.result);
      }

      console.error('Etherscan API error:', response.data);
      return 0;
    } catch (error) {
      console.error('Error fetching block number:', error);
      return 0;
    }
  }

  private async getBalance(
    address: string,
    blockNumber: number,
  ): Promise<string> {
    try {
      const response = await axios.get(this.etherscanApiUrl, {
        params: {
          module: 'account',
          action: 'balance',
          address,
          blockno: blockNumber,
          tag: 'latest',
          apikey: this.etherscanApiKey,
        },
      });

      if (response.data.status === '1' && response.data.message === 'OK') {
        return response.data.result;
      }

      console.error('Etherscan API error:', response.data);
      return '0';
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }

  async getAnalysisByDateRange(
    walletAddress: string,
    startDate: Date,
    endDate: Date,
    currency = 'EUR',
  ): Promise<WalletAnalysis | null> {
    return this.walletAnalysisRepository.findOne({
      where: {
        walletAddress,
      },
      relations: ['transactions'],
    });
  }

  async getTransactionPoints(analysisId: string): Promise<TransactionPoint[]> {
    const analysis = await this.walletAnalysisRepository.findOne({
      where: { id: analysisId },
      relations: ['transactions'],
    });

    if (!analysis) {
      return [];
    }

    return analysis.transactions.map((tx) => ({
      timestamp: tx.timestamp,
      balance: tx.netValue,
      ethPrice: tx.ethPrice,
      gasUsed: parseFloat(tx.gasUsed.toString()),
      value: tx.value,
    }));
  }

  async getPortfolioHistory(
    transactions: WalletTransaction[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currency: string,
  ): Promise<PortfolioDataPoint[]> {
    const dataPoints: PortfolioDataPoint[] = [];
    let balance = 0;

    for (const tx of transactions) {
      balance += tx.isIncoming ? tx.value : -tx.value;

      dataPoints.push({
        timestamp: tx.timestamp,
        value: tx.fiatValue,
        ethPrice: tx.ethPrice,
        netValue: balance * tx.ethPrice,
      });
    }

    return dataPoints;
  }

  async getPortfolioStats(
    transactions: WalletTransaction[],
    currency: string,
  ): Promise<PortfolioStats> {
    if (!transactions.length) {
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

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let currentBalance = 0;
    let balanceOneDayAgo = 0;
    let balanceOneWeekAgo = 0;
    let balanceOneMonthAgo = 0;
    let totalTransactionValue = 0;

    for (const tx of transactions) {
      const txValue = tx.isIncoming ? tx.value : -tx.value;
      currentBalance += txValue;
      totalTransactionValue += Math.abs(tx.value);

      if (tx.timestamp <= oneDayAgo) balanceOneDayAgo = currentBalance;
      if (tx.timestamp <= oneWeekAgo) balanceOneWeekAgo = currentBalance;
      if (tx.timestamp <= oneMonthAgo) balanceOneMonthAgo = currentBalance;
    }

    const lastTx = transactions[transactions.length - 1];
    const currentValue = currentBalance * lastTx.ethPrice;

    return {
      totalValue: currentValue,
      dailyChange: balanceOneDayAgo
        ? ((currentValue - balanceOneDayAgo) / balanceOneDayAgo) * 100
        : 0,
      weeklyChange: balanceOneWeekAgo
        ? ((currentValue - balanceOneWeekAgo) / balanceOneWeekAgo) * 100
        : 0,
      monthlyChange: balanceOneMonthAgo
        ? ((currentValue - balanceOneMonthAgo) / balanceOneMonthAgo) * 100
        : 0,
      numberOfTransactions: transactions.length,
      averageTransactionValue: transactions.length
        ? totalTransactionValue / transactions.length
        : 0,
      lastUpdated: now,
    };
  }

  async getTransactionsSummary(transactions: any[]): Promise<any> {
    const summary = {
      totalTransactions: transactions.length,
      totalIncoming: 0,
      totalOutgoing: 0,
      avgTransactionValue: 0,
      largestTransaction: 0,
      transactionsByMonth: {},
    };

    transactions.forEach((tx) => {
      const value = Math.abs(tx.netValue);
      if (tx.netValue > 0) {
        summary.totalIncoming += value;
      } else {
        summary.totalOutgoing += value;
      }

      summary.largestTransaction = Math.max(summary.largestTransaction, value);

      const monthKey = tx.timestamp.toISOString().slice(0, 7);
      if (!summary.transactionsByMonth[monthKey]) {
        summary.transactionsByMonth[monthKey] = {
          count: 0,
          volume: 0,
        };
      }
      summary.transactionsByMonth[monthKey].count++;
      summary.transactionsByMonth[monthKey].volume += value;
    });

    summary.avgTransactionValue =
      transactions.length > 0
        ? (summary.totalIncoming + summary.totalOutgoing) / transactions.length
        : 0;

    return summary;
  }
}
