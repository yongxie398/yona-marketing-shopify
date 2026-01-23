import { NextRequest } from 'next/server';

// GET /api/decisions - Retrieve AI decisions for a specific store
export async function GET(request: NextRequest) {
  try {
    // Extract storeId from query parameters
    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId');
    
    if (!storeId) {
      return new Response(JSON.stringify({ error: 'Missing storeId parameter' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Fetch AI decisions from the backend API
    const backendUrl = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/ai/decisions/${storeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const decisions = await response.json();
    
    // Transform the data to match the frontend structure
    const transformedDecisions = decisions.map((decision: any) => ({
      id: decision.id,
      type: decision.campaign_type.toLowerCase().replace(/\s+/g, '-'),
      title: formatDecisionTitle(decision.decision_type, decision.campaign_type),
      value: decision.revenue_impact ? `$${decision.revenue_impact.toFixed(2)}` : '',
      reason: formatDecisionReason(decision.decision_type, decision.campaign_type),
      result: formatDecisionResult(decision.decision_type, decision.campaign_type),
      timestamp: formatTimestamp(decision.created_at),
      impact: calculateImpact(decision.revenue_impact)
    }));

    return new Response(JSON.stringify(transformedDecisions), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error fetching AI decisions:', error);

    return new Response(JSON.stringify({ 
      error: 'Failed to fetch AI decisions',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Helper functions remain the same
function formatDecisionTitle(decision_type: string, campaign_type: string): string {
  const typeMap: { [key: string]: string } = {
    send: 'Send Campaign',
    skip: 'Skip Customer',
  };

  const campaignMap: { [key: string]: string } = {
    cart_abandonment: 'Cart Abandonment',
    browse_abandonment: 'Browse Abandonment',
    re_engagement: 'Re-engagement',
    post_purchase: 'Post Purchase',
  };

  return `${typeMap[decision_type] || decision_type} - ${campaignMap[campaign_type] || campaign_type}`;
}

function formatDecisionReason(decision_type: string, campaign_type: string): string {
  if (decision_type === 'skip') {
    return 'Customer fatigue limits exceeded or business rules indicate not to send';
  }
  return 'Customer behavior indicates opportunity for engagement';
}

function formatDecisionResult(decision_type: string, campaign_type: string): string {
  if (decision_type === 'send') {
    return 'Campaign will be sent';
  }
  return 'Customer will be skipped for now';
}

function formatTimestamp(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
}

function calculateImpact(revenue_impact: number): string {
  if (revenue_impact === undefined || revenue_impact === null) return 'N/A';
  if (revenue_impact > 100) return 'high';
  if (revenue_impact > 50) return 'medium';
  return 'low';
}