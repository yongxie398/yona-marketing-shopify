import { NextRequest } from 'next/server';
import logger from '@/utils/logger';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30days';

    if (!storeId) {
      return new Response(
        JSON.stringify({ error: 'Store ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info(`Fetching AI insights for store ${storeId}`, {
      context: 'AIInsights',
      metadata: { storeId, timeRange }
    });

    // Call backend API
    const response = await fetch(
      `${BACKEND_URL}/api/v1/ai/insights/${storeId}?time_range=${timeRange}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error(`Backend returned ${response.status} for AI insights`, {
        context: 'AIInsights',
        metadata: { storeId, timeRange, status: response.status }
      });
      return new Response(
        JSON.stringify({ error: 'Failed to fetch AI insights' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    logger.info(`AI insights fetched successfully`, {
      context: 'AIInsights',
      metadata: { storeId, timeRange, insightsCount: data.length }
    });

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('Error fetching AI insights:', {
      context: 'AIInsights',
      error: error as Error,
    });
    return new Response(
      JSON.stringify({ error: 'Failed to fetch AI insights' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
