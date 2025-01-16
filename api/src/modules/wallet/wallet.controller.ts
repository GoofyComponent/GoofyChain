import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@Controller({ path: 'wallet', version: '1' })
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':address/balance')
  @ApiOperation({ summary: 'Get the balance of a wallet' })
  @ApiParam({
    name: 'address',
    description: 'Ethereum address of the wallet',
  })
  async getWalletBalance(@Param('address') address: string) {
    return this.walletService.getWalletBalance(address);
  }

  @Get(':address/transactions')
  @ApiOperation({
    summary: 'Get the transaction history of a wallet',
  })
  @ApiParam({
    name: 'address',
    description: 'Ethereum address of the wallet',
  })
  async getWalletTransactions(@Param('address') address: string): Promise<any> {
    return this.walletService.getTransactionList(address);
  }
}
