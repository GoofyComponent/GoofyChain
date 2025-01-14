import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { WalletAnalysisService } from './wallet-analysis.service';

@Controller('wallet-analysis')
// @UseGuards(JwtAuthGuard)
export class WalletAnalysisController {
  constructor(private readonly walletAnalysisService: WalletAnalysisService) {}

  @Post('analyze')
  async analyzeWallet(
    @Body()
    data: {
      walletAddress: string;
      startDate: string;
      endDate: string;
      currency?: string;
    },
  ) {
    return this.walletAnalysisService.analyzeWallet(
      data.walletAddress,
      new Date(data.startDate),
      new Date(data.endDate),
      data.currency,
    );
  }

  @Get(':id/points')
  async getAnalysisPoints(@Param('id') id: string) {
    return this.walletAnalysisService.getTransactionPoints(id);
  }

  @Get('history')
  async getWalletHistory(
    @Query('address') address: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('currency') currency?: string,
  ) {
    return this.walletAnalysisService.getAnalysisByDateRange(
      address,
      new Date(startDate),
      new Date(endDate),
      currency,
    );
  }
}
