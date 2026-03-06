import type { RequestHandler } from "express";

interface Entry {
  count: number;
  windowStart: number;
}

export interface RouteLimitConfig {
  commandsMaxPerWindow: number;
  readsMaxPerWindow: number;
  healthMaxPerWindow: number;
  windowMs: number;
}

type RouteBucket = "commands" | "reads" | "health";

function routeBucket(method: string, path: string): RouteBucket {
  if (path === "/health") {
    return "health";
  }
  if (method === "POST" && path === "/api/v1/commands") {
    return "commands";
  }
  return "reads";
}

export function routeScopedRateLimit(config: RouteLimitConfig): RequestHandler {
  const buckets = new Map<string, Entry>();

  return (req, res, next) => {
    const bucket = routeBucket(req.method, req.path);
    const maxPerWindow =
      bucket === "commands"
        ? config.commandsMaxPerWindow
        : bucket === "health"
          ? config.healthMaxPerWindow
          : config.readsMaxPerWindow;
    const key = `${req.ip ?? "unknown"}:${bucket}`;
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now - entry.windowStart > config.windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      return next();
    }

    entry.count += 1;
    if (entry.count > maxPerWindow) {
      const elapsedMs = now - entry.windowStart;
      const retryAfterMs = Math.max(0, config.windowMs - elapsedMs);
      return res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests",
          details: {
            bucket,
            retryAfterMs,
          },
        },
      });
    }

    return next();
  };
}
