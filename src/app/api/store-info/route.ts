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

    // Query the backend API to get the store information
    const backendUrl = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/stores/domain/${shop}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const store = await response.json();

    // Return store information in the same format as before
    return Response.json({
      storeId: store.id,
      domain: store.domain,
      name: store.name,
      status: store.status,
      createdAt: store.created_at,
      updatedAt: store.updated_at,
      configUpdatedAt: store.config_updated_at,
    });
  } catch (error) {
    console.error('Error fetching store info:', error);
    return Response.json(
      { error: 'Failed to fetch store information' },
      { status: 500 }
    );
  }
}