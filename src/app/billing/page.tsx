"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import {
  Page,
  Card,
  Layout,
  Button,
  Text,
  Banner,
  Modal,
  Box,
  Divider,
  Spinner
} from '@shopify/polaris';

interface BillingDashboard {
  plan: {
    name: string;
    type: string;
    price_monthly: number;
    revenue_share_percentage: number;
    first_month_free: boolean;
  };
  billing_period: {
    first_month_free_active: boolean;
    first_month_days_remaining: number;
  };
  metrics: {
    recovered_revenue: number;
    billable_revenue: number;
    estimated_fee: number;
    base_monthly_fee: number;
  };
  show_upgrade_banner: boolean;
}

export default function BillingPage() {
  const [dashboard, setDashboard] = useState<BillingDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAttributionModal, setShowAttributionModal] = useState<boolean>(false);
  const [upgrading, setUpgrading] = useState<boolean>(false);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  const getShopDomain = () => {
    if (shopDomain) return shopDomain;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('shop');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('shop');
    setShopDomain(domain);
  }, []);

  useEffect(() => {
    const fetchStoreId = async () => {
      const currentShop = getShopDomain();
      
      if (!currentShop) {
        setLoading(false);
        setError('No shop domain provided');
        return;
      }
      
      try {
        console.log('Billing: Fetching store info for:', currentShop);
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(currentShop)}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Billing: Store info received:', data);
          setStoreId(data.storeId);
        } else {
          console.error('Billing: Failed to fetch store info:', response.status);
          setError('Failed to fetch store information');
          setLoading(false);
        }
      } catch (error) {
        console.error('Billing: Error fetching store ID:', error);
        setError('Error fetching store information');
        setLoading(false);
      }
    };
    
    fetchStoreId();
  }, [shopDomain]);

  useEffect(() => {
    const fetchBillingDashboard = async () => {
      if (!storeId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/billing/dashboard?store_id=${storeId}`);
        
        if (response.ok) {
          const data = await response.json();
          setDashboard(data);
          setError(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || 'Failed to load billing dashboard');
        }
      } catch (error) {
        console.error('Error fetching billing dashboard:', error);
        setError('Failed to load billing dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillingDashboard();
  }, [storeId]);

  const handleUpgrade = async () => {
    if (!storeId) return;
    
    setUpgrading(true);
    try {
      const response = await fetch(`/api/billing/upgrade?store_id=${storeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const handleBackToSettings = () => {
    if (shopDomain) {
      const host = new URLSearchParams(window.location.search).get('host') || '';
      window.location.href = `/settings?shop=${encodeURIComponent(shopDomain)}&host=${encodeURIComponent(host)}`;
    }
  };

  const handleBackToDashboard = () => {
    if (shopDomain) {
      const host = new URLSearchParams(window.location.search).get('host') || '';
      window.location.href = `/?shop=${encodeURIComponent(shopDomain)}&host=${encodeURIComponent(host)}`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Page title="Billing">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Spinner size="large" />
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Billing">
        <Layout>
          <Layout.Section>
            <Banner title="Error" status="critical">
              <p>{error}</p>
            </Banner>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <div style={{ padding: '1rem' }}>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="Billing">
      <div style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <Button onClick={handleBackToDashboard} variant="plain">
          ← Back to Dashboard
        </Button>
        <Button onClick={handleBackToSettings} variant="plain">
          ← Back to Settings
        </Button>
      </div>

      <Layout>
        {dashboard?.show_upgrade_banner && (
          <Layout.Section>
            <Banner
              title={`You've recovered ${formatCurrency(dashboard.metrics.recovered_revenue)} this month.`}
              status="info"
              action={{
                content: 'Upgrade to Growth',
                onAction: handleUpgrade,
                loading: upgrading,
              }}
            >
              <p>Upgrade to Growth and pay less per dollar recovered.</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <Text variant="headingMd" as="h2">Current Plan</Text>
              <Divider />
              <Box paddingBlockStart="4">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <Text variant="bodyMd" as="span" tone="subdued">Plan</Text>
                  <Text variant="bodyMd" as="span" fontWeight="semibold">{dashboard?.plan.name}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <Text variant="bodyMd" as="span" tone="subdued">Monthly Fee</Text>
                  <Text variant="bodyMd" as="span" fontWeight="semibold">
                    {dashboard?.plan.price_monthly === 0 ? 'Free' : formatCurrency(dashboard?.plan.price_monthly || 0)}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <Text variant="bodyMd" as="span" tone="subdued">Revenue Share</Text>
                  <Text variant="bodyMd" as="span" fontWeight="semibold">{dashboard?.plan.revenue_share_percentage}%</Text>
                </div>
                {dashboard?.billing_period.first_month_free_active && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.75rem',
                    padding: '0.5rem',
                    backgroundColor: '#e3f1df',
                    borderRadius: '4px'
                  }}>
                    <Text variant="bodyMd" as="span" tone="success" fontWeight="semibold">
                      🎉 First Month Free
                    </Text>
                    <Text variant="bodyMd" as="span" tone="success">
                      {dashboard?.billing_period.first_month_days_remaining} days remaining
                    </Text>
                  </div>
                )}
              </Box>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <Text variant="headingMd" as="h2">This Month</Text>
              <Divider />
              <Box paddingBlockStart="4">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <Text variant="bodyMd" as="span" tone="subdued">Recovered Revenue</Text>
                  <Text variant="bodyMd" as="span" fontWeight="semibold">
                    {formatCurrency(dashboard?.metrics.recovered_revenue || 0)}
                  </Text>
                </div>
                {dashboard?.metrics.base_monthly_fee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <Text variant="bodyMd" as="span" tone="subdued">Base Monthly Fee</Text>
                    <Text variant="bodyMd" as="span" fontWeight="semibold">
                      {formatCurrency(dashboard?.metrics.base_monthly_fee)}
                    </Text>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <Text variant="bodyMd" as="span" tone="subdued">Revenue Share Fee</Text>
                  <Text variant="bodyMd" as="span" fontWeight="semibold">
                    {dashboard?.billing_period.first_month_free_active ? (
                      <span style={{ color: '#5c6ac4' }}>FREE (First Month)</span>
                    ) : (
                      formatCurrency(dashboard?.metrics.estimated_fee || 0)
                    )}
                  </Text>
                </div>
                <Divider />
                <Box paddingBlockStart="4">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text variant="bodyMd" as="span" fontWeight="bold">Total Estimated</Text>
                    <Text variant="bodyMd" as="span" fontWeight="bold">
                      {dashboard?.billing_period.first_month_free_active ? (
                        <span style={{ color: '#5c6ac4' }}>FREE</span>
                      ) : (
                        formatCurrency((dashboard?.metrics.estimated_fee || 0) + (dashboard?.metrics.base_monthly_fee || 0))
                      )}
                    </Text>
                  </div>
                </Box>
              </Box>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <Button
                onClick={() => setShowAttributionModal(true)}
                variant="plain"
              >
                How we calculate revenue →
              </Button>
            </div>
          </Card>
        </Layout.Section>
      </Layout>

      {showAttributionModal && (
        <Modal
          open={showAttributionModal}
          onClose={() => setShowAttributionModal(false)}
          title="How We Calculate Revenue"
        >
          <Modal.Section>
            <div style={{ padding: '1rem' }}>
              <Text variant="bodyMd" as="p">
                Recovered revenue includes orders that:
              </Text>
              <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Text variant="bodyMd" as="span">• Clicked an AI email</Text>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Text variant="bodyMd" as="span">• Purchased within 7 days</Text>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Text variant="bodyMd" as="span">• Where the AI email was the last marketing touch</Text>
                </li>
              </ul>
            </div>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}
