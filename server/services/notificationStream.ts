import { Response } from 'express';
import { logger } from '../../utils/logger';

interface NotificationPayload {
  type: 'order:new' | 'contact:new' | 'review:new';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

class NotificationStreamService {
  private clients: Set<Response> = new Set();

  /**
   * Register a new Admin Server-Sent Events (SSE) connection
   */
  addClient(res: Response): void {
    this.clients.add(res);
    logger.info(`[NotificationStream] New Admin SSE client connected. Active clients: ${this.clients.size}`);

    // Remove client when connection drops
    res.on('close', () => {
      this.clients.delete(res);
      logger.info(`[NotificationStream] Admin SSE client disconnected. Active clients: ${this.clients.size}`);
    });
  }

  /**
   * Broadcast real-time notification payload to all connected Admin clients
   */
  broadcast(payload: Omit<NotificationPayload, 'timestamp'>): void {
    const fullPayload: NotificationPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
    };

    const dataString = `data: ${JSON.stringify(fullPayload)}\n\n`;

    logger.info(`[NotificationStream] Broadcasting real-time event "${payload.type}" to ${this.clients.size} clients`);

    this.clients.forEach(client => {
      try {
        client.write(dataString);
      } catch (err) {
        logger.error('[NotificationStream] Failed to send SSE payload to client:', err);
        this.clients.delete(client);
      }
    });
  }
}

export const notificationStream = new NotificationStreamService();
