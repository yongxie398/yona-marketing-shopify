import { verifyWebhook } from '@shopify/koa-shopify-webhooks';

const webhook = {
  async post(req, res) {
    try {
      // Verify the webhook signature
      const { isValid, topic, shop_domain, body } = await verifyWebhook({
        rawBody: req.body,
        rawHeaders: req.headers,
        webhookSecret: process.env.SHOPIFY_API_SECRET
      });

      if (!isValid) {
        return res.status(401).send('Unauthorized: Invalid webhook signature');
      }

      // Forward the event to Core AI Service
      const aiServiceResponse = await fetch(`${process.env.CORE_AI_SERVICE_URL}/api/events/shopify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CORE_AI_SERVICE_API_KEY}`
        },
        body: JSON.stringify({
          topic,
          shop_domain,
          data: body,
          timestamp: new Date().toISOString()
        })
      });

      if (!aiServiceResponse.ok) {
        console.error('Failed to forward event to AI service:', await aiServiceResponse.text());
      }

      res.status(200).send('Webhook received');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Internal Server Error');
    }
  }
};

export default webhook;