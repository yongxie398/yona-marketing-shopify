import { NextRequest } from 'next/server';
import { DatabaseService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Extract shop domain from query parameters
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop');

    if (!shopDomain) {
      return Response.json(
        { error: 'Shop domain is required' }, 
        { status: 400 }
      );
    }

    // Get store from database
    const store = await DatabaseService.getStoreByDomain(shopDomain);
    if (!store) {
      return Response.json(
        { error: 'Store not found' }, 
        { status: 404 }
      );
    }

    // Get settings from the stores table which already contains configuration fields
    const settings = {
      brand_voice: store.brand_voice,
      frequency_caps: store.frequency_caps,
      paused: store.paused,
    };
    
    return Response.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract shop domain from query parameters
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop');

    if (!shopDomain) {
      return Response.json(
        { error: 'Shop domain is required' }, 
        { status: 400 }
      );
    }

    // Parse request body
    const { brand_voice, frequency_caps, paused } = await request.json();

    // Get store from database
    const store = await DatabaseService.getStoreByDomain(shopDomain);
    if (!store) {
      return Response.json(
        { error: 'Store not found' }, 
        { status: 404 }
      );
    }

    // Update settings in the stores table which already contains configuration fields
    const updateSettingsQuery = `
      UPDATE stores 
      SET brand_voice = $1, frequency_caps = $2, paused = $3, config_updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `;
    
    const client = await DatabaseService.getClient();
    await client.query(updateSettingsQuery, [brand_voice, frequency_caps, paused, store.id]);
    client.release();

    return Response.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}