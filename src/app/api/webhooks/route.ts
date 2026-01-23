import { NextRequest } from 'next/server';
import crypto from 'crypto';
import aiCoreService from '@/lib/ai-core-service';
import eventQueue from '@/lib/event-queue';
import logger from '@/utils/logger';
import metricsService from '@/lib/metrics-service';

// Utility function to verify webhook signatures
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');  // Use base64 format to match Shopify's format
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8')
  );
}

export async function POST(request: NextRequest) {
  try {
    // Extract headers
    const shop = request.headers.get('x-shopify-shop-domain');
    const signature = request.headers.get('x-shopify-hmac-sha256');
    
    if (!shop) {
      return new Response('Missing shop domain', { status: 400 });
    }
    
    // Get the raw payload
    const payload = await request.text();
    
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('Webhook secret not configured', {
        context: 'WebhookHandler',
        metadata: { shop }
      });
      return new Response('Webhook secret not configured', { status: 500 });
    }
    
    // Verify the signature
    if (!verifySignature(payload, signature!, webhookSecret)) {
      logger.warn('Invalid webhook signature', {
        context: 'WebhookHandler',
        metadata: { shop, signature }
      });
      return new Response('Invalid signature', { status: 401 });
    }
    
    // Parse the payload
    const webhookData = JSON.parse(payload);
    
    logger.info('Webhook received', {
      context: 'WebhookHandler',
      metadata: { 
        shop, 
        eventType: request.headers.get('x-shopify-topic'),
        eventId: webhookData.id || 'unknown'
      }
    });
    
    // Find store in backend API
    const backendUrl = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
    const storeResponse = await fetch(`${backendUrl}/api/v1/stores/domain/${shop}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!storeResponse.ok) {
      logger.error(`Store not found for webhook: ${shop}`, {
        context: 'WebhookHandler',
        metadata: { shop, eventType: request.headers.get('x-shopify-topic') }
      });
      return new Response('Store not found', { status: 404 });
    }
    
    const store = await storeResponse.json();
    
    // Handle specific webhook events
    const topic = request.headers.get('x-shopify-topic');
    
    if (topic === 'app/uninstalled') {
      // Update store status to uninstalled
      const updateResponse = await fetch(`${backendUrl}/api/v1/stores/domain/${shop}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'uninstalled' })
      });
      
      if (updateResponse.ok) {
        logger.info('Successfully updated store status to uninstalled', {
          context: 'WebhookHandler',
          metadata: { shop }
        });
      } else {
        const errorText = await updateResponse.text();
        logger.error('Failed to update store status to uninstalled', {
          context: 'WebhookHandler',
          error: new Error(errorText),
          metadata: { shop }
        });
      }
    }
    
    // Add the event to the queue for processing by the AI engine (best practice)
    await eventQueue.enqueue({
      eventId: webhookData.id || Date.now().toString(),
      storeId: store.id,
      eventType: topic!,
      payload: webhookData
    });
    
    logger.info('Event queued for AI processing', {
      context: 'WebhookHandler',
      metadata: { shop, eventType: topic, storeId: store.id }
    });
    
    // Update metrics
    metricsService.recordEventReceived(shop);
    
    logger.info('Webhook processed successfully', {
      context: 'WebhookHandler',
      metadata: { shop, eventType: topic }
    });
    
    return new Response('OK', { status: 200 });
  } catch (error: any) {
    logger.error('Error processing webhook', {
      context: 'WebhookHandler',
      error: error as Error,
      metadata: { errorMessage: error.message }
    });
    
    return new Response('Internal Server Error', { status: 500 });
  }
}