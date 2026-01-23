"use client";

export const dynamic = 'force-dynamic';

import {
  Page,
  Card,
  TextContainer,
  Text
} from '@shopify/polaris';

export default function HomePage() {
  return (
    <Page title="AI Revenue Agent">
      <Card sectioned>
        <TextContainer>
          <Text variant="bodyLg">
            Welcome to your AI Revenue Agent!
          </Text>
        </TextContainer>
      </Card>
    </Page>
  );
}