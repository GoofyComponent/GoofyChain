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

  async getTransactionList(
    address: string,
    startBlock = 0,
    endBlock = 99999999,
  ): Promise<any[]> {
    console.log(`Début de la récupération des transactions pour ${address}`);
    console.log(`Block de départ: ${startBlock}, Block de fin: ${endBlock}`);

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
}
