'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Page,
  Card,
  Layout,
  Button,
  Text,
  Badge,
  Banner,
  Box,
  Spinner
} from '@shopify/polaris';

interface SetupStatus {
  dataSynced: boolean;
  brandVoiceSet: boolean;
  aiActivated: boolean;
}

export default function AILiveConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    dataSynced: false,
    brandVoiceSet: false,
    aiActivated: false
  });

  useEffect(() => {
    const shop = searchParams.get('shop');
    setShopDomain(shop);
  }, [searchParams]);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      if (!shopDomain) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`);
        
        if (response.ok) {
          const data = await response.json();
          setStoreId(data.storeId);
          
          // Check setup status
          setSetupStatus({
            dataSynced: true, // Assume synced if we got here
            brandVoiceSet: true, // Assume set if we got here
            aiActivated: data.aiEnabled || false
          });
        } else {
          setError('Failed to load store information');
        }
      } catch (err) {
        console.error('Error fetching store info:', err);
        setError('Failed to load store information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStoreInfo();
  }, [shopDomain]);

  const handleActivateAI = async () => {
    if (!storeId) {
      setError('Store not found');
      return;
    }

    setActivating(true);
    setError(null);

    try {
      // Activate AI for the store
      const response = await fetch(`/api/settings?shop=${encodeURIComponent(shopDomain || '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: storeId,
          paused: false,
          ai_enabled: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to activate AI');
      }

      setSetupStatus(prev => ({ ...prev, aiActivated: true }));
      
      // Wait a moment to show the success state
      setTimeout(() => {
        // Navigate to dashboard
        const host = searchParams.get('host');
        let redirectUrl = `/?shop=${encodeURIComponent(shopDomain || '')}`;
        if (host) {
          redirectUrl += `&host=${encodeURIComponent(host)}`;
        }
        
        router.push(redirectUrl);
      }, 2000);
    } catch (err) {
      console.error('Error activating AI:', err);
      setError('Failed to activate AI. Please try again.');
    } finally {
      setActivating(false);
    }
  };

  const handleGoToDashboard = () => {
    const host = searchParams.get('host');
    let redirectUrl = `/?shop=${encodeURIComponent(shopDomain || '')}`;
    if (host) {
      redirectUrl += `&host=${encodeURIComponent(host)}`;
    }
    router.push(redirectUrl);
  };

  if (loading) {
    return (
      <Page>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Spinner size="large" />
        </div>
      </Page>
    );
  }

  const allComplete = setupStatus.dataSynced && setupStatus.brandVoiceSet && setupStatus.aiActivated;

  return (
    <Page
      title={allComplete ? "🎉 Your AI is Live!" : "Ready to Activate?"}
      subtitle={allComplete 
        ? "Your AI Revenue Agent is now monitoring your store"
        : "Review your setup before activating the AI"
      }
    >
      <Layout>
        <Layout.Section>
          {error && (
            <Banner tone="critical" onDismiss={() => setError(null)}>
              <p>{error}</p>
            </Banner>
          )}

          {allComplete && (
            <Banner tone="success">
              <p><strong>Success!</strong> Your AI Revenue Agent is now active and monitoring your store.</p>
            </Banner>
          )}

          <Box paddingBlockStart="400">
            <Card>
              <div style={{ padding: '20px' }}>
                <Text variant="headingMd" as="h2">
                  {allComplete ? 'Setup Complete!' : 'Step 5 of 5: AI Activation'}
                </Text>
                
                <Box paddingBlockStart="400">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Data Sync Status */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: setupStatus.dataSynced ? '#f0fdf4' : '#f6f6f7',
                      borderRadius: '8px',
                      border: `1px solid ${setupStatus.dataSynced ? '#86efac' : '#e1e3e5'}`
                    }}>
                      <div style={{ fontSize: '24px' }}>
                        {setupStatus.dataSynced ? '✅' : '⏳'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text variant="headingSm" as="h3">
                          Data Synced
                        </Text>
                        <Text tone="subdued" as="p">
                          Your products, customers, and orders are synced
                        </Text>
                      </div>
                      {setupStatus.dataSynced && <Badge tone="success">Complete</Badge>}
                    </div>

                    {/* Brand Voice Status */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: setupStatus.brandVoiceSet ? '#f0fdf4' : '#f6f6f7',
                      borderRadius: '8px',
                      border: `1px solid ${setupStatus.brandVoiceSet ? '#86efac' : '#e1e3e5'}`
                    }}>
                      <div style={{ fontSize: '24px' }}>
                        {setupStatus.brandVoiceSet ? '✅' : '⏳'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text variant="headingSm" as="h3">
                          Brand Voice Set
                        </Text>
                        <Text tone="subdued" as="p">
                          Your AI's personality is configured
                        </Text>
                      </div>
                      {setupStatus.brandVoiceSet && <Badge tone="success">Complete</Badge>}
                    </div>

                    {/* AI Activation Status */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: setupStatus.aiActivated ? '#f0fdf4' : '#eff6ff',
                      borderRadius: '8px',
                      border: `1px solid ${setupStatus.aiActivated ? '#86efac' : '#93c5fd'}`
                    }}>
                      <div style={{ fontSize: '24px' }}>
                        {setupStatus.aiActivated ? '✅' : '🤖'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text variant="headingSm" as="h3">
                          AI Activated
                        </Text>
                        <Text tone="subdued" as="p">
                          {setupStatus.aiActivated 
                            ? 'Your AI is monitoring and sending messages'
                            : 'Ready to activate your AI Revenue Agent'
                          }
                        </Text>
                      </div>
                      {setupStatus.aiActivated ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="info">Ready</Badge>
                      )}
                    </div>
                  </div>
                </Box>
              </div>
            </Card>
          </Box>

          {!allComplete && (
            <Box paddingBlockStart="400">
              <Card>
                <div style={{ padding: '20px' }}>
                  <Text variant="headingMd" as="h2" style={{ marginBottom: '16px' }}>
                    What Happens Next?
                  </Text>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>👀</div>
                      <div>
                        <Text variant="headingSm" as="h3">AI Starts Monitoring</Text>
                        <Text tone="subdued" as="p">
                          Your AI will watch for abandoned carts, browse abandonment, and purchase behavior
                        </Text>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>📧</div>
                      <div>
                        <Text variant="headingSm" as="h3">Automatic Messages</Text>
                        <Text tone="subdued" as="p">
                          Personalized emails sent at optimal times based on customer behavior
                        </Text>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>💰</div>
                      <div>
                        <Text variant="headingSm" as="h3">Revenue Recovery</Text>
                        <Text tone="subdued" as="p">
                          Expected first recovered sale within 24-48 hours
                        </Text>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>📊</div>
                      <div>
                        <Text variant="headingSm" as="h3">Track Results</Text>
                        <Text tone="subdued" as="p">
                          View real-time activity and revenue attribution on your dashboard
                        </Text>
                      </div>
                    </div>
                  </div>

                  <Box paddingBlockStart="400">
                    <Banner tone="info">
                      <p>
                        <strong>Expected first action:</strong> Within 24 hours
                        <br />
                        <strong>You'll be notified:</strong> When your AI recovers its first sale!
                      </p>
                    </Banner>
                  </Box>
                </div>
              </Card>
            </Box>
          )}

          <Box paddingBlockStart="400" paddingBlockEnd="400">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={() => router.back()}
                variant="secondary"
                disabled={activating || allComplete}
              >
                Back
              </Button>
              
              {allComplete ? (
                <Button
                  variant="primary"
                  onClick={handleGoToDashboard}
                  size="large"
                >
                  Go to Dashboard →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleActivateAI}
                  loading={activating}
                  disabled={!storeId}
                  size="large"
                >
                  🚀 Activate My AI
                </Button>
              )}
            </div>
          </Box>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <div style={{ padding: '16px' }}>
              <Text variant="headingSm" as="h3">
                Onboarding Progress
              </Text>
              <Box paddingBlockStart="200">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge tone="success">✓</Badge>
                    <Text as="span">Install App</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge tone="success">✓</Badge>
                    <Text as="span">Connect Store</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge tone="success">✓</Badge>
                    <Text as="span">Sync Data</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge tone="success">✓</Badge>
                    <Text as="span">Brand Voice</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge tone={allComplete ? "success" : "info"}>{allComplete ? '✓' : '→'}</Badge>
                    <Text as="span" fontWeight={!allComplete ? "semibold" : "regular"}>AI Activation</Text>
                  </div>
                </div>
              </Box>
            </div>
          </Card>

          <Box paddingBlockStart="400">
            <Card>
              <div style={{ padding: '16px' }}>
                <Text variant="headingSm" as="h3">
                  💡 Pro Tip
                </Text>
                <Box paddingBlockStart="200">
                  <Text tone="subdued" as="p">
                    Your AI starts with conservative messaging. You can adjust frequency 
                    caps and pause anytime from the Settings page.
                  </Text>
                </Box>
              </div>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
