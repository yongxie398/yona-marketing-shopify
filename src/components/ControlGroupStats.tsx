'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, FlaskConical, BarChart3 } from 'lucide-react';

interface ControlGroupStatsProps {
  storeId: string;
}

interface ControlStats {
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

export default function ControlGroupStats({ storeId }: ControlGroupStatsProps) {
  const [stats, setStats] = useState<ControlStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/billing/stores/${storeId}/control-group-stats?days=30`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch control group stats: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Error fetching control group stats:', err);
        setError('Failed to load A/B testing statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    return () => abortController.abort();
  }, [storeId]);

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg-hover)', borderRadius: '8px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: '16px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', width: '60%', marginBottom: '8px' }} />
            <div style={{ height: '12px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', width: '40%' }} />
          </div>
        </div>
        <div style={{ height: '80px', backgroundColor: 'var(--bg-hover)', borderRadius: '8px' }} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-600)' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '14px' }}>{error || 'No A/B test data available'}</span>
        </div>
      </div>
    );
  }

  const hasSignificantData = stats.statistical_significance?.is_significant ?? 
    (stats.statistical_significance.control_sample_size >= 100 && 
     stats.statistical_significance.treatment_sample_size >= 100);

  const confidenceLevel = stats.statistical_significance?.confidence_level ?? 
    Math.min(95, Math.round((Math.min(stats.statistical_significance.control_sample_size, stats.statistical_significance.treatment_sample_size) / 100) * 100));

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
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border-default)',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--primary-50)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FlaskConical size={20} style={{ color: 'var(--primary-500)' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              A/B Testing Results
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Last {stats.period_days} days • Confidence: {confidenceLevel}%
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: hasSignificantData ? 'var(--success-50)' : 'var(--warning-50)',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 500,
          color: hasSignificantData ? 'var(--success-600)' : 'var(--warning-600)'
        }}>
          {hasSignificantData ? <CheckCircle2 size={14} /> : <Clock size={14} />}
          {hasSignificantData ? 'Significant' : 'Gathering Data'}
        </div>
      </div>

      {/* Hero Lift Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
        borderLeft: `4px solid ${stats.lift.percentage > 0 ? 'var(--success-500)' : 'var(--danger-500)'}`,
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: stats.lift.percentage > 0 ? 'var(--success-50)' : 'var(--danger-50)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stats.lift.percentage > 0 ? 
                <TrendingUp size={24} style={{ color: 'var(--success-500)' }} /> :
                <TrendingDown size={24} style={{ color: 'var(--danger-500)' }} />
              }
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatPercent(stats.lift.percentage)}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Revenue Lift</span>
              </div>
              {!hasSignificantData && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: 'var(--warning-600)' }}>
                  <AlertCircle size={14} />
                  <span style={{ fontSize: '12px' }}>Low confidence — continue running experiment</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success-600)' }}>
              {formatCurrency(incrementalRevenue)}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Incremental Revenue</div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={16} style={{ color: 'var(--text-muted)' }} />
          Performance Comparison
        </h4>
        
        <div style={{ border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)' }}>Metric</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)' }}>Control</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)' }}>Treatment</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)' }}>Lift</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: 'var(--bg-card)' }}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>Revenue</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-default)', fontWeight: 500 }}>{formatCurrency(stats.control_group.revenue)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-default)', fontWeight: 500 }}>{formatCurrency(stats.treatment_group.revenue)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-default)', fontWeight: 600, color: stats.lift.percentage > 0 ? 'var(--success-600)' : 'var(--danger-600)' }}>{formatPercent(stats.lift.percentage)}</td>
              </tr>
              <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>Orders</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-default)', fontWeight: 500 }}>{stats.control_group.orders.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-default)', fontWeight: 500 }}>{stats.treatment_group.orders.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-default)', fontWeight: 600, color: stats.treatment_group.orders > stats.control_group.orders ? 'var(--success-600)' : 'var(--danger-600)' }}>
                  {formatPercent(stats.control_group.orders > 0 ? ((stats.treatment_group.orders - stats.control_group.orders) / stats.control_group.orders) * 100 : 0)}
                </td>
              </tr>
              <tr style={{ backgroundColor: 'var(--bg-card)' }}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>Conversion Rate</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-default)', fontWeight: 500 }}>{controlConversionRate.toFixed(2)}%</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-default)', fontWeight: 500 }}>{treatmentConversionRate.toFixed(2)}%</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-default)', fontWeight: 600, color: conversionLift > 0 ? 'var(--success-600)' : 'var(--danger-600)' }}>{formatPercent(conversionLift)}</td>
              </tr>
              <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>Avg Order Value</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500 }}>{formatCurrency(controlAOV)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500 }}>{formatCurrency(treatmentAOV)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: aovLift > 0 ? 'var(--success-600)' : 'var(--danger-600)' }}>{formatPercent(aovLift)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistical Summary */}
      <div style={{
        backgroundColor: 'var(--bg-hover)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statistical Summary</h4>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Control: </span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{stats.statistical_significance.control_sample_size.toLocaleString()} samples</span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Treatment: </span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{stats.statistical_significance.treatment_sample_size.toLocaleString()} samples</span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Confidence: </span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{confidenceLevel}%</span>
          </div>
          {stats.statistical_significance.p_value > 0 && (
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>p-value: </span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{stats.statistical_significance.p_value.toFixed(3)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Model Estimated Revenue */}
      <div style={{
        backgroundColor: 'var(--success-50)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid var(--success-100)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--success-700)' }}>Model Estimated Revenue</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--success-600)' }}>Statistically attributed to AI intervention</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success-700)' }}>{formatCurrency(stats.treatment_group.attributed_revenue)}</div>
            <div style={{
              display: 'inline-block',
              marginTop: '4px',
              padding: '4px 10px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--success-600)',
              border: '1px solid var(--success-200)'
            }}>
              Model Estimated
            </div>
          </div>
        </div>
      </div>

      {/* Sample Size Warning */}
      {!hasSignificantData && (
        <div style={{
          backgroundColor: 'var(--warning-50)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid var(--warning-100)'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <AlertCircle size={18} style={{ color: 'var(--warning-600)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 500, color: 'var(--warning-700)' }}>
                Building statistical significance
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--warning-600)' }}>
                {stats.statistical_significance.note}<br />
                Current samples: Control ({stats.statistical_significance.control_sample_size.toLocaleString()}), 
                Treatment ({stats.statistical_significance.treatment_sample_size.toLocaleString()})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Methodology */}
      <div style={{ padding: '12px 0' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Methodology</h4>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          Control group ({stats.control_group.percentage}%) receives no AI messages. 
          Treatment group ({stats.treatment_group.percentage}%) receives AI-powered recovery messages. 
          Lift = (Treatment - Control) / Control.
        </p>
      </div>
    </div>
  );
}
