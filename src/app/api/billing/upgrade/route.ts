import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');

    if (!storeId) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }

    logger.info(`Upgrading plan for store ${storeId}`);

    const response = await fetch(`${BACKEND_URL}/api/v1/billing/stores/${storeId}/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(`Backend API error: ${response.status}`, {
        context: 'BillingUpgrade',
        metadata: { storeId, error: errorData }
      });
      return NextResponse.json(
        { error: errorData.detail || 'Failed to upgrade plan' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    logger.info(`Plan upgraded successfully for store ${storeId}`, {
      context: 'BillingUpgrade',
      metadata: { storeId, newPlan: data.new_plan }
    });
    
    return NextResponse.json(data);
  } catch (error: any) {
    logger.error('Error upgrading plan:', {
      context: 'BillingUpgrade',
      error: error as Error,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
