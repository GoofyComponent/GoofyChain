import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Web3 from 'web3';

@Injectable()
export class WalletService {
  private readonly etherscanApiUrl = 'https://api.etherscan.io/v2/api';
  private readonly etherscanApiKey: string;
  private readonly web3;

  /**
   * Creates a new instance of the WalletService
   * @param configService The NestJS ConfigService
   */
  constructor(private configService: ConfigService) {
    this.etherscanApiKey = this.configService.get('ETHERSCAN_API_KEY');
    this.web3 = new Web3();
  }

  async getWalletBalance(address: string) {
    try {
      const response = await axios.get(this.etherscanApiUrl, {
        params: {
          module: 'account',
          action: 'balance',
          address,
          tag: 'latest',
          apikey: this.etherscanApiKey,
          chainId: '1',
        },
      });

      if (response.data.status === '1' && response.data.message === 'OK') {
        return {
          address,
          balance: this.web3.utils.fromWei(response.data.result, 'ether'),
        };
      }
      throw new Error('Erreur lors de la récupération du solde');
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération du solde: ${error.message}`,
      );
    }
  }

  async getWalletTransactions(
    address: string,
    startBlock: number = 0,
    endBlock: number = 99999999,
  ) {
    try {
      const response = await axios.get(this.etherscanApiUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: startBlock,
          endblock: endBlock,
          offset: 10000,
          sort: 'desc',
          apikey: this.etherscanApiKey,
          chainId: '1',
        },
      });

      if (response.data.status === '1' && response.data.message === 'OK') {
        return response.data.result.map((tx) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: this.web3.utils.fromWei(tx.value, 'ether'),
          timeStamp: new Date(parseInt(tx.timeStamp) * 1000),
          gasPrice: this.web3.utils.fromWei(tx.gasPrice, 'gwei'),
          gasUsed: tx.gasUsed,
          isError: tx.isError === '1',
          contractAddress: tx.contractAddress,
        }));
      }
      throw new Error('Erreur lors de la récupération des transactions');
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des transactions: ${error.message}`,
      );
    }
  }
}
