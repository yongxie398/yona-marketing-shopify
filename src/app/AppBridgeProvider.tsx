'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { Provider as AppBridgeProviderReact, useAppBridge } from '@shopify/app-bridge-react';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import { getSessionToken } from '@shopify/app-bridge-utils';
import { Redirect } from '@shopify/app-bridge/actions';

// Create a context for session token to work without App Bridge
const SessionTokenContext = createContext<string | null>(null);

// Hook to get session token from context
export const useSessionTokenFromContext = () => useContext(SessionTokenContext);

// Custom hook to get session token for authenticated requests
export const useSessionToken = () => {
  const appBridge = useAppBridge();
  const contextToken = useContext(SessionTokenContext);
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
    
    // Check if token exists in sessionStorage (in case state hasn't synced yet)
    const storedToken = sessionStorage.getItem('shopify_session_token');
    if (storedToken) {
      console.log('useSessionToken: Found token in sessionStorage, using it');
      setToken(storedToken);
      return;
    }
    
    // No token in state/sessionStorage - need to try to get one
    if (!appBridge) {
      console.log('useSessionToken: appBridge not available, cannot fetch token');
      return;
    }
    
    // No token available and we have appBridge - try to get token via App Bridge first
    // Only redirect to OAuth if App Bridge fails to provide a token
    console.log('useSessionToken: No token available, will try App Bridge first...');

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

  // Return token from state, or from context if available (for session-only mode)
  return token || contextToken;
};

export default function AppBridgeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeAppBridge = () => {
      try {
        // Check if window is available (client-side only)
        if (typeof window === 'undefined') {
          // Server-side rendering - leave loading state
          return;
        }

        // Get session token from sessionStorage first
        const storedToken = sessionStorage.getItem('shopify_session_token');
        if (storedToken) {
          console.log('AppBridgeProvider: Found session token in sessionStorage');
          setSessionToken(storedToken);
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
            forceRedirect: false,
            theme: 'light',
          };

          console.log('App Bridge config created, setting config...');
          setConfig(appBridgeConfig);
          setError(null);
        } else if (shop) {
          // If host is missing but shop is present, we can still function
          // The host parameter is mainly needed for App Bridge initialization
          // If we're already authenticated (have session token), continue without host
          const sessionToken = sessionStorage.getItem('shopify_session_token');
          
          if (sessionToken) {
            console.log('No host param but have session token, continuing without App Bridge');
            // Create a minimal config that doesn't use App Bridge
            setConfig({
              apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
              shop,
              host: '',
              forceRedirect: false,
            });
            setError(null);
          } else {
            // No session token, need to redirect to OAuth
            const isInIframe = window.self !== window.top;
            const redirectUrl = `/api/auth/begin?shop=${encodeURIComponent(shop)}`;
            
            console.log('No host param and no session token, redirecting to OAuth:', {
              isInIframe,
              redirectUrl
            });
            
            if (isInIframe) {
              window.parent.location.href = redirectUrl;
            } else {
              window.location.href = redirectUrl;
            }
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
    // If host is empty, we're not using App Bridge (session-only mode)
    if (!config.host) {
      return (
        <SessionTokenContext.Provider value={sessionToken}>
          <PolarisAppProvider i18n={{}}>
            {children}
          </PolarisAppProvider>
        </SessionTokenContext.Provider>
      );
    }
    
    return (
      <SessionTokenContext.Provider value={sessionToken}>
        <AppBridgeProviderReact config={config}>
          <PolarisAppProvider i18n={{}}>
            {children}
          </PolarisAppProvider>
        </AppBridgeProviderReact>
      </SessionTokenContext.Provider>
    );
  }

  return null;
}