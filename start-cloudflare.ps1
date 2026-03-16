# Cloudflare Tunnel Start Script
# This script starts Cloudflare tunnel with proper path-based routing
#
# ROUTING CONFIGURATION:
# ======================
# Backend (FastAPI - port 8000):
#   - /api/v1/*         -> Backend API endpoints
#   - /r/*              -> Tracking links
#   - /api/billing/shopify-callback  -> Billing callback (Shopify calls this)
#
# Frontend (Next.js - port 3001):
#   - /api/auth/*       -> OAuth flow
#   - /api/webhooks     -> Shopify webhooks
#   - /api/billing/*    -> Billing endpoints (except callback)
#   - /api/ai/*         -> AI endpoints
#   - /api/analytics/*  -> Analytics
#   - /api/*            -> All other API routes
#   - /*                -> All page routes
#
# Setup Instructions:
# 1. Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
# 2. Authenticate: cloudflared tunnel login
# 3. Create tunnel: cloudflared tunnel create shopify-dev
# 4. Create DNS route: cloudflared tunnel route dns shopify-dev shopify-dev.yonamark.com
# 5. Copy this config to: ~/.cloudflared/shopify-dev.yml
# 6. Run: cloudflared tunnel run shopify-dev
#
# Config file (~/.cloudflared/shopify-dev.yml):
#   tunnel: <your-tunnel-id>
#   credentials-file: C:\Users\<user>\.cloudflared\<tunnel-id>.json
#   ingress:
#     # Backend routes
#     - hostname: shopify-dev.yonamark.com
#       path: /api/v1/*
#       service: http://localhost:8000
#     - hostname: shopify-dev.yonamark.com
#       path: /r/*
#       service: http://localhost:8000
#     - hostname: shopify-dev.yonamark.com
#       path: /api/billing/shopify-callback
#       service: http://localhost:8000
#     # Frontend routes
#     - hostname: shopify-dev.yonamark.com
#       path: /api/auth/*
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/webhooks
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/billing/plans
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/billing/subscribe
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/billing/dashboard
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/billing/upgrade
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/billing/calculate-savings
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/scheduler/status
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/ai/*
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/analytics/*
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/events
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/metrics
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/activity
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/decisions
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/settings
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/first-sale
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/experiments/*
#       service: http://localhost:3001
#     - hostname: shopify-dev.yonamark.com
#       path: /api/store-info
#       service: http://localhost:3001
#     # Frontend catch-all
#     - hostname: shopify-dev.yonamark.com
#       service: http://localhost:3001
#     - service: http_status:404

# Configuration
$TUNNEL_NAME = "shopify-dev"
$FRONTEND_PORT = 3001
$BACKEND_PORT = 8000

# Clear proxy environment variables (if any)
$env:HTTP_PROXY = ''
$env:HTTPS_PROXY = ''
$env:http_proxy = ''
$env:https_proxy = ''

# Check if cloudflared is installed
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    Write-Host "Error: cloudflared is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install it from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/" -ForegroundColor Yellow
    exit 1
}

# Main execution
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Cloudflare Tunnel Launcher" -ForegroundColor Green
Write-Host "  (Path-based Routing)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Starting tunnel: $TUNNEL_NAME" -ForegroundColor Cyan
Write-Host ""
Write-Host "ROUTING CONFIGURATION:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend (FastAPI - port $BACKEND_PORT):" -ForegroundColor Gray
Write-Host "  /api/v1/*         -> Backend API" -ForegroundColor Gray
Write-Host "  /r/*              -> Tracking links" -ForegroundColor Gray
Write-Host "  /api/billing/shopify-callback -> Billing callback" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend (Next.js - port $FRONTEND_PORT):" -ForegroundColor Gray
Write-Host "  /api/auth/*       -> OAuth flow" -ForegroundColor Gray
Write-Host "  /api/webhooks     -> Shopify webhooks" -ForegroundColor Gray
Write-Host "  /api/billing/*    -> Billing endpoints" -ForegroundColor Gray
Write-Host "  /api/ai/*         -> AI endpoints" -ForegroundColor Gray
Write-Host "  /api/analytics/*  -> Analytics" -ForegroundColor Gray
Write-Host "  /api/*            -> Other API routes" -ForegroundColor Gray
Write-Host "  /*                -> Page routes" -ForegroundColor Gray
Write-Host ""
Write-Host "Make sure you have created the config file:" -ForegroundColor Yellow
Write-Host "  ~/.cloudflared/$TUNNEL_NAME.yml" -ForegroundColor White
Write-Host ""
Write-Host "Starting tunnel..." -ForegroundColor Green
Write-Host ""

# Start the tunnel
cloudflared tunnel run $TUNNEL_NAME
