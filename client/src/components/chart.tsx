"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChartDataType } from "@/routes/_authenticated/dashboard"

const chartConfig = {
  fiatBalance: {
    label: "Total (€)",
    color: "hsl(var(--chart-1))",
  },
  ethPrice: {
    label: "ETH price (€)",
    color: "hsl(var(--chart-3))",
  },
  ethBalance: {
    label: "ETH",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function Chart({chartData}: {chartData: ChartDataType}) {
  const [timeRange, setTimeRange] = React.useState("30d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.timestamp)
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(Date.now() - daysToSubtract * 24 * 60 * 60 * 1000)
    return date >= startDate
  })

  return <Card className="rounded-xl md:min-h-min bg-muted/50">
  <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
    <div className="grid flex-1 gap-1 text-center sm:text-left">
      <CardTitle>Chart</CardTitle>
    </div>
    <Select value={timeRange} onValueChange={setTimeRange}>
      <SelectTrigger
        className="w-[160px] rounded-lg sm:ml-auto"
        aria-label="Select a value"
      >
        <SelectValue placeholder="Last 3 months" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="90d" className="rounded-lg">
          Last 3 months
        </SelectItem>
        <SelectItem value="30d" className="rounded-lg">
          Last 30 days
        </SelectItem>
        <SelectItem value="7d" className="rounded-lg">
          Last 7 days
        </SelectItem>
      </SelectContent>
    </Select>
  </CardHeader>
  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[250px] w-full"
    >
      <AreaChart data={filteredData}>
        <defs>
          <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-fiatBalance)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-fiatBalance)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillEth" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-ethBalance)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-ethBalance)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-ethPrice)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-ethPrice)"
              stopOpacity={0.1}
            />
          </linearGradient>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="fiatBalance"
          type="natural"
          fill="url(#fillTotal)"
          stroke="var(--color-fiatBalance)"
          stackId="a"
        />
        <Area
          dataKey="ethBalance"
          type="step"
          fill="url(#fillEth)"
          stroke="var(--color-ethBalance)"
          stackId="a"
        />
        <Area
          dataKey="ethPrice"
          type="natural"
          fill="url(#fillPrice)"
          stroke="var(--color-ethPrice)"
          stackId="b"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  </CardContent>
  </Card>
}