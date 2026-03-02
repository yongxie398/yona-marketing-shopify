"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSessionToken } from '../AppBridgeProvider';
import {
  Page,
  Card,
  Layout,
  Button,
  Text,
  Badge,
  Banner,
  Spinner
} from '@shopify/polaris';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  revenue_share_percentage: number;
  free_tier_amount: number;
  is_recommended: boolean;
  features: string[];
}

export default function PlanSelectionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const sessionToken = useSessionToken();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('shop');
    setShopDomain(domain);
  }, []);

  useEffect(() => {
    const fetchStoreId = async () => {
      if (!shopDomain || !sessionToken) return;
      
      try {
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStoreId(data.store_id);
        }
      } catch (error) {
        console.error('Error fetching store ID:', error);
      }
    };
    
    fetchStoreId();
  }, [shopDomain, sessionToken]);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!sessionToken) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/billing/plans', {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setPlans(data);
        } else {
          setError('Failed to load plans');
        }
      } catch (err) {
        setError('Error loading plans');
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [sessionToken]);

  const handleSelectPlan = async (planSlug: string) => {
    if (!storeId || !sessionToken) {
      setError('Store information not available');
      return;
    }
    
    setSelecting(planSlug);
    setError(null);
    
    try {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: storeId,
          plan_slug: planSlug,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (shopDomain) {
          const host = new URLSearchParams(window.location.search).get('host') || '';
          window.location.href = `/?shop=${encodeURIComponent(shopDomain)}&host=${encodeURIComponent(host)}`;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to select plan');
      }
    } catch (err) {
      setError('Error selecting plan');
      console.error('Error selecting plan:', err);
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <Page title="Choose Your Plan">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Spinner size="large" />
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="Choose Your Plan">
      <Layout>
        <Layout.Section>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Text variant="headingLg" as="h1">
              We only charge when we recover revenue.
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              No monthly fee. No upfront cost.
            </Text>
          </div>
        </Layout.Section>

        {error && (
          <Layout.Section>
            <Banner status="critical" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {plans.map((plan) => (
              <Card key={plan.slug}>
                <div style={{ 
                  padding: '1.5rem', 
                  width: '280px',
                  position: 'relative',
                  border: plan.is_recommended ? '2px solid #008060' : '1px solid #E1E3E5',
                  borderRadius: '8px',
                }}>
                  {plan.is_recommended && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '-12px', 
                      left: '50%', 
                      transform: 'translateX(-50%)' 
                    }}>
                      <Badge status="success">Recommended for new installs</Badge>
                    </div>
                  )}
                  
                  <div style={{ textAlign: 'center', marginTop: plan.is_recommended ? '1rem' : '0' }}>
                    <Text variant="headingMd" as="h3">{plan.name.toUpperCase()}</Text>
                    
                    <div style={{ margin: '1rem 0' }}>
                      <Text variant="heading2xl" as="p">$0</Text>
                      <Text variant="bodySm" as="span" tone="subdued">to install</Text>
                    </div>
                    
                    <div style={{ 
                      textAlign: 'left', 
                      margin: '1.5rem 0',
                      padding: '1rem',
                      background: '#F6F6F7',
                      borderRadius: '6px'
                    }}>
                      {plan.features.map((feature, index) => (
                        <div key={index} style={{ marginBottom: '0.5rem' }}>
                          <Text variant="bodyMd" as="p">✓ {feature}</Text>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      variant={plan.is_recommended ? "primary" : "secondary"}
                      onClick={() => handleSelectPlan(plan.slug)}
                      loading={selecting === plan.slug}
                      disabled={selecting !== null}
                      fullWidth
                    >
                      {plan.slug === 'starter' ? 'Start Free' : 'Start with Growth'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Layout.Section>

        <Layout.Section>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Text variant="bodySm" as="p" tone="subdued">
              All plans include: AI-powered email campaigns, cart abandonment recovery, 
              browse abandonment recovery, and real-time analytics.
            </Text>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
