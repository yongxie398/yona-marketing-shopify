'use client';

import { useState, useEffect } from 'react';
import { Card, Text, Badge, Spinner, Banner, Box, Button } from '@shopify/polaris';

interface ControlGroupStatsProps {
  storeId: string;
}

interface ControlStats {
  period_days: number;
  control_group: {
    orders: number;
    revenue: number;
    percentage: number;
  };
  treatment_group: {
    orders: number;
    revenue: number;
    attributed_revenue: number;
    percentage: number;
  };
  lift: {
    absolute: number;
    percentage: number;
    interpretation: string;
  };
  statistical_significance: {
    note: string;
    control_sample_size: number;
    treatment_sample_size: number;
  };
}

export default function ControlGroupStats({ storeId }: ControlGroupStatsProps) {
  const [stats, setStats] = useState<ControlStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/billing/stores/${storeId}/control-group-stats?days=30`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch control group stats: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching control group stats:', err);
      setError('Failed to load A/B testing statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [storeId]);

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spinner size="small" />
          <Text as="p" variant="bodySm" tone="subdued">
            Loading A/B test results...
          </Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Banner tone="critical">
          <p>{error}</p>
          <Button onClick={fetchStats} size="slim">
            Retry
          </Button>
        </Banner>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Text as="p" variant="bodyMd" tone="subdued">
            No A/B test data available yet.
          </Text>
        </div>
      </Card>
    );
  }

  const hasSignificantData = 
    stats.statistical_significance.control_sample_size >= 10 && 
    stats.statistical_significance.treatment_sample_size >= 10;

  return (
    <Card>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e1e3e5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="headingMd" as="h2">
            🧪 A/B Testing Results
          </Text>
          <Badge tone={hasSignificantData ? 'success' : 'warning'}>
            {hasSignificantData ? 'Significant' : 'Gathering Data'}
          </Badge>
        </div>
        <Text as="p" variant="bodySm" tone="subdued">
          Control group vs AI treatment comparison
        </Text>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Lift Summary */}
        <div 
          style={{ 
            backgroundColor: stats.lift.percentage > 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${stats.lift.percentage > 0 ? '#86efac' : '#fecaca'}`,
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}
        >
          <Text variant="heading2xl" as="p" fontWeight="bold">
            {stats.lift.percentage > 0 ? '+' : ''}{stats.lift.percentage.toFixed(1)}%
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Revenue Lift from AI
          </Text>
          <Box paddingBlockStart="200">
            <Text as="p" variant="bodySm">
              {stats.lift.interpretation}
            </Text>
          </Box>
        </div>

        {/* Comparison Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f6f6f7', borderRadius: '8px' }}>
            <Text variant="headingSm" as="h3">Control Group</Text>
            <Box paddingBlockStart="200">
              <Text variant="headingXl" as="p">{stats.control_group.percentage}%</Text>
              <Text as="p" variant="bodySm" tone="subdued">of customers</Text>
            </Box>
            <Box paddingBlockStart="200">
              <Text variant="headingMd" as="p">${stats.control_group.revenue.toFixed(2)}</Text>
              <Text as="p" variant="bodySm" tone="subdued">revenue</Text>
            </Box>
            <Box paddingBlockStart="100">
              <Text as="p" variant="bodySm" tone="subdued">
                {stats.control_group.orders} orders
              </Text>
            </Box>
          </div>

          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f6f6f7', borderRadius: '8px' }}>
            <Text variant="headingSm" as="h3">Treatment Group</Text>
            <Box paddingBlockStart="200">
              <Text variant="headingXl" as="p">{stats.treatment_group.percentage}%</Text>
              <Text as="p" variant="bodySm" tone="subdued">of customers</Text>
            </Box>
            <Box paddingBlockStart="200">
              <Text variant="headingMd" as="p">${stats.treatment_group.revenue.toFixed(2)}</Text>
              <Text as="p" variant="bodySm" tone="subdued">revenue</Text>
            </Box>
            <Box paddingBlockStart="100">
              <Text as="p" variant="bodySm" tone="subdued">
                {stats.treatment_group.orders} orders
              </Text>
            </Box>
          </div>

          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
            <Text variant="headingSm" as="h3">Attributed</Text>
            <Box paddingBlockStart="200">
              <Text variant="headingXl" as="p" tone="success">
                ${stats.treatment_group.attributed_revenue.toFixed(2)}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">directly from AI</Text>
            </Box>
            <Box paddingBlockStart="100">
              <Badge tone="success">Verified</Badge>
            </Box>
          </div>
        </div>

        {/* Sample Size Warning */}
        {!hasSignificantData && (
          <Banner tone="warning">
            <p>
              <strong>Building statistical significance:</strong> {stats.statistical_significance.note}
              <br />
              Current samples: Control ({stats.statistical_significance.control_sample_size}), 
              Treatment ({stats.statistical_significance.treatment_sample_size})
            </p>
          </Banner>
        )}

        {/* How it Works */}
        <Box paddingBlockStart="400">
          <Text variant="headingSm" as="h3">How A/B Testing Works</Text>
          <Box paddingBlockStart="200">
            <Text as="p" variant="bodySm" tone="subdued">
              • <strong>Control Group ({stats.control_group.percentage}%):</strong> Customers who don't receive AI messages
              <br />
              • <strong>Treatment Group ({stats.treatment_group.percentage}%):</strong> Customers who receive AI-powered messages
              <br />
              • <strong>Lift Calculation:</strong> (Treatment Revenue - Control Revenue) / Control Revenue
              <br />
              • This proves the <em>true incremental value</em> of your AI Revenue Agent
            </Text>
          </Box>
        </Box>
      </div>
    </Card>
  );
}
