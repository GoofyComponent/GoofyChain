export interface PortfolioDataPoint {
  timestamp: Date;
  ethBalance: number; // Solde en ETH
  fiatBalance: number; // Solde converti en devise (EUR/USD)
  ethPrice: number; // Prix de l'ETH au moment donné
}

export interface PortfolioStats {
  totalValue: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
  numberOfTransactions: number;
  averageTransactionValue: number;
  lastUpdated: Date;
}

export interface TransactionPoint {
  timestamp: Date;
  balance: number;
  ethPrice: number;
  gasUsed: number;
  value: number;
}
