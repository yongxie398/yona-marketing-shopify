import { NextRequest } from 'next/server';
import logger from '@/utils/logger';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const API_TIMEOUT = 10000; // 10 seconds

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

    logger.info(`Fetching settings for shop: ${shopDomain}`);

    // Get store from backend API with cache-busting
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/v1/stores/domain/${shopDomain}?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      logger.error(`Backend returned ${response.status} for shop: ${shopDomain}`);
      return new Response(JSON.stringify({ error: 'Store not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const store = await response.json();
    
    logger.info(`Backend returned store data for ${shopDomain}`, {
      metadata: {
        brand_tone: store.brand_tone,
        frequency_caps: store.frequency_caps,
        paused: store.paused,
        config_updated_at: store.config_updated_at
      }
    });

    // Return the store configuration
    const storeConfig = {
      brand_voice: store.brand_tone,
      frequency_caps: store.frequency_caps,
      paused: store.paused,
      name: store.name,
      domain: store.domain,
      status: store.status,
      currency: store.currency,
      configUpdatedAt: store.config_updated_at,
      onboarding_complete: store.onboarding_complete,
    };

    return new Response(JSON.stringify(storeConfig), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('Error fetching store settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch store settings' }), {
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

    const updates = await request.json();

    logger.info(`Updating settings for shop: ${shopDomain}`, { metadata: { updates, backendUrl: BACKEND_URL } });

    // Update store via backend API
    const backendEndpoint = `${BACKEND_URL}/api/v1/stores/domain/${shopDomain}`;
    logger.info(`Calling backend endpoint: ${backendEndpoint}`);

    const response = await fetchWithTimeout(backendEndpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brand_tone: updates.brand_voice || updates.brandTone,
        frequency_caps: updates.frequency_caps || updates.frequencyCaps,
        paused: updates.paused,
        name: updates.name,
        status: updates.status,
        currency: updates.currency,
        onboarding_complete: updates.onboarding_complete,
        config_updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Failed to update store via backend API: ${response.status} - ${errorText}`);
      return new Response(JSON.stringify({ error: `Backend error: ${response.status} - ${errorText}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedStore = await response.json();

    return new Response(JSON.stringify({
      message: 'Settings updated successfully',
      store: updatedStore
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('Error updating store settings:', error);
    return new Response(JSON.stringify({ error: `Failed to update store settings: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop');

    if (!shopDomain) {
      return new Response(JSON.stringify({ error: 'Shop parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete store via backend API
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/v1/stores/domain/${shopDomain}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Failed to delete store via backend API: ${errorText}`);
      return new Response(JSON.stringify({ error: 'Failed to delete store' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const deletedStore = await response.json();

    return new Response(JSON.stringify({
      message: 'Store deleted successfully',
      store: deletedStore
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('Error deleting store:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete store' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}