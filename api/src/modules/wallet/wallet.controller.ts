import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':address/balance')
  @ApiOperation({ summary: "Obtenir le solde d'un portefeuille" })
  @ApiParam({
    name: 'address',
    description: 'Adresse Ethereum du portefeuille',
  })
  async getWalletBalance(@Param('address') address: string) {
    return this.walletService.getWalletBalance(address);
  }

  @Get(':address/transactions')
  @ApiOperation({
    summary: "Obtenir l'historique des transactions d'un portefeuille",
  })
  @ApiParam({
    name: 'address',
    description: 'Adresse Ethereum du portefeuille',
  })
  async getWalletTransactions(@Param('address') address: string): Promise<any> {
    return this.walletService.getWalletTransactions(address);
  }
}
