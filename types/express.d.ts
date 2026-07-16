/**
 * Express Request Type Extensions
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions?: string[];
        name?: string;
        avatar?: string;
      };
    }
  }
}

export {};
