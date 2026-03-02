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
  Select,
  Box,
  Divider
} from '@shopify/polaris';

type BrandVoice = 'friendly' | 'professional' | 'playful' | 'minimal';

interface VoiceOption {
  value: BrandVoice;
  label: string;
  description: string;
  icon: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Warm, conversational, and approachable',
    icon: '👋'
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Polished, authoritative, and trustworthy',
    icon: '💼'
  },
  {
    value: 'playful',
    label: 'Playful',
    description: 'Fun, energetic, and memorable',
    icon: '🎉'
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Clean, direct, and no-nonsense',
    icon: '✨'
  }
];

const SAMPLE_MESSAGES: Record<BrandVoice, { subject: string; body: string }> = {
  friendly: {
    subject: 'You left something behind, Sarah! 👋',
    body: `Hi Sarah,

I noticed you were checking out some great items earlier but didn't complete your order. No worries — it happens!

Your cart is still waiting for you:
• Premium Yoga Mat ($45)
• Resistance Bands Set ($25)

Come back whenever you're ready. We're here to help if you have any questions!

Cheers,
The Team`
  },
  professional: {
    subject: 'Complete Your Order - Items Reserved',
    body: `Dear Valued Customer,

We noticed you have items waiting in your shopping cart:

Premium Yoga Mat - $45
Resistance Bands Set - $25

These items are reserved for you. Complete your purchase to secure your selection.

[Complete Order]

Best regards,
Customer Service Team`
  },
  playful: {
    subject: 'Your cart is having FOMO 😱',
    body: `Hey there!

Your Premium Yoga Mat and Resistance Bands are feeling a little lonely... They really want to come home with you! 🏠

Don't leave them hanging — they've been practicing their best poses just for you! 🧘‍♀️

[Rescue Your Cart]

Stay awesome!
✨ The Fun Fitness Crew`
  },
  minimal: {
    subject: 'Your cart: 2 items',
    body: `Your shopping cart has been saved.

Items:
- Premium Yoga Mat ($45)
- Resistance Bands Set ($25)

[Complete Purchase]

Questions? Reply to this email.`
  }
};

export default function BrandVoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedVoice, setSelectedVoice] = useState<BrandVoice>('friendly');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const shop = searchParams.get('shop');
    setShopDomain(shop);
  }, [searchParams]);

  useEffect(() => {
    const fetchStoreId = async () => {
      if (!shopDomain) return;
      
      try {
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`);
        if (response.ok) {
          const data = await response.json();
          setStoreId(data.storeId);
        }
      } catch (err) {
        console.error('Error fetching store ID:', err);
      }
    };
    
    fetchStoreId();
  }, [shopDomain]);

  const handleVoiceSelect = (voice: BrandVoice) => {
    setSelectedVoice(voice);
  };

  const handleContinue = async () => {
    if (!storeId) {
      setError('Store not found. Please try again.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Save brand voice to backend
      const response = await fetch(`/api/settings?shop=${encodeURIComponent(shopDomain || '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand_voice: selectedVoice,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save brand voice');
      }

      // Navigate to AI Live confirmation page
      const host = searchParams.get('host');
      let redirectUrl = `/onboarding/ai-live?shop=${encodeURIComponent(shopDomain || '')}`;
      if (host) {
        redirectUrl += `&host=${encodeURIComponent(host)}`;
      }
      
      router.push(redirectUrl);
    } catch (err) {
      console.error('Error saving brand voice:', err);
      setError('Failed to save your selection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const sampleMessage = SAMPLE_MESSAGES[selectedVoice];

  return (
    <Page
      title="Choose Your AI's Personality"
      subtitle="Select a brand voice that matches your store's style"
    >
      <Layout>
        <Layout.Section>
          {error && (
            <Banner tone="critical" onDismiss={() => setError(null)}>
              <p>{error}</p>
            </Banner>
          )}

          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd" as="h2">
                Step 4 of 5: Brand Voice
              </Text>
              <Box paddingBlockStart="200">
                <Text tone="subdued" as="p">
                  Your AI will communicate with customers using this personality. 
                  Choose the one that best represents your brand.
                </Text>
              </Box>
            </div>
          </Card>

          <Box paddingBlockStart="400">
            <Card>
              <div style={{ padding: '20px' }}>
                <Text variant="headingMd" as="h2" style={{ marginBottom: '16px' }}>
                  Select a Voice
                </Text>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {VOICE_OPTIONS.map((voice) => (
                    <div
                      key={voice.value}
                      onClick={() => handleVoiceSelect(voice.value)}
                      style={{
                        padding: '20px',
                        border: `2px solid ${selectedVoice === voice.value ? '#008060' : '#e1e3e5'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedVoice === voice.value ? '#f6f6f7' : 'white',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                        {voice.icon}
                      </div>
                      <Text variant="headingSm" as="h3">
                        {voice.label}
                      </Text>
                      <Text tone="subdued" as="p">
                        {voice.description}
                      </Text>
                      {selectedVoice === voice.value && (
                        <Box paddingBlockStart="200">
                          <Badge tone="success">Selected</Badge>
                        </Box>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Box>

          <Box paddingBlockStart="400">
            <Card>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <Text variant="headingMd" as="h2">
                    Live Preview
                  </Text>
                  <Badge tone="info">Sample Email</Badge>
                </div>

                <div
                  style={{
                    backgroundColor: '#f6f6f7',
                    border: '1px solid #e1e3e5',
                    borderRadius: '8px',
                    padding: '20px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}
                >
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e1e3e5' }}>
                    <Text tone="subdued" as="p" variant="bodySm">
                      Subject:
                    </Text>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {sampleMessage.subject}
                    </Text>
                  </div>

                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {sampleMessage.body}
                  </div>
                </div>

                <Box paddingBlockStart="400">
                  <Banner tone="info">
                    <p>
                      This is how your AI will sound when sending cart recovery emails. 
                      The actual content will be personalized for each customer.
                    </p>
                  </Banner>
                </Box>
              </div>
            </Card>
          </Box>

          <Box paddingBlockStart="400" paddingBlockEnd="400">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={() => router.back()}
                variant="secondary"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleContinue}
                loading={saving}
                disabled={!storeId}
              >
                Sounds Good! Continue →
              </Button>
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
                    <Badge tone="info">→</Badge>
                    <Text as="span" fontWeight="semibold">Brand Voice</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge>○</Badge>
                    <Text tone="subdued" as="span">AI Activation</Text>
                  </div>
                </div>
              </Box>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
