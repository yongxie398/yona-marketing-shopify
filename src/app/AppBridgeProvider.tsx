'use client';

import { useEffect, useState } from 'react';
import { Provider as AppBridgeProviderReact, useAppBridge } from '@shopify/app-bridge-react';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import { getSessionToken } from '@shopify/app-bridge-utils';
import { Redirect } from '@shopify/app-bridge/actions';

// Custom hook to get session token for authenticated requests
export const useSessionToken = () => {
  const appBridge = useAppBridge();
  const [token, setToken] = useState<string | null>(() => {
    // Try to get token from sessionStorage first (persists across navigation)
    if (typeof window !== 'undefined') {
      const storedToken = sessionStorage.getItem('shopify_session_token');
      if (storedToken) {
        console.log('useSessionToken: Found token in sessionStorage, length =', storedToken.length);
        return storedToken;
      }
    }
    return null;
  });

  useEffect(() => {
    console.log('useSessionToken: appBridge =', appBridge, 'type:', typeof appBridge);
    
    // Check for id_token in URL first - this is the JWT from Shopify OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const idToken = urlParams.get('id_token');
    const session = urlParams.get('session');
    const shop = urlParams.get('shop');
    const host = urlParams.get('host');
    
    console.log('useSessionToken: URL params check:', {
      hasIdToken: !!idToken,
      hasSession: !!session,
      hasShop: !!shop,
      hasHost: !!host,
      idTokenLength: idToken?.length,
      currentToken: token ? 'present' : 'null'
    });
    
    // If we have id_token in URL, use it directly as the session token
    if (idToken) {
      console.log('useSessionToken: Using id_token from URL directly, length =', idToken.length);
      sessionStorage.setItem('shopify_session_token', idToken);
      setToken(idToken);
      return;
    }
    
    // If we have session in URL, use it
    if (session) {
      console.log('useSessionToken: Using session from URL, length =', session.length);
      sessionStorage.setItem('shopify_session_token', session);
      setToken(session);
      return;
    }
    
    // If we already have a token (from sessionStorage), don't fetch again
    if (token) {
      console.log('useSessionToken: Already have token from sessionStorage');
      return;
    }
    
    // No token available - need to re-authenticate
    if (shop && host && appBridge) {
      console.log('useSessionToken: No token available, redirecting to OAuth...');
      const redirect = Redirect.create(appBridge);
      const redirectUri = `${window.location.origin}/api/auth/callback`;
      const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_SHOPIFY_API_KEY}&scope=read_customers,write_customers,read_orders,write_orders,read_products,write_products,read_checkouts,write_checkouts,read_marketing_events,write_marketing_events,read_content,read_analytics,read_script_tags,write_script_tags&redirect_uri=${encodeURIComponent(redirectUri)}`;
      redirect.dispatch(Redirect.Action.REMOTE, authUrl);
      return;
    }
    
    if (!appBridge) {
      console.log('useSessionToken: appBridge not available yet');
      return;
    }

    // Only try App Bridge session token if no token available
    let cancelled = false;
    
    const fetchToken = async () => {
      if (cancelled) return;
      
      try {
        console.log('useSessionToken: Fetching session token via App Bridge...');
        
        const timeoutPromise = new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error('Session token fetch timeout after 10s')), 10000);
        });
        
        const sessionToken = await Promise.race([
          getSessionToken(appBridge),
          timeoutPromise
        ]) as string;
        
        if (!cancelled && sessionToken) {
          console.log('useSessionToken: Token received via App Bridge, length =', sessionToken.length);
          sessionStorage.setItem('shopify_session_token', sessionToken);
          setToken(sessionToken);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('useSessionToken: Failed to fetch session token:', error);
        }
      }
    };

    const initTimeout = setTimeout(fetchToken, 500);
    
    return () => {
      cancelled = true;
      clearTimeout(initTimeout);
    };
  }, [appBridge, token]);

  return token;
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
        
        console.log('AppBridgeProvider initialization:', {
          host: host ? `${host.substring(0, 20)}...` : null,
          shop,
          isInIframe: window.self !== window.top,
          currentUrl: window.location.href
        });
        
        if (!host && !shop) {
          // If both host and shop are missing, show friendly error
          throw new Error('Please open this app from the Shopify Admin for Yona Test Store.');
        }

        // If host is present, create App Bridge config
        if (host) {
          const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
          console.log('Creating App Bridge config with API key:', apiKey ? 'present' : 'missing');
          
          if (!apiKey) {
            throw new Error('Shopify API key not configured');
          }

          const appBridgeConfig = {
            apiKey,
            host,
            forceRedirect: true,
            theme: 'light',
          };

          console.log('App Bridge config created, setting config...');
          setConfig(appBridgeConfig);
          setError(null);
        } else if (shop) {
          // If host is missing but shop is present, redirect to OAuth
          // Check if we're in an iframe (embedded in Shopify admin)
          const isInIframe = window.self !== window.top;
          const redirectUrl = `/api/auth/begin?shop=${encodeURIComponent(shop)}`;
          
          console.log('No host param, redirecting to OAuth:', {
            isInIframe,
            redirectUrl
          });
          
          if (isInIframe) {
            // Redirect parent window to break out of iframe
            window.parent.location.href = redirectUrl;
          } else {
            // Direct redirect for standalone access
            window.location.href = redirectUrl;
          }
          return;
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
          {children}
        </PolarisAppProvider>
      </AppBridgeProviderReact>
    );
  }

  return null;
}