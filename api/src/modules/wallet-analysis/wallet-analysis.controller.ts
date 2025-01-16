import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
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
export class WalletAnalysisController {
  constructor(
    private readonly walletAnalysisService: WalletAnalysisService,
    private readonly usersService: UsersService,
  ) {}

  @Post('analyze')
  @Version('1')
  @ApiOperation({ summary: 'Analyze an Ethereum wallet' })
  @ApiResponse({
    status: 201,
    description: 'Wallet analysis successfully performed',
  })
  async analyzeWallet(
    @Body('walletAddress') walletAddress: string,
  ): Promise<any> {
    return this.walletAnalysisService.analyzeWallet(walletAddress);
  }

  @Get('analysis')
  @Version('1')
  @ApiOperation({ summary: 'Retrieve analysis by date range' })
  @ApiResponse({
    status: 200,
    description: 'Analysis successfully found',
  })
  async getAnalysisByDateRange(
    @Query('walletAddress') walletAddress: string,
  ): Promise<any> {
    return this.walletAnalysisService.getAnalysisByDateRange(walletAddress);
  }

  @Get('transactions')
  @Version('1')
  @ApiOperation({ summary: 'Collect transaction points' })
  @ApiResponse({
    status: 200,
    description: 'Transaction points successfully retrieved',
  })
  async getTransactionPoints(
    @Query('analysisId') analysisId: string,
  ): Promise<TransactionPoint[]> {
    return this.walletAnalysisService.getTransactionPoints(analysisId);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('portfolio-history')
  @ApiOperation({ summary: 'Get Portfolio Value History' })
  @ApiResponse({
    status: 200,
    description: 'History successfully retrieved',
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
  @ApiOperation({ summary: 'Get Portfolio Statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics successfully retrieved',
  })
  async getPortfolioStats(
    @Query('walletAddress') walletAddress: string,
  ): Promise<PortfolioStats> {
    const analysis =
      await this.walletAnalysisService.analyzeWallet(walletAddress);
    return this.walletAnalysisService.getPortfolioStats(analysis.transactions);
  }

  @Get('transactions-summary')
  @ApiOperation({ summary: 'Get a summary of transactions' })
  @ApiResponse({
    status: 200,
    description: 'Summary successfully retrieved',
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
}
