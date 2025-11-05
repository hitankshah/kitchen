// Security utility functions
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const validateCSRFToken = (token) => {
  // Basic CSRF token validation
  return Boolean(token && token.length >= 32 && /^[a-zA-Z0-9]+$/.test(token));
};

export const generateCSRFToken = () => {
  // Generate a random CSRF token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Rate limiting helper (client-side basic implementation)
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs; // 15 minutes by default
    this.attempts = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    // Reset if window has passed
    if (now - attempt.timestamp > this.windowMs) {
      this.attempts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    // Check if exceeded limit
    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    // Increment count
    attempt.count++;
    return true;
  }

  reset(identifier) {
    this.attempts.delete(identifier);
  }

  clear() {
    this.attempts.clear();
  }
}

// Create instances for login and signup
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const signupRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour
