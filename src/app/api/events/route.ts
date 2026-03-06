import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';
import eventQueue from '@/lib/event-queue';

/**
 * Storefront Event Tracking API
 * 
 * This endpoint receives tracking events from the Shopify storefront
 * (product views, add to cart, etc.) and forwards them to the AI engine.
 */

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    logger.info('Storefront event received', {
      context: 'StorefrontTracking',
      metadata: {
        event_type: eventData.event_type,
        store_id: eventData.store_id,
        customer_id: eventData.customer_id,
        page_url: eventData.page_url
      }
    });
    
    // Validate required fields
    if (!eventData.event_type || !eventData.store_id) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, store_id' },
        { status: 400 }
      );
    }
    
    // Map storefront events to AI engine event format
    const mappedEvent = mapStorefrontEvent(eventData);
    
    // Queue the event for processing
    await eventQueue.enqueue({
      eventId: `storefront_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      storeId: eventData.store_id,
      eventType: mappedEvent.eventType,
      payload: mappedEvent.payload,
      source: 'storefront'
    });
    
    logger.info('Storefront event queued for processing', {
      context: 'StorefrontTracking',
      metadata: {
        event_type: eventData.event_type,
        store_id: eventData.store_id
      }
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error: any) {
    logger.error('Error processing storefront event', {
      context: 'StorefrontTracking',
      error: error as Error,
      metadata: { errorMessage: error.message }
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Map storefront events to AI engine format
 */
function mapStorefrontEvent(eventData: any) {
  const eventType = eventData.event_type;
  const payload = eventData.payload || {};
  
  switch (eventType) {
    case 'product_view':
      return {
        eventType: 'product_view',
        payload: {
          verb: 'product_view',
          customer: {
            id: eventData.customer_id,
            email: eventData.customer_email
          },
          product: {
            id: payload.product_id,
            title: payload.product_title,
            type: payload.product_type,
            vendor: payload.product_vendor,
            price: payload.product_price,
            sku: payload.product_sku,
            variant_id: payload.variant_id
          },
          timestamp: eventData.timestamp,
          page_url: eventData.page_url,
          session_id: eventData.session_id
        }
      };
      
    case 'add_to_cart':
      return {
        eventType: 'cart_updated',
        payload: {
          verb: 'add_to_cart',
          customer: {
            id: eventData.customer_id,
            email: eventData.customer_email
          },
          line_items: [{
            product_id: payload.product_id,
            variant_id: payload.variant_id,
            quantity: payload.quantity,
            price: payload.price
          }],
          timestamp: eventData.timestamp
        }
      };
      
    case 'checkout_started':
      return {
        eventType: 'checkout_started',
        payload: {
          verb: 'checkout_started',
          customer: {
            id: eventData.customer_id,
            email: eventData.customer_email
          },
          cart_token: payload.cart_token,
          total_price: payload.cart_value,
          timestamp: eventData.timestamp
        }
      };
      
    case 'page_view':
      return {
        eventType: 'page_view',
        payload: {
          verb: 'page_view',
          customer: {
            id: eventData.customer_id,
            email: eventData.customer_email
          },
          page_type: payload.page_type,
          page_title: payload.page_title,
          referrer: payload.referrer,
          timestamp: eventData.timestamp
        }
      };
      
    default:
      // Pass through unknown events
      return {
        eventType: eventType,
        payload: {
          ...payload,
          customer: {
            id: eventData.customer_id,
            email: eventData.customer_email
          },
          timestamp: eventData.timestamp
        }
      };
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
