import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// GET /api/scheduler/status - Retrieve scheduler status
export async function GET(request: NextRequest) {
  try {
    logger.info('Fetching scheduler status');

    // Fetch scheduler status from backend
    const response = await fetch(
      `${BACKEND_URL}/api/v1/scheduler/status`,
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
        context: 'SchedulerStatus',
        error: errorData
      });
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch scheduler status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    logger.info('Scheduler status fetched successfully', {
      context: 'SchedulerStatus',
      metadata: { running: data.running }
    });

    return NextResponse.json(data);
  } catch (error: any) {
    logger.error('Error fetching scheduler status:', {
      context: 'SchedulerStatus',
      error: error as Error,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/scheduler/trigger - Manually trigger scheduler
export async function POST(request: NextRequest) {
  try {
    logger.info('Triggering scheduler');

    const response = await fetch(
      `${BACKEND_URL}/api/v1/scheduler/trigger`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || 'Failed to trigger scheduler' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    logger.info('Scheduler triggered successfully', {
      context: 'SchedulerTrigger',
      metadata: data
    });

    return NextResponse.json(data);
  } catch (error: any) {
    logger.error('Error triggering scheduler:', {
      context: 'SchedulerTrigger',
      error: error as Error,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
