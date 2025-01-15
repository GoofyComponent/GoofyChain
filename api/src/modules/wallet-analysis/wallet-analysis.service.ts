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

  private async getInternalTransactions(
    address: string,
    startBlock = 0,
    endBlock = 99999999,
  ): Promise<any[]> {
    console.log(`Récupération des transactions internes pour ${address}`);

    let allInternalTxs: any[] = [];
    let currentStartBlock = startBlock;
    let hasMoreTransactions = true;

    while (hasMoreTransactions) {
      try {
        const response = await axios.get('https://api.etherscan.io/api', {
          params: {
            module: 'account',
            action: 'txlistinternal',
            address,
            startblock: currentStartBlock,
            endblock: endBlock,
            offset: 10000,
            sort: 'asc',
            apikey: this.etherscanApiKey,
          },
        });

        if (response.data.status === '1' && response.data.result.length > 0) {
          const transactions = response.data.result;
          allInternalTxs = [...allInternalTxs, ...transactions];

          if (transactions.length === 10000) {
            currentStartBlock =
              parseInt(transactions[transactions.length - 1].blockNumber) + 1;
          } else {
            hasMoreTransactions = false;
          }
        } else {
          hasMoreTransactions = false;
        }

        await new Promise((resolve) => setTimeout(resolve, 200)); // Respect des limites de l'API
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des transactions internes:',
          error,
        );
        throw error;
      }
    }

    return allInternalTxs;
  }

  private async getNormalTransactions(
    address: string,
    startBlock = 0,
    endBlock = 99999999,
  ): Promise<any[]> {
    console.error(
      `\x1b[31mDébut de la récupération des transactions pour ${address}\x1b[0m`,
    );
    console.error(
      `\x1b[31mBlock de départ: ${startBlock}, Block de fin: ${endBlock}\x1b[0m`,
    );

    let allTransactions: any[] = [];
    let currentStartBlock = startBlock;
    let hasMoreTransactions = true;
    let batchNumber = 1;

    while (hasMoreTransactions) {
      try {
        console.log(
          `\nRécupération du lot #${batchNumber} depuis le block ${currentStartBlock}`,
        );

        const response = await axios.get(this.etherscanApiUrl, {
          params: {
            module: 'account',
            action: 'txlist',
            address,
            startblock: currentStartBlock,
            endblock: endBlock,
            offset: 10000,
            sort: 'asc',
            apikey: this.etherscanApiKey,
            chainId: '1',
          },
        });

        if (response.data.status === '1' && response.data.result.length > 0) {
          const transactions = response.data.result;
          allTransactions = [...allTransactions, ...transactions];

          console.log(
            `${transactions.length} nouvelles transactions récupérées`,
          );
          console.log(`Total actuel: ${allTransactions.length} transactions`);

          if (transactions.length === 10000) {
            currentStartBlock =
              parseInt(transactions[transactions.length - 1].blockNumber) + 1;
            console.log(`Passage au block suivant: ${currentStartBlock}`);
            batchNumber++;
          } else {
            console.log('Plus de transactions à récupérer');
            hasMoreTransactions = false;
          }
        } else {
          console.log('Aucune transaction trouvée dans ce lot');
          hasMoreTransactions = false;
        }

        console.log('Pause de 200ms...');
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des transactions:',
          error,
        );
        throw error;
      }
    }

    console.log(
      `\nRécupération terminée! Total: ${allTransactions.length} transactions`,
    );
    return allTransactions;
  }

  private async getTransactionList(
    address: string,
    startBlock = 0,
    endBlock = 99999999,
  ) {
    console.log(`Récupération de toutes les transactions pour ${address}`);

    // Récupérer les transactions normales et internes en parallèle
    const [normalTxs, internalTxs] = await Promise.all([
      this.getNormalTransactions(address, startBlock, endBlock),
      this.getInternalTransactions(address, startBlock, endBlock),
    ]);

    // Fusionner et trier toutes les transactions par bloc et index
    const allTransactions = [...normalTxs, ...internalTxs].sort((a, b) => {
      const blockDiff = parseInt(a.blockNumber) - parseInt(b.blockNumber);
      if (blockDiff !== 0) return blockDiff;
      // Pour les transactions dans le même bloc, utiliser l'index de transaction
      return (
        parseInt(a.transactionIndex || '0') -
        parseInt(b.transactionIndex || '0')
      );
    });

    return allTransactions;
  }

  async analyzeWallet(
    walletAddress: string,
    currency: string = 'EUR',
  ): Promise<any> {
    console.error(`\x1b[31mAnalyse du portefeuille ${walletAddress}\x1b[0m`);
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
    console.log('Récupération des transactions...');
    const transactions = await this.getTransactionList(walletAddress);
    console.log(`${transactions.length} transactions récupérées`);

    let currentBalance = 0;
    const totals = await transactions.reduce(
      async (acc, tx) => {
        try {
          // Gérer le cas où value est null (certaines transactions internes)
          const value = tx.value ? parseFloat(ethers.formatEther(tx.value)) : 0;
          const gasUsed = tx.gasUsed
            ? parseFloat(ethers.formatEther(tx.gasUsed))
            : 0;
          const gasPrice = tx.gasPrice
            ? parseFloat(ethers.formatEther(tx.gasPrice))
            : 0;
          const gasCost = gasUsed * gasPrice;

          // Pour les transactions internes, vérifier si c'est un transfert vers le wallet
          const isIncoming =
            tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase();
          const netValue = isIncoming ? value : -(value + gasCost);

          // Sauvegarder la balance précédente avant la mise à jour
          tx.previousBalance = currentBalance;

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
        } catch (error) {
          console.error('Erreur lors du traitement de la transaction:', tx);
          console.error('Erreur:', error);
          return acc;
        }
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

    const savedAnalysis = await this.walletAnalysisRepository.save(analysis);

    // Sauvegarder les transactions avec leur solde
    console.log('Sauvegarde des transactions...');
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

        // Récupérer le prix de l'ETH au moment de la transaction
        const timestamp = parseInt(tx.timeStamp);
        const ethPrice = await this.cryptoPriceService.getHistoricalPrice(
          timestamp,
          currency,
        );

        transaction.hash = tx.hash;
        transaction.walletAddress = walletAddress.toLowerCase();

        // Gérer les valeurs nulles pour les transactions internes
        transaction.value = tx.value
          ? parseFloat(ethers.formatEther(tx.value))
          : 0;
        transaction.gasUsed = tx.gasUsed
          ? parseFloat(ethers.formatEther(tx.gasUsed))
          : 0;
        transaction.gasPrice = tx.gasPrice
          ? parseFloat(ethers.formatEther(tx.gasPrice))
          : 0;

        const gasCost = transaction.gasUsed * transaction.gasPrice;
        const isIncoming =
          tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase();
        transaction.netValue = isIncoming
          ? transaction.value
          : -(transaction.value + gasCost);
        transaction.ethPrice = ethPrice;
        transaction.timestamp = new Date(timestamp * 1000);
        transaction.isIncoming = isIncoming;
        transaction.analysis = savedAnalysis;
        transaction.balance = tx.balance;
        transaction.previousBalance = tx.previousBalance;

        return this.walletTransactionRepository.save(transaction);
      }),
    );

    return this.walletAnalysisRepository.findOne({
      where: { id: savedAnalysis.id },
      relations: ['transactions'],
    });
  }

  async getAnalysisByDateRange(
    walletAddress: string,
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

    for (const tx of transactions) {
      dataPoints.push({
        timestamp: tx.timestamp,
        ethBalance: tx.balance,
        fiatBalance: tx.balance * tx.ethPrice,
        ethPrice: tx.ethPrice,
      });
    }

    return dataPoints;
  }

  async getPortfolioStats(
    transactions: WalletTransaction[],
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
