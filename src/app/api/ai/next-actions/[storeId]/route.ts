import { NextRequest } from 'next/server';
import AICoreService from '@/lib/ai-core-service';

// GET /api/ai/next-actions/[storeId] - Retrieve next AI actions for a specific store
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

    // Fetch next actions from the Core AI Service
    const nextActions = await AICoreService.getNextActions(storeId);
    
    if (!nextActions) {
      // According to project specifications, do not fall back to simulated data
      // Return a proper error response when Core AI Service endpoint is unavailable
      return new Response(JSON.stringify({ error: 'Next actions endpoint not available in Core AI Service' }), {
        status: 502, // Bad Gateway - indicating the upstream service doesn't have the endpoint
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Return the next actions from Core AI Service
    return new Response(JSON.stringify(nextActions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error retrieving next actions:', error);
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