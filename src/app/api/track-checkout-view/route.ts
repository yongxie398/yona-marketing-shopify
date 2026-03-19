import { NextRequest } from 'next/server';
import logger from '@/utils/logger';
import eventQueue from '@/lib/event-queue';

/**
 * API endpoint to track checkout page views from storefront JavaScript
 * This is needed because Shopify webhooks don't fire on page refreshes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shop, checkoutToken, step, url, timestamp } = body;

    if (!shop || !checkoutToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: shop, checkoutToken' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find store in backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const storeResponse = await fetch(`${backendUrl}/api/v1/stores/domain/${shop}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!storeResponse.ok) {
      logger.warn(`Store not found for checkout view tracking: ${shop}`, {
        context: 'TrackCheckoutView',
        metadata: { shop, checkoutToken }
      });
      return new Response(
        JSON.stringify({ error: 'Store not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const store = await storeResponse.json();

    // Queue the checkout view event
    await eventQueue.enqueue({
      eventId: `checkout-view-${checkoutToken}-${Date.now()}`,
      storeId: store.id,
      eventType: 'checkouts/view',
      payload: {
        checkout_token: checkoutToken,
        step: step || 'unknown',
        url: url || '',
        viewed_at: timestamp || new Date().toISOString(),
        shop: shop
      }
    });

    logger.info('Checkout view tracked', {
      context: 'TrackCheckoutView',
      metadata: {
        shop,
        storeId: store.id,
        checkoutToken,
        step
      }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    logger.error('Error tracking checkout view', {
      context: 'TrackCheckoutView',
      error: error as Error,
      metadata: { errorMessage: error.message }
    });

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
