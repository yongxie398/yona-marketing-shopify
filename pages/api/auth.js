import { generateAuthUrl, exchangeCodeForAccessToken, registerWebhooks } from '@/utils/shopify';
import { DatabaseService } from '@/lib/db';
import env from '@/utils/env';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }
    
    // Generate and redirect to Shopify OAuth URL
    const authUrl = generateAuthUrl(
      shop,
      env.SHOPIFY_API_KEY,
      ['read_customers', 'read_products', 'read_orders', 'read_checkouts']
    );
    
    res.redirect(authUrl);
  } else if (req.method === 'POST') {
    // Handle OAuth callback
    const { shop, hmac, code, state, timestamp } = req.body;
    
    if (!shop || !hmac || !code || !state || !timestamp) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    try {
      // Exchange code for access token
      const { accessToken, shopName } = await exchangeCodeForAccessToken(
        shop,
        code,
        env.SHOPIFY_API_KEY,
        env.SHOPIFY_API_SECRET
      );
      
      // Store shop information in database
      const store = await DatabaseService.createStore({
        shop_domain: shop,
        shop_name: shopName,
        access_token: accessToken,
        hmac_secret: env.SHOPIFY_API_SECRET,
      });
      
      // Register webhooks
      await registerWebhooks(accessToken, shop);
      
      // Forward shop data to Core AI Service
      await fetch(`${env.CORE_AI_SERVICE_URL}/api/shops/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.CORE_AI_SERVICE_API_KEY}`
        },
        body: JSON.stringify({
          shop_domain: shop,
          access_token: accessToken,
          shop_name: shopName
        })
      });
      
      // Redirect to Shopify admin
      res.redirect(`https://${shop}/admin/apps/${env.SHOPIFY_API_KEY}`);
    } catch (error) {
      console.error('OAuth error:', error);
      res.status(500).json({ error: 'OAuth failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}