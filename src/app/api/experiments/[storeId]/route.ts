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

    logger.info(`Fetching experiments for store ${storeId}`, {
      context: 'Experiments',
      metadata: { storeId, timeRange }
    });

    // Call backend API
    const response = await fetch(
      `${BACKEND_URL}/api/v1/experiments/${storeId}?time_range=${timeRange}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error(`Backend returned ${response.status} for experiments`, {
        context: 'Experiments',
        metadata: { storeId, timeRange, status: response.status }
      });
      return new Response(
        JSON.stringify({ error: 'Failed to fetch experiments' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    logger.info(`Experiments fetched successfully`, {
      context: 'Experiments',
      metadata: { storeId, timeRange, experimentsCount: data.length }
    });

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('Error fetching experiments:', {
      context: 'Experiments',
      error: error as Error,
    });
    return new Response(
      JSON.stringify({ error: 'Failed to fetch experiments' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
