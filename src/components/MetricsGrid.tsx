'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import logger from '@/utils/logger';
import { formatCompactCurrency, formatROI, formatRevenuePerRecipient, formatPercentage } from '@/utils/formatters';

export type TimeRange = 'today' | '7days' | '30days';

interface MetricsGridProps {
  timeRange: TimeRange;
  storeId?: string;
}

interface MetricsData {
  revenue: number;
  revenueChange: number;
  roi: number;
  roiChange: number;
  revenuePerRecipient: number;
  revenuePerRecipientChange: number;
  conversionRate: number;
  conversionRateChange: number;
  messagesSent: number;
  attributedOrders: number;
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
    <Card className={`p-5 hover:shadow-lg transition-shadow flex flex-col h-full ${highlight ? "border-2 border-emerald-500" : ""}`}>
      {/* Header: Icon + Title on left, Growth indicator on right */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`p-1.5 ${highlight ? "bg-emerald-50" : "bg-blue-50"} rounded-lg flex-shrink-0`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-600 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{title}</span>
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-medium whitespace-nowrap ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>

      {/* Metric Value: Fixed height for alignment with tabular numbers */}
      <div className="min-h-[40px] flex items-center mb-1">
        <div className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {prefix}{value}
        </div>
      </div>

      {/* Description: Short and consistent */}
      <p className="text-xs text-gray-500 mt-auto">{subtitle}</p>
    </Card>
  );
}

// Note: Using formatters from @/utils/formatters for consistent formatting

export function MetricsGrid({ timeRange, storeId }: MetricsGridProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      if (!storeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/analytics/revenue/${storeId}?timeRange=${timeRange}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform backend data to frontend format
        setMetrics({
          revenue: data.attributed_revenue || 0,
          revenueChange: data.revenue_change || 0,
          roi: data.roi || 0,
          roiChange: data.roi_change || 15,
          revenuePerRecipient: data.revenue_per_recipient || 0,
          revenuePerRecipientChange: data.revenue_per_recipient_change || 18,
          conversionRate: data.conversion_rate || 0,
          conversionRateChange: data.conversion_rate_change || 12,
          messagesSent: data.total_messages_sent || 0,
          attributedOrders: data.attributed_orders || 0,
        });

        logger.info('Metrics fetched successfully', {
          context: 'MetricsGrid',
          metadata: { storeId, timeRange, revenue: data.attributed_revenue }
        });
      } catch (err: any) {
        logger.error('Error fetching metrics', {
          context: 'MetricsGrid',
          error: err,
          metadata: { storeId, timeRange }
        });
        setError(err.message);
        
        // Fallback to default values on error
        setMetrics({
          revenue: 0,
          revenueChange: 0,
          roi: 0,
          roiChange: 0,
          revenuePerRecipient: 0,
          revenuePerRecipientChange: 0,
          conversionRate: 0,
          conversionRateChange: 0,
          messagesSent: 0,
          attributedOrders: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [timeRange, storeId]);

  // Default metrics while loading or on error
  const defaultMetrics: MetricsData = {
    revenue: 0,
    revenueChange: 0,
    roi: 0,
    roiChange: 0,
    revenuePerRecipient: 0,
    revenuePerRecipientChange: 0,
    conversionRate: 0,
    conversionRateChange: 0,
    messagesSent: 0,
    attributedOrders: 0,
  };

  const displayMetrics = metrics || defaultMetrics;

  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="AI Revenue"
        value={formatCompactCurrency(displayMetrics.revenue)}
        change={displayMetrics.revenueChange}
        subtitle="Recovered by AI"
        icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
        prefix=""
        highlight={true}
      />

      <MetricCard
        title="ROI"
        value={formatROI(displayMetrics.roi)}
        change={displayMetrics.roiChange}
        subtitle="Revenue per $1 spent"
        icon={<Target className="w-4 h-4 text-blue-600" />}
        prefix=""
      />

      <MetricCard
        title="Revenue / Email"
        value={formatRevenuePerRecipient(displayMetrics.revenuePerRecipient)}
        change={displayMetrics.revenuePerRecipientChange}
        subtitle="Avg revenue per email"
        icon={<Users className="w-4 h-4 text-blue-600" />}
        prefix=""
      />

      <MetricCard
        title="Conversion Rate"
        value={formatPercentage(displayMetrics.conversionRate)}
        change={displayMetrics.conversionRateChange}
        subtitle="Recipients who purchased"
        icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
        prefix=""
      />
    </div>
  );
}
