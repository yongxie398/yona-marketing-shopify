'use client';

import AppBridgeProvider from './AppBridgeProvider';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <AppBridgeProvider>
      <PolarisAppProvider i18n={enTranslations}>
        <div className="app-container">
          <main className="app-main">
            {children}
          </main>
        </div>
      </PolarisAppProvider>
    </AppBridgeProvider>
  );
}