'use client';

import { useEffect, useState } from 'react';
import { Provider as AppBridgeProviderReact, useAppBridge } from '@shopify/app-bridge-react';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import { getSessionToken } from '@shopify/app-bridge-utils';
import { Redirect } from '@shopify/app-bridge/actions';

// Custom hook to get session token for authenticated requests
export const useSessionToken = () => {
  const appBridge = useAppBridge();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!appBridge) return;

    const fetchToken = async () => {
      try {
        const sessionToken = await getSessionToken(appBridge);
        setToken(sessionToken);
      } catch (error) {
        console.error('Error fetching session token:', error);
      }
    };

    fetchToken();

    // Refresh token periodically (Shopify tokens expire after 1 hour)
    const interval = setInterval(fetchToken, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [appBridge]);

  return token;
};

// Auth redirect handler component that uses App Bridge
const AuthRedirectHandler = () => {
  const appBridge = useAppBridge();

  useEffect(() => {
    if (!appBridge) return;

    const urlParams = new URLSearchParams(window.location.search);
    const host = urlParams.get('host');
    const shop = urlParams.get('shop');
    
    if (!host && shop) {
      try {
        const redirect = Redirect.create(appBridge);
        redirect.dispatch(
          Redirect.Action.REMOTE,
          `/api/auth/begin?shop=${encodeURIComponent(shop)}`
        );
      } catch (error) {
        console.error('Error creating redirect:', error);
      }
    }
  }, [appBridge]);

  return null;
};

export default function AppBridgeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAppBridge = () => {
      try {
        // Check if window is available (client-side only)
        if (typeof window === 'undefined') {
          // Server-side rendering - leave loading state
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const host = urlParams.get('host');
        const shop = urlParams.get('shop');
        
        if (!host && !shop) {
          // If both host and shop are missing, show friendly error
          throw new Error('Please open this app from the Shopify Admin for Yona Test Store.');
        }

        // If host is present, create App Bridge config
        if (host) {
          const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
          if (!apiKey) {
            throw new Error('Shopify API key not configured');
          }

          const appBridgeConfig = {
            apiKey,
            host,
            forceRedirect: true,
            theme: 'light',
          };

          setConfig(appBridgeConfig);
          setError(null);
        } else if (shop) {
          // If host is missing but shop is present,
          // we'll handle redirect in AuthRedirectHandler
          // which has access to App Bridge
          const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
          if (!apiKey) {
            throw new Error('Shopify API key not configured');
          }

          // Create minimal config to initialize App Bridge
          // We'll handle redirect after initialization
          const appBridgeConfig = {
            apiKey,
            host: 'temp', // Temporary host - will be replaced by redirect
            forceRedirect: true,
            theme: 'light',
          };

          setConfig(appBridgeConfig);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize App Bridge');
        console.error('App Bridge initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAppBridge();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '2rem'
      }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#d73a49', marginBottom: '1rem' }}>App Initialization Error</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>{error}</p>
          <p style={{ color: '#666' }}>
            This app must be installed from the Shopify App Store and accessed through the Shopify admin.
          </p>
        </div>
      </div>
    );
  }

  if (config) {
    return (
      <AppBridgeProviderReact config={config}>
        <PolarisAppProvider i18n={{}}>
          <AuthRedirectHandler />
          {children}
        </PolarisAppProvider>
      </AppBridgeProviderReact>
    );
  }

  return null;
}