// pages/api/webhooks.js
import { validateHmacSignature, processWebhook } from '@/utils/shopify';
import env from '@/utils/env';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get required headers
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'];
    const shopDomain = req.headers['x-shopify-shop-domain'];
    
    // Validate HMAC signature
    const isValid = validateHmacSignature(
      req.body, 
      hmac, 
      env.SHOPIFY_API_SECRET
    );
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
    }
    
    if (!topic || !shopDomain) {
      console.error('Missing required webhook headers');
      return res.status(400).json({ error: 'Bad Request: Missing headers' });
    }
    
    // Parse the payload
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Process the webhook
    await processWebhook(topic, shopDomain, payload);
    
    // Respond to Shopify that the webhook was received
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Config to disable body parsing, so we can validate HMAC
export const config = {
  api: {
    bodyParser: false,
  },
};