// API endpoint for retrieving system metrics

import { NextRequest } from 'next/server';
import metricsService from '@/lib/metrics-service';
import logger from '@/utils/logger';

// GET /api/metrics - Retrieve metrics for a specific store
export async function GET(request: NextRequest) {
  try {
    // Extract shop domain from query parameters
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop');
    
    if (!shopDomain) {
      return new Response(JSON.stringify({ error: 'Missing shop parameter' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Validate store exists by calling backend API
    const backendUrl = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
    const storeResponse = await fetch(`${backendUrl}/api/v1/stores/domain/${shopDomain}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!storeResponse.ok) {
      return new Response(JSON.stringify({ error: 'Store not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const store = await storeResponse.json();

    // Get metrics for the specific store
    const metrics = await metricsService.getDatabaseMetrics(shopDomain);
    
    logger.info('Metrics endpoint accessed for store', {
      context: 'MetricsEndpoint',
      metadata: { shopDomain, ip: request.headers.get('x-forwarded-for') || 'unknown' }
    });
    
    return new Response(JSON.stringify(metrics), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    logger.error('Error in metrics endpoint:', {
      context: 'MetricsEndpoint',
      error: error as Error,
      metadata: { error_message: error.message }
    });
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}