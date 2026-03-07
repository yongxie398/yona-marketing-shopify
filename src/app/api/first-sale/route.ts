import { NextRequest } from 'next/server';
import logger from '@/utils/logger';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const API_TIMEOUT = 10000;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = API_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop');

    if (!shopDomain) {
      return new Response(JSON.stringify({ error: 'Shop parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    logger.info(`Checking first sale status for shop: ${shopDomain}`);

    // Call backend API
    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/v1/stores/domain/${encodeURIComponent(shopDomain)}/first-sale`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );

    if (!response.ok) {
      logger.error(`Backend returned ${response.status} for shop: ${shopDomain}`);
      return new Response(JSON.stringify({ error: 'Failed to check first sale status' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    logger.info(`First sale check for ${shopDomain}:`, { metadata: data });

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('Error checking first sale status:', error);
    return new Response(JSON.stringify({ error: 'Failed to check first sale status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop');

    if (!shopDomain) {
      return new Response(JSON.stringify({ error: 'Shop parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    logger.info(`Marking first sale celebration as shown for shop: ${shopDomain}`);

    // Call backend API
    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/v1/stores/domain/${encodeURIComponent(shopDomain)}/first-sale`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error(`Failed to mark celebration as shown: ${response.status}`);
      return new Response(JSON.stringify({ error: 'Failed to mark celebration as shown' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('Error marking celebration as shown:', error);
    return new Response(JSON.stringify({ error: 'Failed to mark celebration as shown' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Endpoint to simulate first sale (for testing)
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop');

    if (!shopDomain) {
      return new Response(JSON.stringify({ error: 'Shop parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json().catch(() => ({}));
    logger.info(`Simulating first sale for shop: ${shopDomain}`);

    // Call backend API
    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/v1/stores/domain/${encodeURIComponent(shopDomain)}/first-sale`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      logger.error(`Failed to simulate first sale: ${response.status}`);
      return new Response(JSON.stringify({ error: 'Failed to simulate first sale' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('Error simulating first sale:', error);
    return new Response(JSON.stringify({ error: 'Failed to simulate first sale' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
