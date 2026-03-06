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
        <Button variant="primary">
          Configure Settings
        </Button>
      }
      secondaryActions={[
        <Button
          variant={isPaused ? 'primary' : 'secondary'}
          key="pause"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? 'Resume AI' : 'Pause AI'}
        </Button>
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <TextContainer>
              <Text variant="bodyLg" as="p">
                Welcome to your AI Revenue Agent!
              </Text>
            </TextContainer>
            <Banner
              title="Shopify Store Connected"
              tone="success"
            >
              <p>Your Shopify store is successfully connected.</p>
            </Banner>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">Performance Metrics</Text>
            <BlockStack gap="400">
              <Card>
                <Text variant="heading2xl" as="h3" tone="success">
                  $0.00
                </Text>
                <Badge tone="success">
                  +0.0% from last month
                </Badge>
              </Card>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
