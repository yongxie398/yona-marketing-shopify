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
- PostgreSQL database

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

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
DB_USER=postgres
DB_HOST=localhost
DB_NAME=yona_marketing
DB_PASSWORD=postgres
DB_PORT=5432

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

### Shopify Integration

To install and test the app in Shopify:

1. Ensure your app is accessible from the internet (use ngrok for local development)
2. Update `SHOPIFY_APP_URL` in your environment variables
3. Visit: `https://your-development-store.myshopify.com/admin/apps`
4. Click "Manage private apps" or upload the app
5. Install the app using the OAuth flow

The app will automatically register webhooks and begin processing commerce events.

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

## Database Schema

The application requires the following database tables:

- `stores`: Store configuration and credentials
- `events`: Commerce events from Shopify
- `ai_decisions`: AI-generated decisions
- `email_delivery_logs`: Message delivery logs
- `revenue_attributions`: Revenue attribution tracking

Run the migration script to set up the tables:

```bash
psql -d your_database_name -f migrate-store-config-table.sql
```

## Development

### Key Components

- `src/app/api/auth/begin/route.ts`: Handles Shopify OAuth initiation
- `src/app/api/auth/callback/route.ts`: Handles Shopify OAuth callback and token exchange
- `src/app/api/webhooks/route.ts`: Processes incoming Shopify webhooks
- `src/services/ai-decision-engine.ts`: Core AI logic for decision making
- `src/lib/db.ts`: Database operations
- `src/utils/shopify.ts`: Shopify API utilities
- `src/app/page.tsx`: Main dashboard page
- `src/app/layout.tsx`: Root layout with App Bridge integration

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