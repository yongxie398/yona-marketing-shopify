export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Shopify OAuth callback handler
    const { code, shop } = req.query;
    
    if (!code || !shop) {
      return res.status(400).json({ error: 'Missing code or shop' });
    }

    try {
      // Exchange authorization code for access token
      const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_API_SECRET,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(`Shopify API error: ${tokenData.error_description}`);
      }

      // Store shop and token in your database
      // This is where you'd typically save the shop data and access token
      console.log(`Shop ${shop} authenticated successfully`);

      // Forward shop data to Core AI Service
      await fetch(`${process.env.CORE_AI_SERVICE_URL}/api/shops/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CORE_AI_SERVICE_API_KEY}`
        },
        body: JSON.stringify({
          shop_domain: shop,
          access_token: tokenData.access_token,
          shop_data: tokenData
        })
      });

      // Redirect to Shopify admin with success
      res.redirect(`https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`);
    } catch (error) {
      console.error('OAuth error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}