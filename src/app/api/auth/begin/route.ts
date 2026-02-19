import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getAppUrl } from '@/utils/env';

export async function GET(request: NextRequest) {
  try {
    console.log(`Initiating OAuth...`);

    // Extract shop domain from query parameters
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop');
    
    if (!shop) {
      return new Response('Missing shop parameter', { status: 400 });
    }
    
    // Validate shop domain format
    const shopDomain = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!shopDomain.includes('.') || !shopDomain.endsWith('.myshopify.com')) {
      return new Response('Invalid shop domain', { status: 400 });
    }
    
    // Generate random state parameter for security
    const state = crypto.randomBytes(16).toString('hex');
    
    // Store state in session (in production, use proper session management)
    // For now, we'll pass it through the OAuth flow
    
    // Build OAuth authorization URL
    const redirectUri = `${getAppUrl()}/api/auth/callback`;
    const scopes = [
      'read_customers', 'write_customers',
      'read_orders', 'write_orders',
      'read_products', 'write_products',
      'read_checkouts', 'write_checkouts',
      'read_marketing_events', 'write_marketing_events',
      'read_content', 'read_analytics',
      'read_script_tags', 'write_script_tags'
    ].join(',');
    
    const authUrl = new URL(`https://${shopDomain}/admin/oauth/authorize`);
    authUrl.searchParams.set('client_id', process.env.SHOPIFY_API_KEY!);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    
    // In production, store the state associated with this shop
    console.log(`Initiating OAuth for shop: ${shopDomain} with state: ${state}`);
    
    // Redirect to Shopify authorization page
    return Response.redirect(authUrl.toString());
    
  } catch (error) {
    console.error('OAuth begin error:', error);
    return new Response('Authentication initiation failed', { status: 500 });
  }
}