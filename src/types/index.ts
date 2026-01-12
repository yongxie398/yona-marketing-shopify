// Type definitions for the AI Revenue Agent for Shopify

export interface ShopifyWebhookPayload {
  id: string;
  [key: string]: any; // Allow additional properties depending on webhook type
}

export interface ShopifyAuthCallback {
  shop: string;
  hmac: string;
  code: string;
  state: string;
  timestamp: string;
}

export interface Store {
  id: string; // UUID in the actual database
  shop_domain: string;
  shop_name: string;
  access_token: string;
  hmac_secret: string;
  brand_voice: string;
  frequency_caps: {
    daily: number;
    weekly: number;
  };
  paused: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CommerceEvent {
  id: string;
  store_id: number;
  event_type: string;
  customer_id: string;
  product_ids: string[];
  payload: any;
  processed: boolean;
  created_at: Date;
}

export interface AIDecision {
  id: string;
  store_id: number;
  customer_id: string;
  event_id: string;
  decision_type: string;
  campaign_type: string;
  content_generated: string;
  scheduled_at: Date;
  executed_at?: Date;
  revenue_impact?: number;
  created_at: Date;
}

export interface MessageExecution {
  id: string;
  decision_id: string;
  customer_id: string;
  channel: string;
  subject: string;
  content: string;
  delivery_status: string;
  delivery_response?: any;
  delivered_at?: Date;
  opened_at?: Date;
  clicked_at?: Date;
  created_at: Date;
}

export interface CampaignConfig {
  id: string;
  type: 'browse_abandonment' | 'cart_abandonment' | 'checkout_abandonment' | 'post_purchase' | 'repeat_purchase';
  trigger_event: string;
  delay_hours: number;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}