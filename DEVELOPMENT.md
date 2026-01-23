# Shopify App Service Development Guide

## Overview

This document provides guidelines for developing the Shopify App Service for the AI Revenue Agent. The Shopify App Service handles Shopify OAuth, webhooks, and provides an embedded admin interface for merchants.

## Architecture

The Shopify App Service is a Next.js application that runs as a separate deployable service from the Core AI Marketing Service. It handles:

- Shopify OAuth authentication
- Shopify webhook processing
- Embedded admin UI in Shopify admin
- Forwarding commerce events to the Core AI Service

## Tech Stack

- **Backend**: Next.js API routes (TypeScript)
- **Frontend**: React with Shopify App Bridge
- **Framework**: Next.js for SSR and Shopify embedding
- **Build Tool**: Next.js with Webpack
- **Package Manager**: npm/yarn

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Shopify Partner Account
- Shopify development store

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_APP_URL=your_app_url
NEXT_PUBLIC_SHOPIFY_API_KEY=your_shopify_api_key
CORE_AI_SERVICE_URL=http://localhost:8000  # URL of Core AI Service
CORE_AI_SERVICE_API_KEY=your_core_ai_service_api_key
BACKEND_API_URL=http://localhost:8000  # For API proxying
```

### Running Locally

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

The app will be available at http://localhost:3000

## Shopify Integration

### OAuth Flow

1. User installs app from Shopify App Store
2. Shopify redirects to OAuth URL with temporary code
3. App exchanges code for permanent access token
4. App stores shop data and token
5. App redirects to Shopify admin

### Webhook Processing

The app receives real-time events from Shopify through webhooks:

- `app/uninstalled` - App uninstalled
- `products/create` - New product added
- `products/update` - Product updated
- `customers/create` - New customer registered
- `customers/update` - Customer updated
- `orders/create` - New order placed
- `orders/update` - Order updated
- `checkouts/create` - New checkout started
- `checkouts/update` - Checkout updated (for abandonment detection)

Webhook events are validated and forwarded to the Core AI Service for processing.

## API Endpoints

### OAuth Endpoints

- `GET /api/auth` - OAuth callback handler

### Webhook Endpoints

- `POST /api/webhooks` - Shopify webhook receiver

### Proxy Endpoints

- `/api/*` - Proxies to Core AI Service

## Communication with Core AI Service

The Shopify App Service communicates with the Core AI Service through HTTP APIs:

### Outgoing Requests
- `POST /api/events/shopify` - Forward commerce events
- `POST /api/shops/register` - Register new shops

### Incoming Requests
- `GET /api/analytics/revenue/{tenant_id}` - Get revenue metrics
- `GET /api/configuration/{tenant_id}` - Get shop configuration

## Deployment

### Shopify Partner Dashboard

1. Create new app in Shopify Partner Dashboard
2. Set app URL to your deployed URL
3. Set callback URL to `{your_app_url}/api/auth`
4. Enable Admin API access with required scopes
5. Configure webhooks URL: `{your_app_url}/api/webhooks`

### Required Scopes

- `read_customers`, `write_customers`
- `read_products`, `write_products`
- `read_orders`, `write_orders`
- `read_checkouts`, `write_checkouts`
- `read_marketing_events`, `write_marketing_events`
- `read_content`, `read_analytics`
- `read_script_tags`, `write_script_tags`

## Security

### Shopify OAuth

- Use Shopify's OAuth 2.0 for secure authentication
- Validate HMAC signatures for all webhook requests
- Store access tokens securely

### Data Protection

- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Validate and sanitize all inputs

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

Test OAuth flow and webhook processing with a development store.

## Troubleshooting

### Common Issues

1. **OAuth Callback Errors**
   - Verify redirect URLs match Shopify Partner Dashboard settings
   - Check API key and secret

2. **Webhook Validation Failures**
   - Ensure webhook secret matches Shopify settings
   - Verify HMAC signature validation

3. **API Communication Issues**
   - Check Core AI Service URL and API key
   - Verify network connectivity