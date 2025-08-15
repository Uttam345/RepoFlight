import { Router } from 'express';
import { validateGitHubSignature, GitHubUtils } from '@repoflight/shared';
import { WebhookService } from '../services/webhook-service';
import { ValidationError } from '../middleware/error-handler';

const router = Router();
const webhookService = new WebhookService();

/**
 * GitHub webhook endpoint
 */
router.post('/', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const event = req.headers['x-github-event'] as string;
    const delivery = req.headers['x-github-delivery'] as string;
    const payload = req.body;

    // Validate required headers
    if (!signature || !event || !delivery) {
      throw new ValidationError('Missing required webhook headers');
    }

    // Validate webhook signature
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('GitHub webhook secret not configured');
    }

    const payloadString = payload.toString();
    if (!validateGitHubSignature(payloadString, signature, webhookSecret)) {
      throw new ValidationError('Invalid webhook signature');
    }

    // Parse payload
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadString);
    } catch (error) {
      throw new ValidationError('Invalid JSON payload');
    }

    // Process webhook event

    // Process webhook based on event type
    let result;
    switch (event) {
      case 'push':
        result = await webhookService.handlePushEvent(parsedPayload);
        break;
      case 'pull_request':
        result = await webhookService.handlePullRequestEvent(parsedPayload);
        break;
      case 'release':
        result = await webhookService.handleReleaseEvent(parsedPayload);
        break;
      default:
        // Ignoring unsupported webhook event
        result = { message: `Event ${event} ignored` };
    }

    res.json({
      success: true,
      data: {
        event,
        delivery,
        processed: true,
        result,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
        version: 'v1',
      },
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // For webhook validation errors, return 400
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEBHOOK_VALIDATION_FAILED',
          message: error.message,
        },
      });
    }

    // For other errors, return 500
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: 'Failed to process webhook',
      },
    });
  }
});

/**
 * Webhook configuration endpoint
 */
router.get('/config', (req, res) => {
  const config = {
    events: ['push', 'pull_request', 'release'],
    contentType: 'application/json',
    secret: process.env.GITHUB_WEBHOOK_SECRET ? 'configured' : 'not_configured',
    url: `${process.env.BASE_URL || 'http://localhost:3001'}/webhook`,
  };

  res.json({
    success: true,
    data: config,
  });
});

export { router as webhookRoutes };