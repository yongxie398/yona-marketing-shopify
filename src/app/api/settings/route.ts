import { NextRequest } from 'next/server';
import logger from '@/utils/logger';

const BACKEND_URL = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
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

    // Get store from backend API
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/v1/stores/domain/${shopDomain}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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

    logger.info(`Updating settings for shop: ${shopDomain}`, { updates });

    // Update store via backend API
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/v1/stores/domain/${shopDomain}`, {
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
        config_updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Failed to update store via backend API: ${errorText}`);
      return new Response(JSON.stringify({ error: 'Failed to update store settings' }), {
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
    return new Response(JSON.stringify({ error: 'Failed to update store settings' }), {
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