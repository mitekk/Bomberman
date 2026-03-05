import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { buildApp } from "../../src/app.js";

test("health endpoint responds with ok", async () => {
  const app = buildApp();
  const server = app.listen(0);
  await once(server, "listening");

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;

  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const data = (await response.json()) as { status: string };

  assert.equal(response.status, 200);
  assert.equal(data.status, "ok");

  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});
