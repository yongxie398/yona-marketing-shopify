import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shop = searchParams.get('shop');
    
    if (!shop) {
      return Response.json(
        { error: 'Missing shop parameter' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    // Fetch store information
    const storeResponse = await fetch(`${backendUrl}/api/v1/stores/domain/${shop}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!storeResponse.ok) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const store = await storeResponse.json();

    // Fetch subscription information to check if user has active subscription
    let hasActiveSubscription = false;
    try {
      const subscriptionResponse = await fetch(`${backendUrl}/api/v1/billing/stores/${store.id}/subscription`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (subscriptionResponse.ok) {
        const subscription = await subscriptionResponse.json();
        hasActiveSubscription = subscription.status === 'active' || subscription.status === 'pending';
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error);
      // Continue without subscription info - assume no active subscription
    }

    // Return store information including onboarding status and subscription status
    return Response.json({
      storeId: store.id,
      domain: store.domain,
      name: store.name,
      status: store.status,
      createdAt: store.created_at,
      updatedAt: store.updated_at,
      configUpdatedAt: store.config_updated_at,
      onboardingComplete: store.onboarding_complete,
      onboardingStep: store.onboarding_step,
      brandTone: store.brand_tone,
      hasActiveSubscription,
    });
  } catch (error) {
    console.error('Error fetching store info:', error);
    return Response.json(
      { error: 'Failed to fetch store information' },
      { status: 500 }
    );
  }
}