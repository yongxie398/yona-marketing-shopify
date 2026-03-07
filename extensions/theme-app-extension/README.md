# AI Revenue Agent - Theme App Extension

This theme extension adds storefront tracking to your Shopify store, enabling the AI Revenue Agent to track:
- Product views (for browse abandonment campaigns)
- Add to cart events
- Checkout started events
- Page navigation

## Installation

### Step 1: Deploy the Extension

1. Make sure you have Shopify CLI installed:
```bash
npm install -g @shopify/cli
```

2. Navigate to your app directory and deploy the extension:
```bash
cd yona-marketing-shopify
shopify app deploy
```

3. Follow the prompts to deploy the extension to your Shopify Partners account.

### Step 2: Install the Extension Block

After deploying, merchants need to add the tracking block to their theme:

1. Go to **Online Store** > **Themes** in Shopify Admin
2. Click **Customize** on the active theme
3. In the left sidebar, click **Add section** or navigate to an existing section
4. Look for **AI Revenue Agent Tracking** in the app blocks section
5. Add the block to the theme (recommended: add to the body or header section for global tracking)
6. Configure the settings:
   - **API Endpoint**: Set to your app's event endpoint (e.g., `https://your-app.com/api/events`)
   - **Debug Mode**: Enable for troubleshooting (shows console logs)

### Step 3: Verify Installation

1. Visit a product page on your storefront
2. Open browser DevTools (F12)
3. Check the Console for `[AI Revenue Agent]` logs (if debug mode is enabled)
4. Check your app's backend logs to confirm events are being received

## How It Works

The tracking script:
1. Loads on every page of the storefront
2. Detects customer activity (product views, add to cart, etc.)
3. Sends events to your app's `/api/events` endpoint
4. Events are queued and processed by the AI engine
5. AI triggers appropriate campaigns (browse abandonment, cart abandonment, etc.)

## Privacy & Compliance

- Only tracks logged-in customers (uses `{{ customer.id }}`)
- Respects Shopify's privacy settings
- No tracking of guest/anonymous users
- Session-based tracking with no persistent cookies

## Troubleshooting

### Events not showing up?
1. Check browser console for errors
2. Enable **Debug Mode** in the block settings
3. Verify the API endpoint URL is correct
4. Check your app's backend logs for incoming requests

### CORS errors?
Make sure your app's `/api/events` endpoint allows cross-origin requests from Shopify storefront domains.

### Customer ID is empty?
The customer must be logged in for tracking to work. Anonymous browsing is not tracked for privacy compliance.

## Technical Details

### Event Schema

Events are sent with the following structure:
```json
{
  "event_type": "product_view",
  "store_id": "12345",
  "store_domain": "mystore.myshopify.com",
  "customer_id": "67890",
  "customer_email": "customer@example.com",
  "session_id": "sess_1234567890_abc123",
  "timestamp": "2026-03-03T10:30:00.000Z",
  "page_url": "https://mystore.com/products/example-product",
  "payload": {
    "product_id": "98765",
    "product_title": "Example Product",
    "product_price": 29.99
  }
}
```

### Supported Events

- `product_view` - Customer views a product page
- `add_to_cart` - Customer adds item to cart
- `checkout_started` - Customer enters checkout
- `page_view` - Customer navigates to any page

## Support

For issues or questions, contact support or check the main app documentation.
