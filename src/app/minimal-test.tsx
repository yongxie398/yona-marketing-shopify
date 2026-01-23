{"use client";

export const dynamic = 'force-dynamic';

import {
  Page,
  Card,
  TextContainer,
  Text
} from '@shopify/polaris';

export default function MinimalTestPage() {
  return (
    <Page title="Test Page">
      <Card sectioned>
        <TextContainer>
          <Text variant="bodyLg">
            This is a test page to verify Polaris components are working correctly.
          </Text>
        </TextContainer>
      </Card>
    </Page>
  );
}