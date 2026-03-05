import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (req, res, next) => {
  const started = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - started;
    const log = {
      level: "info",
      msg: "http_request",
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
      roundId: (req.body?.roundId as string | undefined) ?? (req.params?.roundId as string | undefined),
      actorId: req.body?.actorId as string | undefined,
    };
    process.stdout.write(`${JSON.stringify(log)}\n`);
  });
  next();
};
