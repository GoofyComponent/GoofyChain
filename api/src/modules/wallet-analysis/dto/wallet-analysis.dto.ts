import { ApiProperty } from '@nestjs/swagger';

export class WalletAnalysisRequestDto {
  @ApiProperty({
    description: 'Ethereum wallet address to analyze',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  walletAddress: string;

  @ApiProperty({
    description: 'Analysis start date (format: YYYY-MM-DD)',
    example: '2024-01-01',
  })
  startDate: Date;

  @ApiProperty({
    description: 'End date of analysis (format: YYYY-MM-DD)',
    example: '2024-12-31',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Currency for conversions',
    example: 'EUR',
    default: 'EUR',
  })
  currency?: string;
}

export class TransactionPointDto {
  @ApiProperty({
    description: 'Transaction timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Wallet balance after transaction',
    example: 1.5,
  })
  balance: number;

  @ApiProperty({
    description: 'ETH price at the time of transaction',
    example: 2500.75,
  })
  ethPrice: number;

  @ApiProperty({
    description: 'Gas used for transaction',
    example: 0.002,
  })
  gasUsed: number;

  @ApiProperty({
    description: 'Transaction value in ETH',
    example: 0.5,
  })
  value: number;
}

export class PortfolioStatsDto {
  @ApiProperty({
    description: 'Total portfolio value',
    example: 25000.5,
  })
  totalValue: number;

  @ApiProperty({
    description: '24h value change (%)',
    example: 5.2,
  })
  dailyChange: number;

  @ApiProperty({
    description: '7-day value change (%)',
    example: -2.8,
  })
  weeklyChange: number;

  @ApiProperty({
    description: '30-day value change (%)',
    example: 15.4,
  })
  monthlyChange: number;

  @ApiProperty({
    description: 'Total number of transactions',
    example: 42,
  })
  numberOfTransactions: number;

  @ApiProperty({
    description: 'Average transaction value',
    example: 0.75,
  })
  averageTransactionValue: number;

  @ApiProperty({
    description: 'Latest statistics update',
    example: '2024-01-15T10:30:00Z',
  })
  lastUpdated: Date;
}

export class TransactionsSummaryDto {
  @ApiProperty({
    description: 'Total number of transactions',
    example: 42,
  })
  totalTransactions: number;

  @ApiProperty({
    description: 'Total foreign currency inflows',
    example: 15000.5,
  })
  totalIncoming: number;

  @ApiProperty({
    description: 'Total currency outflows',
    example: 12000.25,
  })
  totalOutgoing: number;

  @ApiProperty({
    description: 'Average transaction value',
    example: 500.75,
  })
  averageValue: number;

  @ApiProperty({
    description: 'Total gas charges in foreign currency',
    example: 250.3,
  })
  totalGasFees: number;
}
