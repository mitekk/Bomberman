import cors from "cors";
import express from "express";
import { apiRouter } from "./api/router.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import { routeScopedRateLimit, type RouteLimitConfig } from "./middleware/rate-limit.js";
import { requestTimeout } from "./middleware/request-timeout.js";

interface BuildAppOptions {
  rateLimit?: Partial<RouteLimitConfig>;
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = express();
  const rateLimit: RouteLimitConfig = {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
    commandsMaxPerWindow: Number(process.env.RATE_LIMIT_COMMANDS_MAX ?? 480),
    readsMaxPerWindow: Number(process.env.RATE_LIMIT_READS_MAX ?? 360),
    healthMaxPerWindow: Number(process.env.RATE_LIMIT_HEALTH_MAX ?? 1_200),
    ...options.rateLimit,
  };

  app.use(cors());
  app.use(express.json({ limit: "512kb" }));
  app.use(requestTimeout(5_000));
  app.use(routeScopedRateLimit(rateLimit));
  app.use(requestLogger);
  app.use(apiRouter);
  app.use(errorHandler);
  return app;
}
