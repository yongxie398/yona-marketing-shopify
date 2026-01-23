{"use client";

export const dynamic = 'force-dynamic';

import {
  Page,
  Card,
  Layout,
  Button,
  Text,
  TextContainer,
  Banner
} from '@shopify/polaris';

export default function TestHomePage() {
  return (
    <Page
      title="AI Revenue Agent"
      subtitle="Autonomous revenue optimization for your Shopify store"
      primaryAction={
        <Button primary>
          Configure Settings
        </Button>
      }
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
                Your Shopify store is successfully connected to the AI Revenue Agent service.
              </Banner>
            </Card.Section>
          </Card>
        </Layout.Block>
      </Layout>
    </Page>
  );
}