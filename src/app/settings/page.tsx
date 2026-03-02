"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSessionToken } from '../AppBridgeProvider';
import {
  Page,
  Card,
  Layout,
  Button,
  FormLayout,
  Select,
  Checkbox,
  Text,
  TextContainer
} from '@shopify/polaris';

export default function SettingsPage() {
  const [brandVoice, setBrandVoice] = useState<string>('friendly');
  const [frequencyCaps, setFrequencyCaps] = useState({
    daily: 1,
    weekly: 3
  });
  const [paused, setPaused] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  const sessionToken = useSessionToken();

  // Debug log for session token
  useEffect(() => {
    console.log('Settings page - sessionToken:', sessionToken ? 'present' : 'null');
  }, [sessionToken]);

  // Extract shop domain from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('shop');
    console.log('Settings page - shop domain:', domain);
    setShopDomain(domain);
  }, []);

  useEffect(() => {
    // Load settings from API with authentication
    const loadSettings = async () => {
      try {
        setLoading(true);
        if (!shopDomain) {
          console.log('No shop domain found');
          return;
        }

        const response = await fetch(`/api/settings?shop=${encodeURIComponent(shopDomain)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBrandVoice(data.brand_voice);
          setFrequencyCaps(data.frequency_caps || { daily: 1, weekly: 3 }); // Fallback to defaults if null/undefined
          setPaused(data.paused);
        } else if (response.status === 404) {
          console.log('No existing settings found, using defaults');
          // Use default values if no settings exist yet
          setBrandVoice('friendly');
          setFrequencyCaps({ daily: 1, weekly: 3 });
          setPaused(false);
        } else {
          const errorData = await response.json();
          console.error('Failed to load settings:', errorData.error);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Use default values in case of error
        setBrandVoice('friendly');
        setFrequencyCaps({ daily: 1, weekly: 3 });
        setPaused(false);
      } finally {
        setLoading(false);
        setInitialLoadComplete(true); // Mark initial load as complete
      }
    };

    if (shopDomain) {
      loadSettings();
    }
  }, [shopDomain]);

  // Separate effect to handle loading state when dependencies change
  useEffect(() => {
    if (shopDomain) {
      // We have what we need, initial load is complete
      setInitialLoadComplete(true);
    }
  }, [shopDomain]);

  const handleSaveSettings = async () => {
    if (!shopDomain) {
      alert('Shop domain is required');
      return;
    }

    setSaving(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if session token is available
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
      
      const response = await fetch(`/api/settings?shop=${encodeURIComponent(shopDomain)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          brand_voice: brandVoice,
          frequency_caps: frequencyCaps,
          paused,
        }),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error saving settings: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBrandVoiceChange = (value: string) => {
    setBrandVoice(value);
  };

  const handleDailyCapChange = (value: string) => {
    setFrequencyCaps(prev => ({ ...prev, daily: parseInt(value) || 1 }));
  };

  const handleWeeklyCapChange = (value: string) => {
    setFrequencyCaps(prev => ({ ...prev, weekly: parseInt(value) || 3 }));
  };

  const handleBackToHome = () => {
    console.log('handleBackToHome called', { shopDomain });
    
    if (shopDomain) {
      const urlParams = new URLSearchParams(window.location.search);
      const host = urlParams.get('host') || '';
      const idToken = urlParams.get('id_token');
      const session = urlParams.get('session');
      
      let homeUrl = `/?shop=${encodeURIComponent(shopDomain)}&host=${encodeURIComponent(host)}`;
      if (idToken) {
        homeUrl += `&id_token=${encodeURIComponent(idToken)}`;
      } else if (session) {
        homeUrl += `&session=${encodeURIComponent(session)}`;
      }
      
      console.log('Navigating to:', homeUrl);
      window.location.href = homeUrl;
    } else {
      console.log('No shop domain available');
    }
  };

  console.log('Settings page render state:', {
    shopDomain,
    sessionToken: sessionToken ? 'present' : 'null',
    saving,
    buttonDisabled: !shopDomain || saving
  });

  return (
    <Page
      title="AI Revenue Agent Settings"
      primaryAction={
        <Button 
          onClick={handleSaveSettings} 
          loading={saving}
          disabled={!shopDomain || saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      }
    >
      <div style={{ padding: '1rem', marginBottom: '1rem' }}>
        <Button 
          onClick={handleBackToHome}
          variant="plain"
        >
          ← Back to Dashboard
        </Button>
      </div>
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
              General Settings
            </div>
            <div style={{ padding: '1rem' }}>
              <FormLayout>
                <Select
                  label="Brand Voice"
                  options={[
                    { label: 'Friendly', value: 'friendly' },
                    { label: 'Professional', value: 'professional' },
                    { label: 'Playful', value: 'playful' },
                    { label: 'Minimal', value: 'minimal' },
                  ]}
                  value={brandVoice}
                  onChange={handleBrandVoiceChange}
                  helpText="Select the tone of voice for AI-generated messages"
                />

                <FormLayout.Group>
                  <div>
                    <label>Daily Frequency Cap</label>
                    <input
                      type="number"
                      value={frequencyCaps.daily}
                      onChange={(e) => handleDailyCapChange(e.target.value)}
                      min="1"
                      max="10"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                      Maximum messages per customer per day
                    </p>
                  </div>

                  <div>
                    <label>Weekly Frequency Cap</label>
                    <input
                      type="number"
                      value={frequencyCaps.weekly}
                      onChange={(e) => handleWeeklyCapChange(e.target.value)}
                      min="1"
                      max="20"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                      Maximum messages per customer per week
                    </p>
                  </div>
                </FormLayout.Group>

                <Checkbox
                  label="Pause AI Agent"
                  checked={paused}
                  onChange={setPaused}
                  helpText="Temporarily stop all AI-generated messages"
                />
              </FormLayout>
            </div>
          </Card>

          <div style={{ marginTop: '1rem' }}>
            <Card>
              <div style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                Billing & Subscription
              </div>
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <TextContainer>
                  <div style={{ marginBottom: '1rem' }}>
                    View your current plan, recovered revenue, and billing details.
                  </div>
                  <Button
                    onClick={() => {
                      const urlParams = new URLSearchParams(window.location.search);
                      const host = urlParams.get('host') || '';
                      const idToken = urlParams.get('id_token');
                      const session = urlParams.get('session');
                      
                      let billingUrl = `/billing?shop=${encodeURIComponent(shopDomain || '')}&host=${encodeURIComponent(host)}`;
                      if (idToken) {
                        billingUrl += `&id_token=${encodeURIComponent(idToken)}`;
                      } else if (session) {
                        billingUrl += `&session=${encodeURIComponent(session)}`;
                      }
                      
                      window.location.href = billingUrl;
                    }}
                  >
                    View Billing Dashboard
                  </Button>
                </TextContainer>
              </div>
            </Card>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Card>
              <div style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                Campaign Configuration
              </div>
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <TextContainer>
                  <div>
                    Configure which campaigns are active for your store. The AI Revenue Agent will automatically 
                    trigger appropriate campaigns based on customer behavior.
                  </div>
                </TextContainer>
              </div>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
