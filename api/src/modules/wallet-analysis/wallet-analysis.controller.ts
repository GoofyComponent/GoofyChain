import { Body, Controller, Get, Post, Query, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseDatePipe } from '../../common/pipes/parse-date.pipe';
import { WalletAnalysisService } from './wallet-analysis.service';

@Controller({
  path: 'wallet-analysis',
  version: '1',
})
@ApiTags('Analyse de Wallet')
export class WalletAnalysisController {
  constructor(private readonly walletAnalysisService: WalletAnalysisService) {}

  @Post('analyze')
  @Version('1')
  @ApiOperation({ summary: 'Analyser un wallet Ethereum' })
  @ApiResponse({
    status: 201,
    description: 'Analyse du wallet effectuée avec succès',
  })
  async analyzeWallet(
    @Body('walletAddress') walletAddress: string,
    @Body('startDate', ParseDatePipe) startDate: Date,
    @Body('endDate', ParseDatePipe) endDate: Date,
    @Body('currency') currency: string = 'EUR',
  ) {
    return this.walletAnalysisService.analyzeWallet(
      walletAddress,
      startDate,
      endDate,
      currency,
    );
  }

  @Get('analysis')
  @Version('1')
  @ApiOperation({ summary: 'Récupérer une analyse par plage de dates' })
  @ApiResponse({
    status: 200,
    description: 'Analyse trouvée avec succès',
  })
  async getAnalysisByDateRange(
    @Query('walletAddress') walletAddress: string,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
    @Query('currency') currency: string = 'EUR',
  ) {
    return this.walletAnalysisService.getAnalysisByDateRange(
      walletAddress,
      startDate,
      endDate,
      currency,
    );
  }

  @Get('transactions')
  @Version('1')
  @ApiOperation({ summary: 'Récupérer les points de transaction' })
  @ApiResponse({
    status: 200,
    description: 'Points de transaction récupérés avec succès',
  })
  async getTransactionPoints(@Query('analysisId') analysisId: string) {
    return this.walletAnalysisService.getTransactionPoints(analysisId);
  }
}
