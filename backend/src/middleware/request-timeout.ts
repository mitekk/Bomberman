import type { RequestHandler } from "express";

export function requestTimeout(timeoutMs: number): RequestHandler {
  return (req, res, next) => {
    req.setTimeout(timeoutMs);
    res.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(503).json({
          error: {
            code: "REQUEST_TIMEOUT",
            message: "Request processing exceeded timeout",
          },
        });
      }
    });
    next();
  };
}
