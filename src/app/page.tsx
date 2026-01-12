"use client";

import { useState, useEffect } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { Card, Page, Layout, TextContainer, Button, Banner } from '@shopify/polaris';

export default function HomePage() {
  const app = useAppBridge();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    recoveredRevenue: 0,
    messagesSent: 0,
    activeCampaigns: 0,
    roi: 0,
  });

  useEffect(() => {
    // Fetch metrics from the API
    const fetchMetrics = async () => {
      try {
        // In a real implementation, this would fetch metrics from your API
        // For now, we'll use mock data
        setMetrics({
          recoveredRevenue: 0,
          messagesSent: 0,
          activeCampaigns: 0,
          roi: 0,
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConfigureClick = () => {
    // Navigate to settings page
    if (app) {
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, '/app/settings');
    }
  };

  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <Card>
            <TextContainer>
              <p>
                Welcome to your AI Revenue Agent! This service integrates with our AI Core Service to observe shopper behavior, 
                drive optimal interventions, and increase revenue.
              </p>
              
              <Banner tone="info">
                Your Shopify store is connected to the AI Revenue Agent service.
              </Banner>
            </TextContainer>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#008060' }}>Connected</p>
                <p>Shopify Connection</p>
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Active</p>
                <p>Event Forwarding</p>
              </div>
            </div>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <Button variant="primary" onClick={handleConfigureClick}>Configure Settings</Button>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem', padding: '0.5rem', borderLeft: '3px solid #008060', paddingLeft: '0.5rem' }}>
                <strong>Event Collection</strong><br />
                <small>Collects commerce events from your Shopify store</small>
              </li>
              <li style={{ marginBottom: '1rem', padding: '0.5rem', borderLeft: '3px solid #008060', paddingLeft: '0.5rem' }}>
                <strong>Data Forwarding</strong><br />
                <small>Forwards events to AI Core Service for processing</small>
              </li>
              <li style={{ marginBottom: '1rem', padding: '0.5rem', borderLeft: '3px solid #008060', paddingLeft: '0.5rem' }}>
                <strong>Shopify Integration</strong><br />
                <small>Fully integrated with your Shopify admin</small>
              </li>
            </ul>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}