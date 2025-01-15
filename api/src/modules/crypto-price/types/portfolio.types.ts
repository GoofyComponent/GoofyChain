export interface PortfolioDataPoint {
  timestamp: Date;
  value: number;
  ethPrice: number;
  netValue: number;
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
