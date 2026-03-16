import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { formatTimeAgo } from '@/utils/formatters';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// GET /api/activity - Retrieve AI activity feed for a store
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const limit = searchParams.get('limit') || '50';
    const days = searchParams.get('days') || '7';
    const activityType = searchParams.get('type');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId is required' },
        { status: 400 }
      );
    }

    logger.info(`Fetching activity feed for store ${storeId}`);

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    queryParams.append('days', days);
    if (activityType) queryParams.append('activity_type', activityType);

    // Fetch activity feed from backend
    const response = await fetch(
      `${BACKEND_URL}/api/v1/billing/stores/${storeId}/activity-feed?${queryParams.toString()}`,
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
        context: 'ActivityFeed',
        metadata: { storeId, error: errorData }
      });
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch activity feed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    logger.info(`Activity feed fetched successfully for store ${storeId}`, {
      context: 'ActivityFeed',
      metadata: { storeId, count: data.activities?.length || 0 }
    });

    // Transform backend data to frontend format
    const transformedActivities = data.activities?.map((activity: any) => ({
      id: activity.id,
      type: mapActivityType(activity.type),
      action: getActionText(activity),
      reasoning: activity.description || '',
      time: formatTimeAgo(activity.timestamp),
      revenue: activity.attributed_revenue,
      customer: activity.customer?.first_name || activity.customer?.email,
      campaign: activity.campaign_type,
      icon: activity.icon,
      color: activity.color,
    })) || [];

    return NextResponse.json({
      activities: transformedActivities,
      totalCount: data.total_count || 0,
      storeId: data.store_id,
    });
  } catch (error: any) {
    logger.error('Error fetching activity feed:', {
      context: 'ActivityFeed',
      error: error as Error,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Map backend activity types to frontend types
function mapActivityType(type: string): 'decision' | 'conversion' | 'learning' {
  switch (type) {
    case 'send':
      return 'decision';
    case 'skip':
      return 'decision';
    default:
      if (type?.includes('conversion') || type?.includes('revenue')) {
        return 'conversion';
      }
      return 'learning';
  }
}

// Get action text based on activity
function getActionText(activity: any): string {
  const { type, campaign_type, attributed_revenue } = activity;
  
  if (attributed_revenue && attributed_revenue > 0) {
    return 'Revenue recovered';
  }
  
  if (type === 'send') {
    return `Sent ${campaign_type?.replace('_', ' ') || 'campaign'} email`;
  }
  
  if (type === 'skip') {
    return 'Skipped customer';
  }
  
  return 'AI activity';
}
