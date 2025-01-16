import { DashboardPage } from "@/pages/DashboardPage";
import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export type ChartDataType = {
  ethBalance: string;
  ethPrice: string;
  fiatBalance: number;
  timestamp: string;
}[];

export type TransactionsDataType = {
  avgTransactionValue: number;
  largestTransaction: number;
  totalIncoming: number;
  totalOutgoing: number;
  totalTransactions: number;
  transactionsByMonth: { [key: string]: { count: number; volume: number } };
};
interface DashboardPageLoaderData {
  // statsData: StatsDataType;
  chartData: ChartDataType;
  transactionsData: TransactionsDataType;
}

export const Route = createFileRoute("/_authenticated/dashboard/summary")({
  loader: async ({ context }) => {
    const walletAddress = context.auth.user?.initialWalletId;
    const currency = context.auth.user?.preferedCurrency;

    if (!walletAddress || !currency) {
      throw new Error("No wallet address or currency found");
    }

    const transactions = await fetch(
      `${API_URL}/wallet-analysis/transactions-summary?walletAddress=${walletAddress}&currency=${currency}`
    );
    const transactionsData = await transactions.json();

    const startDate = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000
    ).toISOString();
    const endDate = new Date().toISOString();

    const chart = await fetch(
      `${API_URL}/wallet-analysis/portfolio-history?walletAddress=${walletAddress}&currency=${currency}&startDate=${startDate}&endDate=${endDate}`
    );
    const chartData = await chart.json();

    return {
      chartData,
      transactionsData,
    } as DashboardPageLoaderData;
  },
  component: DashboardPage,
  pendingComponent: () => {
    return (
      <div className="w-full h-full flex justify-center align-center">
        <LoaderCircle className="animate-spin m-auto" size={64} />
      </div>
    );
  },
});
