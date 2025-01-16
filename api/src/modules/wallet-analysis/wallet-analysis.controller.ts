import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseDatePipe } from '../../common/pipes/parse-date.pipe';
import {
  PortfolioDataPoint,
  PortfolioStats,
  TransactionPoint,
} from '../crypto-price/types/portfolio.types';
import { UsersService } from '../users/users.service';
import { WalletAnalysisService } from './wallet-analysis.service';

@Controller({
  path: 'wallet-analysis',
  version: '1',
})
@ApiTags('Analyse de Wallet')
@UseInterceptors(ClassSerializerInterceptor)
export class WalletAnalysisController {
  constructor(
    private readonly walletAnalysisService: WalletAnalysisService,
    private readonly usersService: UsersService,
  ) {}

  @Post('analyze')
  @Version('1')
  @ApiOperation({ summary: 'Analyser un wallet Ethereum' })
  @ApiResponse({
    status: 201,
    description: 'Analyse du wallet effectuée avec succès',
  })
  async analyzeWallet(
    @Body('walletAddress') walletAddress: string,
  ): Promise<any> {
    return this.walletAnalysisService.analyzeWallet(walletAddress);
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
  ): Promise<any> {
    return this.walletAnalysisService.getAnalysisByDateRange(walletAddress);
  }

  @Get('transactions')
  @Version('1')
  @ApiOperation({ summary: 'Récupérer les points de transaction' })
  @ApiResponse({
    status: 200,
    description: 'Points de transaction récupérés avec succès',
  })
  async getTransactionPoints(
    @Query('analysisId') analysisId: string,
  ): Promise<TransactionPoint[]> {
    return this.walletAnalysisService.getTransactionPoints(analysisId);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('portfolio-history')
  @ApiOperation({ summary: "Obtenir l'historique de la valeur du portfolio" })
  @ApiResponse({
    status: 200,
    description: 'Historique récupéré avec succès',
  })
  async getPortfolioHistory(
    @Query('walletAddress') walletAddress: string,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
    @Query('currency') currency?: string,
    @Req() req?: any,
  ): Promise<PortfolioDataPoint[]> {
    let finalCurrency = currency;

    if (!finalCurrency && req?.user?.id) {
      const user = await this.usersService.findOne(req.user.id);
      finalCurrency = user?.preferedCurrency || 'EUR';
    }

    const analysis = await this.walletAnalysisService.analyzeWallet(
      walletAddress,
      finalCurrency,
    );

    return this.walletAnalysisService.getPortfolioHistory(
      analysis.transactions,
      finalCurrency,
    );
  }

  @Get('portfolio-stats')
  @ApiOperation({ summary: 'Obtenir les statistiques du portfolio' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
  })
  async getPortfolioStats(
    @Query('walletAddress') walletAddress: string,
  ): Promise<PortfolioStats> {
    const analysis =
      await this.walletAnalysisService.analyzeWallet(walletAddress);
    return this.walletAnalysisService.getPortfolioStats(analysis.transactions);
  }

  @Get('transactions-summary')
  @ApiOperation({ summary: 'Obtenir un résumé des transactions' })
  @ApiResponse({
    status: 200,
    description: 'Résumé récupéré avec succès',
  })
  async getTransactionsSummary(
    @Query('walletAddress') walletAddress: string,
  ): Promise<any> {
    const analysis =
      await this.walletAnalysisService.analyzeWallet(walletAddress);
    return this.walletAnalysisService.getTransactionsSummary(
      analysis.transactions,
    );
  }

  @Get(':address')
  // @UseGuards(JwtAuthGuard)
  async analyzeWalletByAddress(
    @Param('address') address: string,
    @Query('currency') currency: string = 'EUR',
  ) {
    return this.walletAnalysisService.analyzeWallet(address, currency);
  }

  @Get(':address/history')
  // @UseGuards(JwtAuthGuard)
  async getPortfolioHistoryByAddress(
    @Param('address') address: string,
    @Query('currency') currency: string = 'EUR',
  ) {
    const analysis = await this.walletAnalysisService.analyzeWallet(
      address,
      currency,
    );
    return this.walletAnalysisService.getPortfolioHistory(
      analysis.transactions,
      currency,
    );
  }

  @Get(':address/stats')
  // @UseGuards(JwtAuthGuard)
  async getPortfolioStatsByAddress(@Param('address') address: string) {
    const analysis =
      await this.walletAnalysisService.getAnalysisByDateRange(address);
    return this.walletAnalysisService.getPortfolioStats(analysis.transactions);
  }
}
