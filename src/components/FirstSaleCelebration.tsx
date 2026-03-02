'use client';

import { useState, useEffect } from 'react';
import { Modal, Text, Badge, Button, Banner, Box } from '@shopify/polaris';

interface FirstSaleData {
  order_id: string;
  customer_email: string;
  customer_name?: string;
  revenue: number;
  recovery_time_hours: number;
  message_preview: string;
  campaign_type: string;
}

interface FirstSaleCelebrationProps {
  storeId: string;
  onDismiss: () => void;
}

export default function FirstSaleCelebration({ storeId, onDismiss }: FirstSaleCelebrationProps) {
  const [active, setActive] = useState(false);
  const [saleData, setSaleData] = useState<FirstSaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    checkForFirstSale();
  }, [storeId]);

  const checkForFirstSale = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      
      // Check if user has already seen the celebration
      const hasSeenCelebration = localStorage.getItem(`first-sale-celebrated-${storeId}`);
      if (hasSeenCelebration) {
        setLoading(false);
        return;
      }

      // Fetch recent attributed orders
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/billing/stores/${storeId}/activity-feed?limit=20&days=30`
      );

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Look for the first attributed sale
      const firstSale = data.activities?.find(
        (activity: any) => activity.attributed_revenue && activity.attributed_revenue > 0
      );

      if (firstSale) {
        setSaleData({
          order_id: firstSale.message_id || 'Unknown',
          customer_email: firstSale.customer?.email || 'customer@example.com',
          customer_name: firstSale.customer?.first_name,
          revenue: firstSale.attributed_revenue,
          recovery_time_hours: 4, // Would come from backend
          message_preview: firstSale.description,
          campaign_type: firstSale.campaign_type
        });
        
        setActive(true);
        setConfetti(true);
        
        // Mark as celebrated
        localStorage.setItem(`first-sale-celebrated-${storeId}`, 'true');
        
        // Stop confetti after 5 seconds
        setTimeout(() => setConfetti(false), 5000);
      }
    } catch (err) {
      console.error('Error checking for first sale:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setActive(false);
    onDismiss();
  };

  const handleShare = () => {
    const text = `🎉 My AI just recovered its first sale! $${saleData?.revenue.toFixed(2)} in recovered revenue. #AIRevenueAgent`;
    
    if (navigator.share) {
      navigator.share({
        title: 'First AI-Recovered Sale!',
        text: text,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  if (loading || !saleData) {
    return null;
  }

  return (
    <Modal
      open={active}
      onClose={handleDismiss}
      title=""
      primaryAction={{
        content: 'View Details',
        onAction: handleDismiss,
      }}
      secondaryActions={[
        {
          content: 'Share Win 🎉',
          onAction: handleShare,
        },
      ]}
    >
      <Modal.Section>
        {/* Confetti Effect */}
        {confetti && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden'
          }}>
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  borderRadius: '50%',
                  animation: `fall ${2 + Math.random() * 3}s linear forwards`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '20px' }}>
          {/* Celebration Icon */}
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            🎉
          </div>

          <Text variant="heading2xl" as="h2" fontWeight="bold">
            FIRST RECOVERED SALE!
          </Text>

          <Box paddingBlockStart="400">
            <Text as="p" variant="bodyMd">
              Your AI Revenue Agent just recovered its first abandoned cart!
            </Text>
          </Box>

          {/* Sale Details */}
          <Box paddingBlockStart="400">
            <div 
              style={{ 
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px'
              }}
            >
              <Text variant="headingXl" as="p" fontWeight="bold" tone="success">
                ${saleData.revenue.toFixed(2)}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Recovered Revenue
              </Text>

              <Box paddingBlockStart="300">
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text variant="headingMd" as="p">
                      {saleData.customer_name || saleData.customer_email.split('@')[0]}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Customer
                    </Text>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Text variant="headingMd" as="p">
                      {saleData.recovery_time_hours}h
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Recovery Time
                    </Text>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Text variant="headingMd" as="p">
                      {saleData.campaign_type?.replace('_', ' ')}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Campaign
                    </Text>
                  </div>
                </div>
              </Box>
            </div>
          </Box>

          {/* What Happened */}
          <Box paddingBlockStart="200">
            <Banner tone="success">
              <p>
                <strong>What happened:</strong> Your AI sent a personalized message to{' '}
                {saleData.customer_name || 'this customer'} after they abandoned their cart. 
                They returned and completed their purchase!
              </p>
            </Banner>
          </Box>

          {/* Achievement Badge */}
          <Box paddingBlockStart="400">
            <div 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '20px',
                padding: '8px 16px'
              }}
            >
              <span style={{ fontSize: '20px' }}>🏆</span>
              <Text as="span" variant="bodySm" fontWeight="semibold">
                First Win Achievement Unlocked!
              </Text>
            </div>
          </Box>

          {/* Next Steps */}
          <Box paddingBlockStart="400">
            <Text as="p" variant="bodySm" tone="subdued">
              This is just the beginning! Your AI will continue monitoring and recovering 
              sales 24/7. Check your dashboard for real-time updates.
            </Text>
          </Box>
        </div>
      </Modal.Section>

      {/* Add CSS for confetti animation */}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </Modal>
  );
}
