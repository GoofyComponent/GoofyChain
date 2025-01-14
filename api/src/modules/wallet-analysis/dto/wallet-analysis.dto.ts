import { ApiProperty } from '@nestjs/swagger';

export class WalletAnalysisRequestDto {
  @ApiProperty({
    description: 'Adresse du wallet Ethereum à analyser',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  walletAddress: string;

  @ApiProperty({
    description: "Date de début de l'analyse (format: YYYY-MM-DD)",
    example: '2024-01-01',
  })
  startDate: Date;

  @ApiProperty({
    description: "Date de fin de l'analyse (format: YYYY-MM-DD)",
    example: '2024-12-31',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Devise pour les conversions',
    example: 'EUR',
    default: 'EUR',
  })
  currency?: string;
}

export class TransactionPointDto {
  @ApiProperty({
    description: 'Horodatage de la transaction',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Solde du wallet après la transaction',
    example: 1.5,
  })
  balance: number;

  @ApiProperty({
    description: "Prix de l'ETH au moment de la transaction",
    example: 2500.75,
  })
  ethPrice: number;

  @ApiProperty({
    description: 'Gas utilisé pour la transaction',
    example: 0.002,
  })
  gasUsed: number;

  @ApiProperty({
    description: 'Valeur de la transaction en ETH',
    example: 0.5,
  })
  value: number;
}

export class PortfolioStatsDto {
  @ApiProperty({
    description: 'Valeur totale du portfolio',
    example: 25000.5,
  })
  totalValue: number;

  @ApiProperty({
    description: 'Changement de valeur sur 24h (%)',
    example: 5.2,
  })
  dailyChange: number;

  @ApiProperty({
    description: 'Changement de valeur sur 7 jours (%)',
    example: -2.8,
  })
  weeklyChange: number;

  @ApiProperty({
    description: 'Changement de valeur sur 30 jours (%)',
    example: 15.4,
  })
  monthlyChange: number;

  @ApiProperty({
    description: 'Nombre total de transactions',
    example: 42,
  })
  numberOfTransactions: number;

  @ApiProperty({
    description: 'Valeur moyenne des transactions',
    example: 0.75,
  })
  averageTransactionValue: number;

  @ApiProperty({
    description: 'Dernière mise à jour des statistiques',
    example: '2024-01-15T10:30:00Z',
  })
  lastUpdated: Date;
}

export class TransactionsSummaryDto {
  @ApiProperty({
    description: 'Nombre total de transactions',
    example: 42,
  })
  totalTransactions: number;

  @ApiProperty({
    description: 'Total des entrées en devise',
    example: 15000.5,
  })
  totalIncoming: number;

  @ApiProperty({
    description: 'Total des sorties en devise',
    example: 12000.25,
  })
  totalOutgoing: number;

  @ApiProperty({
    description: 'Valeur moyenne des transactions',
    example: 500.75,
  })
  averageValue: number;

  @ApiProperty({
    description: 'Total des frais de gas en devise',
    example: 250.3,
  })
  totalGasFees: number;
}
