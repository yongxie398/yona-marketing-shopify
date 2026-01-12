// Middleware utilities for the AI Revenue Agent for Shopify

import { NextApiRequest, NextApiResponse } from 'next';
import { validateHmacSignature } from './shopify';

export interface ShopifySession {
  shop: string;
  accessToken: string;
}

/**
 * Middleware to verify Shopify session in API routes
 */
export async function withShopifyAuth(handler: (req: NextApiRequest, res: NextApiResponse, session: ShopifySession) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Extract shop from query params or headers
      const shop = req.query.shop as string || req.headers['x-shopify-shop-domain'] as string;
      
      if (!shop) {
        return res.status(400).json({ error: 'Shop domain is required' });
      }

      // In a real implementation, you would validate the session token here
      // For now, we'll just pass the shop information
      
      const session: ShopifySession = {
        shop,
        accessToken: '' // Would come from your session management system
      };

      return await handler(req, res, session);
    } catch (error) {
      console.error('Shopify auth middleware error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  };
}

/**
 * Middleware to validate webhook signatures
 */
export async function withWebhookValidation(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Get required headers
      const hmac = req.headers['x-shopify-hmac-sha256'];
      const shopDomain = req.headers['x-shopify-shop-domain'];

      // Validate HMAC signature
      const isValid = validateHmacSignature(
        req.body,
        hmac,
        process.env.SHOPIFY_API_SECRET!
      );

      if (!isValid) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
      }

      if (!shopDomain) {
        console.error('Missing shop domain header');
        return res.status(400).json({ error: 'Bad Request: Missing shop domain' });
      }

      return await handler(req, res);
    } catch (error) {
      console.error('Webhook validation error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(maxRequests: number, windowMs: number) {
  const requests: Map<string, { count: number; resetTime: number }> = new Map();

  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const ip = req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || '127.0.0.1';
      const now = Date.now();
      const windowStart = now - windowMs;

      let requestRecord = requests.get(ip);

      if (!requestRecord || requestRecord.resetTime <= windowStart) {
        // Reset the counter
        requestRecord = { count: 1, resetTime: now + windowMs };
        requests.set(ip, requestRecord);
      } else {
        // Increment the counter
        requestRecord.count++;
        requests.set(ip, requestRecord);

        if (requestRecord.count > maxRequests) {
          return res.status(429).json({ error: 'Rate limit exceeded' });
        }
      }

      return await handler(req, res);
    };
  };
}