import { Chart } from "@/components/chart";
import { StatCard } from "@/components/stat-card";
import useAuth from "@/hooks/useAuth";
import { useLoaderData } from "@tanstack/react-router";

export function DashboardPage() {
  const { chartData, transactionsData } = useLoaderData({
    from: "/_authenticated/dashboard/summary",
  });

  const { user } = useAuth();

  const sortedChartData = chartData.sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  const currentState = sortedChartData[sortedChartData.length - 1];

  const getCurrencySymbol = (currency?: string) =>
    (0)
      .toLocaleString("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\d/g, "")
      .trim();

  return (
    <div className="flex flex-col gap-4 p-4 pt-0 h-full justify-center">
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <StatCard
          title="Current Value"
          value={`${(+currentState.fiatBalance).toFixed(2)} ${getCurrencySymbol(user?.preferedCurrency)}`}
          variant="secondary"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          title="ETH"
          value={`${currentState.ethBalance}`}
          variant="secondary"
        />
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        <StatCard
          title="ETH price"
          value={`${(+currentState.ethPrice).toFixed(2)} ${getCurrencySymbol(user?.preferedCurrency)} per ETH`}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <StatCard
          title="Total number transactions"
          value={`${transactionsData.totalTransactions}`}
          variant="secondary"
        />
        <StatCard
          title="Average ETH per transaction"
          value={`${transactionsData.avgTransactionValue}`}
        />
        <StatCard
          title="Largest transaction"
          value={`${transactionsData.largestTransaction}`}
        />
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <StatCard
          title="Total ETH sent"
          value={`${transactionsData.totalOutgoing}`}
        />
        <StatCard
          title="Total ETH received"
          value={`${transactionsData.totalIncoming}`}
        />
      </div>
      <Chart chartData={sortedChartData} />
    </div>
  );
}
