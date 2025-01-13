import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as etherscan from 'etherscan-api';
import Web3 from 'web3';

@Injectable()
export class WalletService {
  private readonly etherscanApi;
  private readonly web3;

  constructor(private configService: ConfigService) {
    this.etherscanApi = etherscan.init(
      this.configService.get('ETHERSCAN_API_KEY'),
    );
    this.web3 = new Web3();
  }

  async getWalletBalance(address: string) {
    try {
      const balance = await this.etherscanApi.account.balance(address);
      return {
        address,
        balance: this.web3.utils.fromWei(balance.result, 'ether'),
      };
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération du solde: ${error.message}`,
      );
    }
  }

  async getWalletTransactions(address: string) {
    try {
      const transactions = await this.etherscanApi.account.txlist(
        address,
        1,
        'latest',
        1,
        100,
        'desc',
      );

      return transactions.result.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: this.web3.utils.fromWei(tx.value, 'ether'),
        gasPrice: this.web3.utils.fromWei(tx.gasPrice, 'gwei'),
        gasUsed: tx.gasUsed,
        timestamp: new Date(Number(tx.timeStamp) * 1000),
        isError: tx.isError === '1',
        totalCost: this.web3.utils.fromWei(
          (
            BigInt(tx.gasUsed) * BigInt(tx.gasPrice) +
            BigInt(tx.value)
          ).toString(),
          'ether',
        ),
      }));
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des transactions: ${error.message}`,
      );
    }
  }
}
