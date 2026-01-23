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
  const [loading, setLoading] = useState<boolean>(true);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const sessionToken = useSessionToken();

  // Extract shop domain from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('shop');
    setShopDomain(domain);
  }, []);

  useEffect(() => {
    // Load settings from API with authentication
    const loadSettings = async () => {
      try {
        setLoading(true);
        if (!shopDomain || !sessionToken) {
          console.error('Missing shop domain or session token');
          return;
        }
        
        const response = await fetch(`/api/settings?shop=${encodeURIComponent(shopDomain)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
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
      }
    };

    if (shopDomain && sessionToken) {
      loadSettings();
    }
  }, [shopDomain, sessionToken]);

  const handleSaveSettings = async () => {
    if (!shopDomain || !sessionToken) {
      alert('Authentication required to save settings');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/settings?shop=${encodeURIComponent(shopDomain)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
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
      setLoading(false);
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

  return (
    <Page
      title="AI Revenue Agent Settings"
      primaryAction={
        <Button onClick={handleSaveSettings} loading={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      }
    >
      <div style={{ padding: '1rem', marginBottom: '1rem' }}>
        <a 
          href={shopDomain ? `/?shop=${encodeURIComponent(shopDomain)}` : '/'} 
          style={{ color: '#008060', textDecoration: 'none' }}
        >
          ← Back to Home
        </a>
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