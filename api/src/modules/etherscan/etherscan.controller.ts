import { Controller, Get, Param } from '@nestjs/common';
import { EtherscanService } from './etherscan.service';

@Controller('etherscan')
export class EtherscanController {
  constructor(private readonly etherscanService: EtherscanService) {}

  @Get('balance/:address')
  getAddressBalance(@Param('address') address: string) {
    return this.etherscanService.getAddressBalance(address);
  }

  @Get('transactions/:address')
  getTransactions(@Param('address') address: string) {
    return this.etherscanService.getTransactions(address);
  }
}
