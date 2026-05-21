
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Restaurant } from "@/lib/types"

const chartConfig = {
  averageSentiment: {
    label: "Average Sentiment",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

interface SentimentChartProps {
    data: Restaurant[];
}

export function SentimentChart({ data }: SentimentChartProps) {
  const chartData = data.map(r => ({
    name: r.name,
    averageSentiment: r.averageSentiment ? parseFloat(r.averageSentiment.toFixed(2)) : 0,
  }));
  
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-80">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
        />
        <YAxis
            domain={[-1, 1]}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Legend />
        <Bar dataKey="averageSentiment" fill="var(--color-averageSentiment)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
