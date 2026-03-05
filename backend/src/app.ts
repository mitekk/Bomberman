import cors from "cors";
import express from "express";
import { apiRouter } from "./api/router.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import { simpleRateLimit } from "./middleware/rate-limit.js";
import { requestTimeout } from "./middleware/request-timeout.js";

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "512kb" }));
  app.use(requestTimeout(5_000));
  app.use(simpleRateLimit(240, 60_000));
  app.use(requestLogger);
  app.use(apiRouter);
  app.use(errorHandler);
  return app;
}
