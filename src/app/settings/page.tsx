"use client";

import { useState, useEffect } from 'react';
import { Card, Page, Layout, TextContainer, Button, Select, Checkbox, FormLayout, TextField } from '@shopify/polaris';

export default function SettingsPage() {
  const [brandVoice, setBrandVoice] = useState('friendly');
  const [frequencyCaps, setFrequencyCaps] = useState({
    daily: 1,
    weekly: 3
  });
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      try {
        setLoading(true);
        // Extract shop domain from URL
        const urlParams = new URLSearchParams(window.location.search);
        const shopDomain = urlParams.get('shop');
        
        if (!shopDomain) {
          console.error('Shop domain not found in URL');
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
          setFrequencyCaps(data.frequency_caps);
          setPaused(data.paused);
        } else {
          console.error('Failed to load settings:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Extract shop domain from URL
      const urlParams = new URLSearchParams(window.location.search);
      const shopDomain = urlParams.get('shop');
      
      if (!shopDomain) {
        alert('Shop domain not found in URL');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/settings?shop=${encodeURIComponent(shopDomain)}`, {
        method: 'POST',
        headers: {
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
        alert(`Error saving settings: ${errorData.message || response.statusText}`);
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
      backAction={{ content: 'Back', url: '/' }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <FormLayout>
              <FormLayout.Group>
                <Select
                  label="Brand Voice"
                  options={[
                    { label: 'Friendly', value: 'friendly' },
                    { label: 'Professional', value: 'professional' },
                    { label: 'Playful', value: 'playful' },
                    { label: 'Minimal', value: 'minimal' },
                  ]}
                  onChange={handleBrandVoiceChange}
                  value={brandVoice}
                />
                
                <TextField
                  label="Daily Frequency Cap"
                  type="number"
                  min="1"
                  max="10"
                  value={frequencyCaps.daily.toString()}
                  onChange={handleDailyCapChange}
                  autoComplete="off"
                  helpText="Maximum messages per customer per day"
                />
              </FormLayout.Group>
              
              <TextField
                label="Weekly Frequency Cap"
                type="number"
                min="1"
                max="20"
                value={frequencyCaps.weekly.toString()}
                onChange={handleWeeklyCapChange}
                autoComplete="off"
                helpText="Maximum messages per customer per week"
              />
              
              <Checkbox
                label="Pause AI Agent"
                checked={paused}
                onChange={setPaused}
                helpText="Temporarily stop all AI-generated messages"
              />
            </FormLayout>
            
            <br />
            <Button 
              variant="primary" 
              onClick={handleSaveSettings} 
              loading={loading}
            >
              Save Settings
            </Button>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <div style={{ padding: '1rem' }}>
              <h3>Campaign Configuration</h3>
              <p>
                Configure which campaigns are active for your store. The AI Revenue Agent will automatically 
                trigger appropriate campaigns based on customer behavior.
              </p>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}