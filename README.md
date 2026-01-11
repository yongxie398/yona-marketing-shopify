# Shopify App Service - AI Revenue Agent

## Overview

The Shopify App Service is the frontend and integration layer of the AI Revenue Agent for E-commerce. This service handles Shopify OAuth, webhooks, and provides an embedded admin interface for merchants to configure and manage their revenue recovery campaigns.

## Purpose

- Handles Shopify OAuth authentication
- Processes Shopify webhooks (orders, checkout, products)
- Serves embedded Admin UI (React/Next.js)
- Manages store/tenant onboarding
- Forwards commerce events to Core AI Service

## Tech Stack

- **Backend**: Next.js API routes (TypeScript)
- **Frontend**: React with Shopify App Bridge
- **Framework**: Next.js for SSR and Shopify embedding
- **Build Tool**: Next.js with Webpack
- **Package Manager**: npm/yarn
- **Embedding**: Shopify Polaris design system
- **Authentication**: Shopify OAuth with JWT tokens
- **Communication**: App Bridge for secure admin communication

## Architecture

This service follows the suggested approach with TypeScript/Node.js for Shopify-facing operations:

- **Shopify Integration**: OAuth, webhooks, and API communication
- **Embedded UI**: React components embedded in Shopify admin
- **Event Forwarding**: Commerce events forwarded to Core AI Service
- **Configuration Management**: Merchant settings and preferences

## Key Features

- Shopify OAuth integration
- Webhook processing and validation
- Embedded admin UI
- Store configuration management
- Event forwarding to AI Core Service

## Scaling Triggers

- Shopify webhook traffic
- Admin UI request volume

## Communication with Core AI Service

This service communicates with the Core AI Marketing Service via HTTP API:

### Outgoing Requests (Shopify App → Core AI Service)
- POST /events/shopify/checkout_abandoned
- POST /events/shopify/product_viewed
- POST /events/shopify/order_completed
- Authentication via API key

### Incoming Requests (Core AI Service → Shopify App)
- GET /analytics/revenue/{tenant_id}
- GET /configuration/{tenant_id}
- Authentication via API key

## Security Considerations

- Shopify OAuth for secure app installation
- Shopify App Bridge for secure client communication
- JWT token validation for embedded app sessions
- Shopify HMAC signature validation for webhooks
- Admin session management

## Data Flow

1. Shopify events received via webhooks
2. Events validated and normalized
3. Events forwarded to Core AI Service via HTTP API
4. UI requests served from embedded admin interface