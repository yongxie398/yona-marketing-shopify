import { NextRequest } from 'next/server';
import logger from '@/utils/logger';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// GET /api/analytics/revenue/[storeId] - Retrieve revenue analytics for a specific store
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    
    if (!storeId) {
      return new Response(JSON.stringify({ error: 'Missing storeId parameter' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Get timeRange from query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30days';

    logger.info(`Fetching revenue analytics for store ${storeId}, timeRange: ${timeRange}`);

    // Fetch revenue analytics from the backend API
    const response = await fetch(
      `${BACKEND_URL}/api/v1/analytics/revenue/${storeId}?time_range=${timeRange}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(`Backend API error: ${response.status}`, {
        context: 'RevenueAnalytics',
        metadata: { storeId, timeRange, error: errorData }
      });
      return new Response(
        JSON.stringify({ 
          error: errorData.detail || 'Failed to fetch revenue analytics from backend',
          status: response.status 
        }), 
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const revenueData = await response.json();
    
    logger.info(`Revenue analytics fetched successfully for store ${storeId}`, {
      context: 'RevenueAnalytics',
      metadata: { 
        storeId, 
        timeRange, 
        attributedRevenue: revenueData.attributed_revenue 
      }
    });

    // Transform backend data to include calculated fields for frontend
    const transformedData = {
      ...revenueData,
      // Use backend calculated values
      revenue_change: revenueData.revenue_change || 0,
      roi: revenueData.roi || (revenueData.attributed_revenue > 0 ? 
        (revenueData.attributed_revenue / (revenueData.total_messages_sent * 0.01)) : 0),
      roi_change: revenueData.roi_change || 0,
      revenue_per_recipient: revenueData.revenue_per_recipient || (revenueData.total_messages_sent > 0 ? 
        (revenueData.attributed_revenue / revenueData.total_messages_sent) : 0),
      revenue_per_recipient_change: revenueData.revenue_per_recipient_change || 0,
      conversion_rate: revenueData.conversion_rate || (revenueData.total_messages_sent > 0 ? 
        ((revenueData.attributed_orders || 0) / revenueData.total_messages_sent * 100) : 0),
      conversion_rate_change: revenueData.conversion_rate_change || 0,
    };

    // Return the revenue data
    return new Response(JSON.stringify(transformedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    logger.error('Error retrieving revenue analytics:', {
      context: 'RevenueAnalytics',
      error: error as Error,
    });
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
