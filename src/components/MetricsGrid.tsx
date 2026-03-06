'use client';

import { TrendingUp, TrendingDown, DollarSign, Target, Users } from "lucide-react";
import { Card } from "./ui/card";

export type TimeRange = 'today' | '7days' | '30days';

interface MetricsGridProps {
  timeRange: TimeRange;
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  subtitle: string;
  icon: React.ReactNode;
  prefix?: string;
  highlight?: boolean;
}

function MetricCard({ title, value, change, subtitle, icon, prefix, highlight }: MetricCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow ${highlight ? "border-2 border-emerald-500" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${highlight ? "bg-emerald-50" : "bg-blue-50"} rounded-lg`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      
      <div className="mb-2">
        <div className="text-3xl font-bold text-gray-900">
          {prefix}{value}
        </div>
      </div>
      
      <p className="text-sm text-gray-500">{subtitle}</p>
    </Card>
  );
}

export function MetricsGrid({ timeRange }: MetricsGridProps) {
  const getMetrics = () => {
    switch (timeRange) {
      case "today":
        return {
          revenue: "0",
          revenueChange: 0,
          roi: "0.0",
          roiChange: 0,
          revenuePerRecipient: "0.00",
          revenuePerRecipientChange: 0,
          conversionRate: "0.0",
          conversionRateChange: 0,
        };
      case "7days":
        return {
          revenue: "11,419",
          revenueChange: 23,
          roi: "4.2",
          roiChange: 15,
          revenuePerRecipient: "34.71",
          revenuePerRecipientChange: 18,
          conversionRate: "24.4",
          conversionRateChange: 12,
        };
      case "30days":
        return {
          revenue: "42,847",
          revenueChange: 35,
          roi: "5.8",
          roiChange: 28,
          revenuePerRecipient: "42.18",
          revenuePerRecipientChange: 32,
          conversionRate: "27.8",
          conversionRateChange: 21,
        };
    }
  };

  const metrics = getMetrics();

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Incremental Revenue"
        value={metrics.revenue}
        change={metrics.revenueChange}
        subtitle="AI-attributed recovery only"
        icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        prefix="$"
        highlight={true}
      />
      
      <MetricCard
        title="Return on Investment"
        value={`${metrics.roi}x`}
        change={metrics.roiChange}
        subtitle="Revenue generated per $1 spent"
        icon={<Target className="w-5 h-5 text-blue-600" />}
        prefix=""
      />
      
      <MetricCard
        title="Revenue per Recipient"
        value={metrics.revenuePerRecipient}
        change={metrics.revenuePerRecipientChange}
        subtitle="Avg revenue per email sent"
        icon={<Users className="w-5 h-5 text-blue-600" />}
        prefix="$"
      />
      
      <MetricCard
        title="Conversion Rate"
        value={`${metrics.conversionRate}%`}
        change={metrics.conversionRateChange}
        subtitle="Recipients who purchased"
        icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
        prefix=""
      />
    </div>
  );
}
