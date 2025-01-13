import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EtherscanService {
  private readonly apiKey = process.env.ETHERSCAN_API_KEY;
  private readonly baseUrl = 'https://api.etherscan.io/api';

  async getAddressBalance(address: string) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: 'account',
          action: 'balance',
          address,
          tag: 'latest',
          apikey: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération du solde: ${error.message}`,
      );
    }
  }

  async getTransactions(address: string) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          sort: 'desc',
          apikey: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des transactions: ${error.message}`,
      );
    }
  }
}
