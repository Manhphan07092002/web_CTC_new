// Analytics Tracking Service for Frontend
import { api } from './api';

// Generate or get session ID from localStorage
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
};

// Get user ID if logged in
const getUserId = (): string | undefined => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.id;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

export interface TrackEventData {
  eventType: 'page_view' | 'product_view' | 'contact_request' | 'quote_request' | 'purchase';
  productId?: string;
  metadata?: any;
}

class AnalyticsTracking {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = getSessionId();
    this.userId = getUserId();
  }

  // Track any event
  async trackEvent(data: TrackEventData): Promise<void> {
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE || `${window.location.protocol}//${window.location.hostname}:4000/api`;
      await fetch(`${apiBase}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: data.eventType,
          sessionId: this.sessionId,
          userId: this.userId,
          productId: data.productId,
          metadata: data.metadata,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Fail silently - don't disrupt user experience
    }
  }

  // Track page view
  trackPageView(page: string, metadata?: any): void {
    this.trackEvent({
      eventType: 'page_view',
      metadata: { page, ...metadata }
    });
  }

  // Track product view
  trackProductView(productId: string, productName: string, category?: string): void {
    this.trackEvent({
      eventType: 'product_view',
      productId,
      metadata: { productName, category }
    });
  }

  // Track contact request
  trackContactRequest(service: string, metadata?: any): void {
    this.trackEvent({
      eventType: 'contact_request',
      metadata: { service, ...metadata }
    });
  }

  // Track quote request
  trackQuoteRequest(productId?: string, metadata?: any): void {
    this.trackEvent({
      eventType: 'quote_request',
      productId,
      metadata
    });
  }

  // Track purchase
  trackPurchase(orderId: string, amount: number, products?: any[]): void {
    this.trackEvent({
      eventType: 'purchase',
      metadata: { orderId, amount, products }
    });
  }

  // Update user ID when user logs in
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Clear session (e.g., on logout)
  clearSession(): void {
    localStorage.removeItem('analytics_session_id');
    this.sessionId = getSessionId();
    this.userId = undefined;
  }
}

// Export singleton instance
export const analyticsTracking = new AnalyticsTracking();

// Export for use in components
export default analyticsTracking;
