import Redis from 'ioredis';

// Instance Redis connection outside the handler to reuse connection in hot serverless instances.
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

/**
 * Basic Redis-backed rate limiter for serverless environments using ioredis.
 * Uses a fixed-window counter strategy.
 */
export async function applyRateLimit(req, res, { limit = 10, windowMs = 60000 } = {}) {
  if (!redis) {
    console.warn('REDIS_URL not configured. Rate limiting bypassed.');
    return true;
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  
  // Fixed window strategy: create a unique key per time window
  const currentWindow = Math.floor(Date.now() / windowMs);
  const key = `ratelimit:${ip}:${currentWindow}`;

  try {
    const count = await redis.incr(key);
    
    if (count === 1) {
      // Set expiry on the key to clean up automatically.
      // We give it a buffer of 2x the window to be safe.
      await redis.expire(key, Math.ceil(windowMs / 1000) * 2); 
    }

    if (count > limit) {
      return false; // Rate limit exceeded
    }

    return true; // Allowed
  } catch (error) {
    // Fallback if Redis is down or fails: allow request but log error
    console.error('Rate limit Redis error:', error);
    return true;
  }
}
