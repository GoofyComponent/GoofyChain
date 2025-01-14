import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as ethers from 'ethers';
import * as api from 'etherscan-api';
import { Repository } from 'typeorm';
import { WalletAnalysis } from './entities/wallet-analysis.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';

@Injectable()
export class WalletAnalysisService {
  private readonly etherscan;

  constructor(
    @InjectRepository(WalletAnalysis)
    private walletAnalysisRepository: Repository<WalletAnalysis>,
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get('ETHERSCAN_API_KEY');
    this.etherscan = api.init(apiKey, 'mainnet', 3000);
  }

  async analyzeWallet(
    walletAddress: string,
    startDate: Date,
    endDate: Date,
    currency = 'EUR',
  ) {
    // Vérifier si une analyse récente existe
    const existingAnalysis = await this.walletAnalysisRepository.findOne({
      where: {
        walletAddress,
        startDate,
        endDate,
        currency,
      },
      relations: ['transactions'],
    });

    if (existingAnalysis) {
      return existingAnalysis;
    }

    // Récupérer l'historique des transactions via l'API Etherscan
    const txlist = await this.etherscan.account.txlist(
      walletAddress,
      0,
      'latest',
      1,
      100,
      'asc',
    );

    if (txlist.status !== '1') {
      throw new Error(`Erreur Etherscan: ${txlist.message}`);
    }

    const transactions = await Promise.all(
      txlist.result
        .filter((tx: any) => {
          const txDate = new Date(parseInt(tx.timeStamp) * 1000);
          return txDate >= startDate && txDate <= endDate;
        })
        .map(async (tx: any) => {
          const ethPrice = await this.getEthPrice(
            parseInt(tx.timeStamp),
            currency,
          );

          const value = parseFloat(ethers.formatEther(tx.value));
          const gasUsed = parseFloat(ethers.formatEther(tx.gasUsed));
          const gasPrice = parseFloat(ethers.formatEther(tx.gasPrice));
          const gasCost = gasUsed * gasPrice;

          const isIncoming =
            tx.to.toLowerCase() === walletAddress.toLowerCase();
          const netValue = isIncoming ? value : -(value + gasCost);
          const fiatValue = netValue * ethPrice;

          return {
            hash: tx.hash,
            walletAddress,
            value,
            gasUsed,
            gasPrice,
            netValue,
            ethPrice,
            fiatValue,
            currency,
            timestamp: new Date(parseInt(tx.timeStamp) * 1000),
            isIncoming,
          };
        }),
    );

    // Calculer les totaux
    const totals = transactions.reduce(
      (acc, tx) => {
        if (tx.isIncoming) {
          acc.totalIncoming += tx.fiatValue;
        } else {
          acc.totalOutgoing += Math.abs(tx.fiatValue);
        }
        acc.totalGasFees += tx.gasUsed * tx.gasPrice * tx.ethPrice;
        return acc;
      },
      { totalIncoming: 0, totalOutgoing: 0, totalGasFees: 0 },
    );

    // Créer l'analyse
    const analysis = this.walletAnalysisRepository.create({
      walletAddress,
      startDate,
      endDate,
      currency,
      initialBalance: await this.getBalanceAtDate(walletAddress, startDate),
      finalBalance: await this.getBalanceAtDate(walletAddress, endDate),
      totalGasFees: totals.totalGasFees,
      totalIncoming: totals.totalIncoming,
      totalOutgoing: totals.totalOutgoing,
      netProfit:
        totals.totalIncoming - totals.totalOutgoing - totals.totalGasFees,
    });

    // Sauvegarder l'analyse
    const savedAnalysis = await this.walletAnalysisRepository.save(analysis);

    // Sauvegarder les transactions
    await Promise.all(
      transactions.map((tx) =>
        this.walletTransactionRepository.save({
          ...tx,
          analysis: savedAnalysis,
        }),
      ),
    );

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
      const blockNumber = await this.etherscan.block.getBlockNumberByTimestamp(
        date.getTime() / 1000,
      );
      const balance = await this.etherscan.account.getBalance(
        address,
        blockNumber,
      );
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      return 0;
    }
  }

  async getAnalysisByDateRange(
    walletAddress: string,
    startDate: Date,
    endDate: Date,
    currency = 'EUR',
  ) {
    return this.walletAnalysisRepository.findOne({
      where: {
        walletAddress,
        startDate,
        endDate,
        currency,
      },
      relations: ['transactions'],
    });
  }

  async getTransactionPoints(analysisId: string): Promise<any[]> {
    const transactions = await this.walletTransactionRepository.find({
      where: { analysis: { id: analysisId } },
      order: { timestamp: 'ASC' },
    });

    let balance = 0;
    return transactions.map((tx) => {
      balance += tx.netValue * tx.ethPrice;
      return {
        timestamp: tx.timestamp,
        balance,
        ethPrice: tx.ethPrice,
        gasUsed: tx.gasUsed * tx.gasPrice * tx.ethPrice,
        value: tx.fiatValue,
      };
    });
  }
}
