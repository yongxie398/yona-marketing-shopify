"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
  Page,
  Card,
  Layout,
  Button,
  Text,
  TextContainer,
  BlockStack,
  Banner,
  Badge
} from '@shopify/polaris';

export default function MinimalHomePage() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <Page
      title="AI Revenue Agent"
      subtitle="Autonomous revenue optimization for your Shopify store"
      primaryAction={
        <Button primary>
          Configure Settings
        </Button>
      }
      secondaryActions={[
        <Button
          variant={isPaused ? 'success' : 'warning'}
          key="pause"
        >
          {isPaused ? 'Resume AI' : 'Pause AI'}
        </Button>
      ]}
    >
      <Layout>
        <Layout.Block>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Text variant="bodyLg">
                  Welcome to your AI Revenue Agent!
                </Text>
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <Banner
                title="Shopify Store Connected"
                tone="success"
              >
                Your Shopify store is successfully connected.
              </Banner>
            </Card.Section>
          </Card>
        </Layout.Block>

        <Layout.Block>
          <Card title="Performance Metrics" sectioned>
            <Card.Section>
              <BlockStack horizontal spacing="400" wrap>
                <Card title="Revenue Recovered" sectioned style={{ flex: 1, minWidth: '200px' }}>
                  <Text variant="heading2xl" as="h2" style={{ color: '#008060', fontWeight: 'bold' }}>
                    $0.00
                  </Text>
                  <Badge status="success" style={{ marginTop: '0.5rem' }}>
                    +0.0% from last month
                  </Badge>
                </Card>
              </BlockStack>
            </Card.Section>
          </Card>
        </Layout.Block>
      </Layout>
    </Page>
  );
}