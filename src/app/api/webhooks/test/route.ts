import { NextRequest } from 'next/server';
import logger from '@/utils/logger';

/**
 * Test endpoint for webhooks - no signature verification
 * Use this to verify webhooks are reaching your server
 */
export async function POST(request: NextRequest) {
  try {
    const shop = request.headers.get('x-shopify-shop-domain');
    const topic = request.headers.get('x-shopify-topic');
    const payload = await request.text();
    
    logger.info('TEST WEBHOOK RECEIVED', {
      context: 'WebhookTest',
      metadata: {
        shop,
        topic,
        payloadSize: payload.length,
        headers: {
          'x-shopify-topic': topic,
          'x-shopify-shop-domain': shop,
          'x-shopify-webhook-id': request.headers.get('x-shopify-webhook-id'),
        }
      }
    });
    
    // Log the payload for debugging
    try {
      const data = JSON.parse(payload);
      logger.info('TEST WEBHOOK PAYLOAD', {
        context: 'WebhookTest',
        metadata: {
          topic,
          id: data.id,
          token: data.token,
          checkout_token: data.checkout_token,
        }
      });
    } catch (e) {
      logger.warn('Could not parse webhook payload as JSON', {
        context: 'WebhookTest',
        metadata: { payload: payload.substring(0, 200) }
      });
    }
    
    return new Response('OK', { status: 200 });
  } catch (error: any) {
    logger.error('Error in test webhook handler', {
      context: 'WebhookTest',
      error: error as Error,
      metadata: { errorMessage: error.message }
    });
    return new Response('Error', { status: 500 });
  }
}
