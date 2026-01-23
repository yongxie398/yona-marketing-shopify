import './globals.css';
import type { Metadata } from 'next';
import ClientWrapper from './ClientWrapper';
import '@shopify/polaris/build/esm/styles.css';

// Use default font to avoid network requests
const inter = { className: '' }; // Using system font stack from CSS

export const metadata: Metadata = {
  title: 'AI Revenue Agent for Shopify',
  description: 'Autonomous AI agent for increasing e-commerce revenue',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}