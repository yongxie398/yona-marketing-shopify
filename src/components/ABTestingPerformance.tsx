'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3, 
  AlertCircle,
  CheckCircle2,
  Clock,
  FlaskConical
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface ABTestingPerformanceProps {
  storeId: string;
  timeRange: 'today' | '7days' | '30days' | string;
}

interface ABTestStats {
  period_days: number;
  control_group: {
    orders: number;
    revenue: number;
    percentage: number;
    visitors: number;
    conversion_rate: number;
    aov: number;
  };
  treatment_group: {
    orders: number;
    revenue: number;
    attributed_revenue: number;
    percentage: number;
    visitors: number;
    conversion_rate: number;
    aov: number;
  };
  lift: {
    absolute: number;
    percentage: number;
    interpretation: string;
    incremental_revenue: number;
  };
  statistical_significance: {
    note: string;
    control_sample_size: number;
    treatment_sample_size: number;
    confidence_level: number;
    p_value: number;
    is_significant: boolean;
  };
}

export function ABTestingPerformance({ storeId, timeRange }: ABTestingPerformanceProps) {
  const [stats, setStats] = useState<ABTestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD');

  // Currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Percentage formatter
  const formatPercent = (value: number, decimals = 1) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  };

  useEffect(() => {
    const abortController = new AbortController();

    const fetchStats = async () => {
      if (!storeId) return;

      try {
        setLoading(true);
        setError(null);

        // Get days from timeRange
        const days = timeRange === 'today' ? 1 : timeRange === '7days' ? 7 : 30;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/billing/stores/${storeId}/control-group-stats?days=${days}`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch A/B test stats: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Error fetching A/B test stats:', err);
        setError('Failed to load A/B testing statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    return () => abortController.abort();
  }, [storeId, timeRange]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error || 'No A/B test data available'}</p>
        </div>
      </Card>
    );
  }

  const hasSignificantData = stats.statistical_significance?.is_significant ?? 
    (stats.statistical_significance.control_sample_size >= 100 && 
     stats.statistical_significance.treatment_sample_size >= 100);

  const confidenceLevel = stats.statistical_significance?.confidence_level ?? 
    Math.min(95, Math.round((Math.min(stats.statistical_significance.control_sample_size, stats.statistical_significance.treatment_sample_size) / 100) * 100));

  // Calculate metrics
  const controlConversionRate = stats.control_group.conversion_rate ?? 
    (stats.control_group.visitors > 0 ? (stats.control_group.orders / stats.control_group.visitors) * 100 : 0);
  const treatmentConversionRate = stats.treatment_group.conversion_rate ?? 
    (stats.treatment_group.visitors > 0 ? (stats.treatment_group.orders / stats.treatment_group.visitors) * 100 : 0);
  const conversionLift = controlConversionRate > 0 ? 
    ((treatmentConversionRate - controlConversionRate) / controlConversionRate) * 100 : 0;

  const controlAOV = stats.control_group.aov ?? 
    (stats.control_group.orders > 0 ? stats.control_group.revenue / stats.control_group.orders : 0);
  const treatmentAOV = stats.treatment_group.aov ?? 
    (stats.treatment_group.orders > 0 ? stats.treatment_group.revenue / stats.treatment_group.orders : 0);
  const aovLift = controlAOV > 0 ? ((treatmentAOV - controlAOV) / controlAOV) * 100 : 0;

  const incrementalRevenue = stats.lift.incremental_revenue ?? 
    (stats.treatment_group.revenue - (stats.control_group.revenue * (stats.treatment_group.percentage / stats.control_group.percentage)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-600" />
            A/B Testing Results
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Control group vs AI treatment comparison
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Last {stats.period_days} days</span>
          <Badge 
            variant={hasSignificantData ? 'default' : 'secondary'}
            className="gap-1"
          >
            {hasSignificantData ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Significant
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                Gathering Data
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Confidence Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Statistical Confidence
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-blue-700">
              Confidence: <strong>{confidenceLevel}%</strong>
            </span>
            <span className="text-blue-700">
              Control: <strong>{stats.statistical_significance.control_sample_size.toLocaleString()}</strong>
            </span>
            <span className="text-blue-700">
              Treatment: <strong>{stats.statistical_significance.treatment_sample_size.toLocaleString()}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Hero Lift Card */}
      <Card className="p-6 border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPercent(stats.lift.percentage)}
                </span>
                <span className="text-lg text-gray-500">Revenue Lift</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.lift.interpretation}
              </p>
              {!hasSignificantData && (
                <div className="flex items-center gap-2 mt-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">Low confidence — continue running experiment</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-600">
              {formatCurrency(incrementalRevenue)}
            </div>
            <p className="text-sm text-gray-500">Incremental Revenue</p>
          </div>
        </div>
      </Card>

      {/* Comparison Table */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Performance Comparison
        </h4>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Metric</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Control</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Treatment</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Lift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-white">
                <td className="px-4 py-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  Revenue
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(stats.control_group.revenue)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(stats.treatment_group.revenue)}
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${stats.lift.percentage > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatPercent(stats.lift.percentage)}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  Orders
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {stats.control_group.orders.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {stats.treatment_group.orders.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${stats.treatment_group.orders > stats.control_group.orders ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatPercent(stats.control_group.orders > 0 ? ((stats.treatment_group.orders - stats.control_group.orders) / stats.control_group.orders) * 100 : 0)}
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  Conversion Rate
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {controlConversionRate.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {treatmentConversionRate.toFixed(2)}%
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${conversionLift > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatPercent(conversionLift)}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  Avg Order Value
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(controlAOV)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(treatmentAOV)}
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${aovLift > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatPercent(aovLift)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Model Estimated Revenue */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-900">Model Estimated Revenue</h4>
              <p className="text-sm text-emerald-700">
                Statistically attributed to AI intervention
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-800">
              {formatCurrency(stats.treatment_group.attributed_revenue)}
            </div>
            <Badge variant="outline" className="mt-1 text-emerald-700 border-emerald-300">
              Model Estimated
            </Badge>
          </div>
        </div>
      </Card>

      {/* Methodology */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Methodology
        </h4>
        <p className="text-sm text-gray-600">
          Control group ({stats.control_group.percentage}%) receives no AI messages. 
          Treatment group ({stats.treatment_group.percentage}%) receives AI-powered recovery messages. 
          Lift = (Treatment - Control) / Control.
        </p>
      </div>
    </div>
  );
}
