import { NextRequest } from 'next/server';
import AICoreService from '@/lib/ai-core-service';

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

    // Fetch revenue analytics from the Core AI Service
    const revenueData = await AICoreService.getStoreMetrics(storeId);
    
    if (!revenueData) {
      // According to project specifications, do not fall back to simulated data
      // Return a proper error response when Core AI Service endpoint is unavailable
      return new Response(JSON.stringify({ error: 'Revenue analytics endpoint not available in Core AI Service' }), {
        status: 502, // Bad Gateway - indicating the upstream service doesn't have the endpoint
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Return the revenue data from Core AI Service
    return new Response(JSON.stringify(revenueData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error retrieving revenue analytics:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
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