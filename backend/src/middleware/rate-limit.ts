import type { RequestHandler } from "express";

interface Entry {
  count: number;
  windowStart: number;
}

export function simpleRateLimit(maxPerWindow = 120, windowMs = 60_000): RequestHandler {
  const buckets = new Map<string, Entry>();

  return (req, res, next) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      return next();
    }

    entry.count += 1;
    if (entry.count > maxPerWindow) {
      return res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests",
        },
      });
    }

    return next();
  };
}
