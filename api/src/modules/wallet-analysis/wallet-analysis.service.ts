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

        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des transactions internes:',
          error,
        );
        throw error;
      }
    }

    console.log(
      `\nRécupération terminée! Total: ${allInternalTxs.length} transactions internes`,
    );
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
    //Ó console.error(
    //   `\x1b[31mBlock de départ: ${startBlock}, Block de fin: ${endBlock}\x1b[0m`,
    // );

    let allTransactions: any[] = [];
    let currentStartBlock = startBlock;
    let hasMoreTransactions = true;
    const batchNumber = 1;

    while (hasMoreTransactions) {
      try {
        // console.log(
        //   `\nRécupération du lot #${batchNumber} depuis le block ${currentStartBlock}`,
        // );

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

          // console.log(
          //   `${transactions.length} nouvelles transactions récupérées`,
          // );
          // console.log(`Total actuel: ${allTransactions.length} transactions`);

          if (transactions.length === 10000) {
            currentStartBlock =
              parseInt(transactions[transactions.length - 1].blockNumber) + 1;
            // console.log(`Passage au block suivant: ${currentStartBlock}`);
            // batchNumber++;
          } else {
            // console.log('Plus de transactions à récupérer');
            hasMoreTransactions = false;
          }
        } else {
          // console.log('Aucune transaction trouvée dans ce lot');
          hasMoreTransactions = false;
        }

        // console.log('Pause de 200ms...');
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
    // console.log(`Récupération de toutes les transactions pour ${address}`);

    // Récupérer les transactions normales et internes en parallèle
    const [normalTxs, internalTxs] = await Promise.all([
      this.getNormalTransactions(address, startBlock, endBlock),
      this.getInternalTransactions(address, startBlock, endBlock),
    ]);

    // Fusionner et trier toutes les transactions par bloc et index
    const allTransactions = [...normalTxs, ...internalTxs].sort((a, b) => {
      const blockDiff = parseInt(a.blockNumber) - parseInt(b.blockNumber);
      if (blockDiff !== 0) return blockDiff;
      // Si même bloc, prioriser les transactions normales avant les internes
      if (a.isInternalTx !== b.isInternalTx) {
        return a.isInternalTx ? 1 : -1;
      }
      return 0;
    });

    return allTransactions;
  }

  async analyzeWallet(
    walletAddress: string,
    currency: string = 'EUR',
  ): Promise<any> {
    // Vérifier si une analyse existe déjà pour cette période
    const existingAnalysis = await this.walletAnalysisRepository.findOne({
      where: {
        walletAddress,
        currency,
      },
      relations: ['transactions'],
    });

    //TODO : voir plus tard pour optimiser
    // if (existingAnalysis) {
    //   return existingAnalysis;
    // }

    // Récupérer l'historique des transactions via l'API Etherscan
    // console.log('Récupération des transactions...');
    const transactions = await this.getTransactionList(walletAddress);
    // console.log(`${transactions.length} transactions récupérées`);

    let currentBalance = 0;
    const totals = await transactions.reduce(
      async (promisedAcc, tx) => {
        const acc = await promisedAcc;
        const timestamp = parseInt(tx.timeStamp) * 1000;

        // Gérer les valeurs nulles ou manquantes
        const value = tx.value ? parseFloat(ethers.formatEther(tx.value)) : 0;
        const gasPrice = tx.gasPrice
          ? parseFloat(ethers.formatEther(tx.gasPrice))
          : 0;
        const gasUsed = tx.gasUsed ? parseInt(tx.gasUsed) : 0;
        const gasFee = gasPrice * gasUsed;

        // Obtenir le taux de change historique pour la date de la transaction
        const ethPrice = await this.cryptoPriceService.getHistoricalPrice(
          Math.floor(timestamp / 1000),
          currency,
        );

        const isIncoming = tx.to?.toLowerCase() === walletAddress.toLowerCase();
        const isOutgoing =
          tx.from?.toLowerCase() === walletAddress.toLowerCase();

        // Pour les transactions internes, ne pas compter les frais de gas
        const effectiveGasFee = tx.isInternalTx ? 0 : gasFee;

        if (isIncoming) {
          currentBalance += value;
          acc.totalIncoming += value;
          // Stocker la valeur en devise avec le taux historique
          acc.totalIncomingInCurrency =
            (acc.totalIncomingInCurrency || 0) + value * ethPrice;
        }

        if (isOutgoing) {
          currentBalance -= value;
          acc.totalOutgoing += value;
          // Stocker la valeur en devise avec le taux historique
          acc.totalOutgoingInCurrency =
            (acc.totalOutgoingInCurrency || 0) + value * ethPrice;

          // Ne soustraire les frais de gas que pour les transactions sortantes non internes
          if (!tx.isInternalTx) {
            currentBalance -= effectiveGasFee;
            acc.totalGasFees += effectiveGasFee;
            acc.totalGasFeesInCurrency =
              (acc.totalGasFeesInCurrency || 0) + effectiveGasFee * ethPrice;
          }
        }

        // Mettre à jour les valeurs en devise
        acc.currencyValues[currency] = {
          totalGasFees: acc.totalGasFeesInCurrency,
          totalIncoming: acc.totalIncomingInCurrency,
          totalOutgoing: acc.totalOutgoingInCurrency,
          netBalance:
            acc.totalIncomingInCurrency -
            acc.totalOutgoingInCurrency -
            acc.totalGasFeesInCurrency,
          exchangeRate: ethPrice,
        };

        return acc;
      },
      Promise.resolve({
        totalGasFees: 0,
        totalIncoming: 0,
        totalOutgoing: 0,
        totalGasFeesInCurrency: 0,
        totalIncomingInCurrency: 0,
        totalOutgoingInCurrency: 0,
        currencyValues: {},
      }),
    );

    const analysis = existingAnalysis || new WalletAnalysis();
    analysis.walletAddress = walletAddress;
    analysis.currency = currency;
    analysis.totalGasFees = totals.totalGasFees;
    analysis.totalIncoming = totals.totalIncoming;
    analysis.totalOutgoing = totals.totalOutgoing;
    analysis.netBalance = currentBalance;
    analysis.currencyValues = totals.currencyValues;
    analysis.totalTransactions = transactions.length;

    await this.walletAnalysisRepository.save(analysis);

    const savedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        // Vérifier si la transaction existe déjà
        let transaction = await this.walletTransactionRepository.findOne({
          where: {
            hash: tx.hash,
            walletAddress: walletAddress.toLowerCase(),
          },
        });

        if (transaction) {
          transaction.analysis = analysis;
          transaction.blockNumber = parseInt(tx.blockNumber || '0');
          transaction.timestamp = new Date(
            parseInt(tx.timeStamp || '0') * 1000,
          );
          transaction.from = tx.from || '';
          transaction.to = tx.to || '';
          transaction.value = tx.value
            ? parseFloat(ethers.formatEther(tx.value))
            : 0;
          transaction.gasPrice = tx.gasPrice
            ? parseFloat(ethers.formatEther(tx.gasPrice))
            : 0;
          transaction.gasUsed = tx.gasUsed ? parseInt(tx.gasUsed) : 0;
        } else {
          transaction = new WalletTransaction();
          transaction.analysis = analysis;
          transaction.hash = tx.hash;
          transaction.walletAddress = walletAddress.toLowerCase();
          transaction.blockNumber = parseInt(tx.blockNumber || '0');
          transaction.timestamp = new Date(
            parseInt(tx.timeStamp || '0') * 1000,
          );
          transaction.from = tx.from || '';
          transaction.to = tx.to || '';
          transaction.value = tx.value
            ? parseFloat(ethers.formatEther(tx.value))
            : 0;
          transaction.gasPrice = tx.gasPrice
            ? parseFloat(ethers.formatEther(tx.gasPrice))
            : 0;
          transaction.gasUsed = tx.gasUsed ? parseInt(tx.gasUsed) : 0;
        }

        // Récupérer le taux de change historique pour la date de la transaction
        const ethPrice = await this.cryptoPriceService.getHistoricalPrice(
          Math.floor(transaction.timestamp.getTime() / 1000),
          currency,
        );

        transaction.ethPrice = ethPrice;
        transaction.valueInCurrency = transaction.value * ethPrice;
        transaction.currency = currency;

        // Calculer la valeur nette (après frais de gas)
        const gasCost = transaction.gasPrice * transaction.gasUsed;
        transaction.isIncoming =
          tx.to?.toLowerCase() === walletAddress.toLowerCase();
        transaction.netValue = transaction.isIncoming
          ? transaction.value
          : -(transaction.value + gasCost);

        // Mettre à jour les balances
        transaction.previousBalance = currentBalance;
        currentBalance += transaction.netValue;
        transaction.balance = currentBalance;

        return this.walletTransactionRepository.save(transaction);
      }),
    );

    analysis.transactions = savedTransactions;
    return analysis;
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
    currency: string,
  ): Promise<PortfolioDataPoint[]> {
    const dataPoints: PortfolioDataPoint[] = [];

    // Trier les transactions par date
    const sortedTransactions = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    for (const tx of sortedTransactions) {
      // Si la transaction n'est pas dans la devise demandée, on doit recalculer le taux
      if (tx.currency !== currency) {
        const ethPrice = await this.cryptoPriceService.getHistoricalPrice(
          Math.floor(tx.timestamp.getTime() / 1000),
          currency,
        );
        dataPoints.push({
          timestamp: tx.timestamp,
          ethBalance: tx.balance,
          fiatBalance: tx.balance * ethPrice,
          ethPrice: ethPrice,
        });
      } else {
        // Si la transaction est déjà dans la bonne devise, on utilise les valeurs stockées
        dataPoints.push({
          timestamp: tx.timestamp,
          ethBalance: tx.balance,
          fiatBalance: tx.valueInCurrency,
          ethPrice: tx.ethPrice,
        });
      }
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

    // Trier les transactions par date
    const sortedTransactions = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    let currentBalance = 0;
    let totalTransactionValue = 0;

    // Calculer la balance actuelle en tenant compte du type de transaction
    currentBalance = sortedTransactions.reduce((sum, tx) => {
      const txValue = tx.value * (tx.isIncoming ? 1 : -1);
      totalTransactionValue += Math.abs(tx.value); // Pour la moyenne, on garde la valeur absolue
      return sum + txValue;
    }, 0);

    // Trouver les indices des transactions aux dates clés
    let dayAgoIndex = -1;
    let weekAgoIndex = -1;
    let monthAgoIndex = -1;

    let balanceOneDayAgo = 0;
    let balanceOneWeekAgo = 0;
    let balanceOneMonthAgo = 0;

    for (let i = 0; i < sortedTransactions.length; i++) {
      const tx = sortedTransactions[i];
      const txValue = tx.value * (tx.isIncoming ? 1 : -1);

      // Mettre à jour les indices quand on trouve la première transaction après chaque date
      if (dayAgoIndex === -1 && tx.timestamp >= oneDayAgo) {
        dayAgoIndex = Math.max(0, i - 1);
        balanceOneDayAgo = balanceOneDayAgo + txValue;
      }
      if (weekAgoIndex === -1 && tx.timestamp >= oneWeekAgo) {
        weekAgoIndex = Math.max(0, i - 1);
        balanceOneWeekAgo = balanceOneWeekAgo + txValue;
      }
      if (monthAgoIndex === -1 && tx.timestamp >= oneMonthAgo) {
        monthAgoIndex = Math.max(0, i - 1);
        balanceOneMonthAgo = balanceOneMonthAgo + txValue;
      }
    }

    // Calculer les balances jusqu'aux indices trouvés
    balanceOneDayAgo = sortedTransactions
      .slice(0, dayAgoIndex + 1)
      .reduce((sum, tx) => sum + tx.value * (tx.isIncoming ? 1 : -1), 0);

    balanceOneWeekAgo = sortedTransactions
      .slice(0, weekAgoIndex + 1)
      .reduce((sum, tx) => sum + tx.value * (tx.isIncoming ? 1 : -1), 0);

    balanceOneMonthAgo = sortedTransactions
      .slice(0, monthAgoIndex + 1)
      .reduce((sum, tx) => sum + tx.value * (tx.isIncoming ? 1 : -1), 0);

    // Utiliser le dernier prix ETH pour calculer les valeurs en devise
    const lastTx = sortedTransactions[sortedTransactions.length - 1];
    const ethPrice = lastTx.ethPrice;

    const currentValue = currentBalance;
    const oneDayAgoValue = balanceOneDayAgo;
    const oneWeekAgoValue = balanceOneWeekAgo;
    const oneMonthAgoValue = balanceOneMonthAgo;

    return {
      totalValue: currentValue,
      dailyChange:
        oneDayAgoValue !== 0
          ? ((currentValue - oneDayAgoValue) / Math.abs(oneDayAgoValue)) * 100
          : 0,
      weeklyChange:
        oneWeekAgoValue !== 0
          ? ((currentValue - oneWeekAgoValue) / Math.abs(oneWeekAgoValue)) * 100
          : 0,
      monthlyChange:
        oneMonthAgoValue !== 0
          ? ((currentValue - oneMonthAgoValue) / Math.abs(oneMonthAgoValue)) *
            100
          : 0,
      numberOfTransactions: transactions.length,
      averageTransactionValue: totalTransactionValue / transactions.length,
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
