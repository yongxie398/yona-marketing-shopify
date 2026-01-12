# AI Revenue Agent for Shopify

An autonomous AI agent designed to increase revenue for small e-commerce stores by observing shopper behavior, deciding optimal interventions, and communicating with customers automatically.

## Overview

The AI Revenue Agent for Shopify is the frontend and integration layer of the AI Revenue Agent for E-commerce. This service handles Shopify OAuth, webhooks, and provides an embedded admin interface for merchants to configure and manage their revenue recovery campaigns.

## Purpose

- Handles Shopify OAuth authentication
- Processes Shopify webhooks (orders, checkout, products)
- Serves embedded Admin UI (React/Next.js)
- Manages store/tenant onboarding
- Forwards commerce events to Core AI Service
- Implements AI decision engine for revenue optimization

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
- **Event Processing**: Commerce events processed by AI decision engine
- **Event Forwarding**: Commerce events forwarded to Core AI Service
- **Configuration Management**: Merchant settings and preferences

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Shopify Partner Account
- Shopify development store

### Environment Configuration

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Update the values in `.env.local` with your actual configuration:

```env
# Shopify App Configuration
SHOPIFY_API_KEY=your_actual_shopify_api_key
SHOPIFY_API_SECRET=your_actual_shopify_api_secret
SHOPIFY_APP_URL=https://your-app-url.ngrok.io  # Replace with your actual app URL
NEXT_PUBLIC_SHOPIFY_API_KEY=your_actual_shopify_api_key

# Core AI Service Configuration
CORE_AI_SERVICE_URL=http://localhost:8000  # URL of Core AI Service
CORE_AI_SERVICE_API_KEY=your_actual_core_ai_service_api_key

# Backend API Configuration
BACKEND_API_URL=http://localhost:8000  # For API proxying
```

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Key Features

- Shopify OAuth integration
- Webhook processing and validation
- Embedded admin UI
- Store configuration management
- AI-driven revenue optimization
- Event forwarding to AI Core Service

## Scaling Triggers

- Shopify webhook traffic
- Admin UI request volume
- AI decision processing load

## Communication with Core AI Service

This service communicates with the Core AI Marketing Service via HTTP API:

### Outgoing Requests (Shopify App → Core AI Service)
- POST /api/events/shopify
- POST /api/shops/register
- POST /api/messages/send
- Authentication via API key

### Incoming Requests (Core AI Service → Shopify App)
- GET /api/analytics/revenue/{tenant_id}
- GET /api/configuration/{tenant_id}
- Authentication via API key

## Security Considerations

- Shopify OAuth for secure app installation
- Shopify App Bridge for secure client communication
- JWT token validation for embedded app sessions
- Shopify HMAC signature validation for webhooks
- Admin session management
- Secure API communication with Core AI Service

## Data Flow

1. Shopify events received via webhooks
2. Events validated and normalized
3. Events processed by AI decision engine
4. AI decisions made based on behavioral patterns
5. Personalized messages generated and sent to customers
6. Revenue attribution tracked and reported

## Development

### Key Components

- `pages/api/auth.js`: Handles Shopify OAuth flow
- `pages/api/webhooks.js`: Processes incoming Shopify webhooks
- `src/services/ai-decision-engine.ts`: Core AI logic for decision making
- `src/lib/db.ts`: Database operations
- `src/utils/shopify.ts`: Shopify API utilities
- `src/app/page.tsx`: Main dashboard page

### Architecture Patterns

- Event-driven architecture
- Microservice communication
- Secure API design
- Type-safe TypeScript implementation

## Deployment

For production deployment, ensure you have:

- SSL certificate for your domain
- Properly configured environment variables
- Database setup for production
- Monitoring and logging solutions
- Security best practices implemented