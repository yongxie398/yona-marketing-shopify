import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import env, { getAppUrl } from '@/utils/env';
import logger from '@/utils/logger';
import aiCoreService from '@/lib/ai-core-service';

// Verify the session token
async function verifySessionToken(token: string) {
  try {
    // Decode the token without verification to get the shop
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const shop = decoded.dest.replace('https://', '');
    
    // For now, just return the shop without JWT verification
    // In a real implementation, you would verify the JWT here
    return { isValid: true, shop, payload: decoded };
  } catch (error) {
    logger.error('Session token verification failed:', {
      context: 'AuthCallback',
      error: error as Error
    });
    return { isValid: false, shop: null, payload: null };
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const host = url.searchParams.get('host');
  const idToken = url.searchParams.get('id_token');
  const session = url.searchParams.get('session');
  const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '');

  logger.info('Auth callback received', {
    context: 'AuthCallback',
    metadata: { 
      shop, 
      hasCode: !!code, 
      hasState: !!state, 
      hasHost: !!host, 
      hasSessionToken: !!sessionToken,
      hasIdToken: !!idToken,
      hasSession: !!session,
      idTokenLength: idToken?.length,
      sessionLength: session?.length
    }
  });

  // Verify the session token if present
  let sessionVerified = false;
  let sessionShop = shop;
  
  if (sessionToken) {
    const verification = await verifySessionToken(sessionToken);
    sessionVerified = verification.isValid;
    if (verification.shop) {
      sessionShop = verification.shop;
    }
  }

  // Use the shop from session token if available and not provided in URL
  const targetShop = sessionShop || shop;

  if (!targetShop) {
    logger.error('No shop provided in auth callback', {
      context: 'AuthCallback',
      metadata: { urlShop: shop, sessionShop, sessionTokenPresent: !!sessionToken }
    });
    redirect(`${getAppUrl()}?error=missing_shop`);
  }

  // Normalize the shop domain
  const normalizedShop = targetShop.toLowerCase().trim();

  if (code) {
    // Exchange the code for an access token
    try {
      // Complete OAuth process to get access token and Shopify store details
      const oauthUrl = `https://${normalizedShop}/admin/oauth/access_token`;
      const oauthResponse = await fetch(oauthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: env.SHOPIFY_API_KEY,
          client_secret: env.SHOPIFY_API_SECRET,
          code: code,
          redirect_uri: `${getAppUrl()}/api/auth/callback`,
        }).toString(),
      });

      if (!oauthResponse.ok) {
        logger.error('OAuth token exchange failed', {
          context: 'AuthCallback',
          metadata: { shop: normalizedShop, statusCode: oauthResponse.status }
        });
        redirect(`${getAppUrl()}?error=oauth_failed`);
      }

      const oauthData = await oauthResponse.json();
      const accessToken = oauthData.access_token;
      let shopifyStoreId = oauthData.associated_user?.id?.toString() || oauthData.associated_company?.id?.toString(); // Get the actual Shopify store ID
      
      // If shopifyStoreId is not available from OAuth response, fetch it using admin API
      if (!shopifyStoreId) {
        try {
          const shopInfoResponse = await fetch(`https://${normalizedShop}/admin/api/2023-01/shop.json`, {
            headers: {
              'X-Shopify-Access-Token': accessToken,
            },
          });
          
          if (shopInfoResponse.ok) {
            const shopData = await shopInfoResponse.json();
            shopifyStoreId = shopData.shop?.id?.toString();
            logger.info('Retrieved shop ID from admin API', {
              context: 'AuthCallback',
              metadata: { shop: normalizedShop, shopId: shopifyStoreId }
            });
          } else {
            logger.warn('Failed to retrieve shop info from admin API', {
              context: 'AuthCallback',
              metadata: { shop: normalizedShop, statusCode: shopInfoResponse.status }
            });
          }
        } catch (error) {
          logger.error('Error fetching shop info from admin API', {
            context: 'AuthCallback',
            error: error as Error,
            metadata: { shop: normalizedShop }
          });
        }
      }

      // Prepare store data for registration with complete information
      const storeData = {
        domain: normalizedShop,
        name: normalizedShop.split('.')[0], // Use shop name from domain
        platform: 'shopify',
        platform_store_id: shopifyStoreId || normalizedShop, // Use actual Shopify store ID if available, fallback to domain
        currency: 'USD', // Default currency, can be updated later
        brand_tone: 'friendly', // Default brand tone
        status: 'active',
        frequency_caps: { daily: 1, weekly: 3 }, // Default frequency caps
        paused: false,
        access_token: accessToken, // Include access token from OAuth
        hmac_secret: env.SHOPIFY_API_SECRET, // Use the same secret as used for OAuth
        config_updated_at: new Date().toISOString()
      };

      // Register the store with the Core AI Service - this creates the complete record
      const backendUrl = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
      const registerResponse = await fetch(`${backendUrl}/api/v1/shops/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
        redirect: 'manual' // Don't follow redirects automatically
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        logger.error(`Failed to register store with backend: ${errorText}`, {
          context: 'AuthCallback',
          metadata: { shop: normalizedShop, statusCode: registerResponse.status }
        });
        redirect(`${getAppUrl()}?error=registration_failed`);
      }

      const registeredStore = await registerResponse.json();
      logger.info('Store registered with backend', {
          context: 'AuthCallback',
          metadata: { shop: normalizedShop, storeId: registeredStore.id, platformStoreId: registeredStore.platform_store_id }
      });

      // Set the session cookie - use 'lax' for better Shopify OAuth compatibility
      cookies().set('shop', normalizedShop, { secure: true, httpOnly: true, sameSite: 'lax' });
      
      // Set the access token in a secure cookie (in production, consider storing in database)
      cookies().set('accessToken', accessToken, { secure: true, httpOnly: true, sameSite: 'lax' });

      // Register webhooks with Shopify
      const webhooksToRegister = [
        { topic: 'app/uninstalled', description: 'App uninstallation' },
        { topic: 'orders/create', description: 'New order creation' },
        { topic: 'orders/updated', description: 'Order updates' }, // Corrected topic
        { topic: 'customers/create', description: 'New customer creation' },
        { topic: 'customers/update', description: 'Customer updates' },
        { topic: 'products/create', description: 'New product creation' },
        { topic: 'products/update', description: 'Product updates' },
        { topic: 'checkouts/create', description: 'New checkout creation' },
        { topic: 'checkouts/update', description: 'Checkout updates' },
      ];

      for (const webhook of webhooksToRegister) {
        try {
          const correctedTopic = webhook.topic; // No need for correction anymore since we're using the correct names
          
          const webhookRegistrationResponse = await fetch(`https://${normalizedShop}/admin/api/2026-01/webhooks.json`, {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              webhook: {
                topic: correctedTopic,
                address: `${getAppUrl()}/api/webhooks`,
                format: 'json',
              },
            }),
          });

          if (webhookRegistrationResponse.ok) {
            logger.info(`Successfully registered ${correctedTopic} webhook with Shopify`, {
              context: 'AuthCallback',
              metadata: { shop: normalizedShop, topic: correctedTopic }
            });
          } else {
            // Get error details for better debugging
            const errorText = await webhookRegistrationResponse.text();
            
            // Check if it's an "already taken" error
            if (errorText.includes('address') && errorText.includes('already been taken')) {
              logger.info(`Webhook ${correctedTopic} already registered with Shopify`, {
                context: 'AuthCallback',
                metadata: { shop: normalizedShop, topic: correctedTopic }
              });
            } else {
              logger.error(`Failed to register ${correctedTopic} webhook with Shopify`, {
                context: 'AuthCallback',
                metadata: { 
                  shop: normalizedShop, 
                  topic: correctedTopic, 
                  statusCode: webhookRegistrationResponse.status,
                  errorDetails: errorText
                }
              });
            }
          }
        } catch (webhookError) {
          logger.error(`Error registering ${webhook.topic} webhook with Shopify:`, {
            context: 'AuthCallback',
            error: webhookError as Error,
            metadata: { shop: normalizedShop, topic: webhook.topic }
          });
        }
      }

      // No need to register with Core AI Service here since store is already registered with backend
      // The Core AI Service integration can happen through other means

      logger.info('Auth callback completed successfully', {
        context: 'AuthCallback',
        metadata: { shop: normalizedShop }
      });

      // Check if this is a new store that needs onboarding
      // New stores won't have brand_voice configured yet
      const isNewStore = !registeredStore.brand_voice || registeredStore.brand_voice === 'friendly';
      const onboardingComplete = registeredStore.onboarding_complete === true;
      
      // Redirect to onboarding for new stores, dashboard for existing ones
      let redirectUrl: string;
      if (isNewStore && !onboardingComplete) {
        // New store - start onboarding flow
        redirectUrl = `${getAppUrl()}/onboarding/brand-voice?shop=${normalizedShop}&host=${host}`;
        logger.info('Redirecting new store to onboarding', {
          context: 'AuthCallback',
          metadata: { shop: normalizedShop, isNewStore, onboardingComplete }
        });
      } else {
        // Existing store - go to dashboard
        redirectUrl = `${getAppUrl()}/?shop=${normalizedShop}&host=${host}`;
        logger.info('Redirecting existing store to dashboard', {
          context: 'AuthCallback',
          metadata: { shop: normalizedShop, isNewStore, onboardingComplete }
        });
      }
      
      // Pass id_token or session if available for authentication
      if (idToken) {
        redirectUrl += `&id_token=${encodeURIComponent(idToken)}`;
      } else if (session) {
        redirectUrl += `&session=${encodeURIComponent(session)}`;
      }
      redirect(redirectUrl);
    } catch (error: any) {
      // Check if this is a Next.js redirect, and if so, re-throw it
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
      }
      
      logger.error('Error in auth callback:', {
        context: 'AuthCallback',
        error: error as Error,
        metadata: { shop: normalizedShop, errorMessage: error.message }
      });
      redirect(`${getAppUrl()}?error=callback_error`);
    }
  } else if (sessionVerified) {
    // If we have a valid session token but no code, redirect to Shopify OAuth
    const authUrl = `https://${normalizedShop}/admin/oauth/authorize?client_id=${env.SHOPIFY_API_KEY}&scope=read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_themes,write_themes,read_script_tags,write_script_tags,read_inventory,write_inventory&redirect_uri=${encodeURIComponent(`${getAppUrl()}/api/auth/callback`)}`;
    redirect(authUrl);
  } else {
    logger.error('Invalid session and no authorization code', {
      context: 'AuthCallback',
      metadata: { shop: normalizedShop, hasCode: !!code, sessionVerified }
    });
    redirect(`${getAppUrl()}?error=invalid_session`);
  }
}