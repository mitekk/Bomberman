import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { buildApp } from "../../src/app.js";

async function withServer<T>(
  fn: (baseUrl: string) => Promise<T>,
  rateLimit?: {
    windowMs: number;
    commandsMaxPerWindow: number;
    readsMaxPerWindow: number;
    healthMaxPerWindow: number;
  },
): Promise<T> {
  const app = buildApp({ rateLimit });
  const server = app.listen(0);
  await once(server, "listening");

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    return await fn(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

async function postJson(baseUrl: string, path: string, payload: unknown): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

test("commands API returns explicit commandOutcome and supports multi-bomb placement", async () => {
  await withServer(async (baseUrl) => {
    const roundResponse = await postJson(baseUrl, "/api/v1/rounds", { difficulty: "easy" });
    assert.equal(roundResponse.status, 201);
    const created = (await roundResponse.json()) as { round: { id: string } };
    const roundId = created.round.id;

    const firstBombRes = await postJson(baseUrl, "/api/v1/commands", {
      roundId,
      actorId: "player-1",
      action: "bomb",
    });
    assert.equal(firstBombRes.status, 200);
    const firstBombBody = (await firstBombRes.json()) as {
      round: { bombs: Array<{ ownerId: string; x: number; y: number }> };
      commandOutcome: { accepted: boolean; action: string };
    };
    assert.equal(firstBombBody.commandOutcome.accepted, true);
    assert.equal(firstBombBody.commandOutcome.action, "bomb");

    const moveRes = await postJson(baseUrl, "/api/v1/commands", {
      roundId,
      actorId: "player-1",
      action: "move",
      direction: "right",
    });
    assert.equal(moveRes.status, 200);

    const secondBombRes = await postJson(baseUrl, "/api/v1/commands", {
      roundId,
      actorId: "player-1",
      action: "bomb",
    });
    assert.equal(secondBombRes.status, 200);
    const secondBombBody = (await secondBombRes.json()) as {
      round: { bombs: Array<{ ownerId: string; x: number; y: number }> };
      commandOutcome: { accepted: boolean };
    };
    assert.equal(secondBombBody.commandOutcome.accepted, true);
    const playerBombs = secondBombBody.round.bombs.filter((bomb) => bomb.ownerId === "player-1");
    assert.ok(playerBombs.length >= 2);
  });
});

test("commands API provides explicit throttle envelope for rate limiting", async () => {
  await withServer(
    async (baseUrl) => {
      const roundResponse = await postJson(baseUrl, "/api/v1/rounds", { difficulty: "easy" });
      assert.equal(roundResponse.status, 201);
      const created = (await roundResponse.json()) as { round: { id: string } };
      const roundId = created.round.id;

      const statuses: number[] = [];
      let throttledBody:
        | {
            error?: {
              code?: string;
              details?: { bucket?: string; retryAfterMs?: number };
            };
          }
        | undefined;

      for (let i = 0; i < 8; i += 1) {
        const response = await postJson(baseUrl, "/api/v1/commands", {
          roundId,
          actorId: "player-1",
          action: "wait",
        });
        statuses.push(response.status);
        if (response.status === 429) {
          throttledBody = (await response.json()) as {
            error?: {
              code?: string;
              details?: { bucket?: string; retryAfterMs?: number };
            };
          };
          break;
        } else {
          await response.json();
        }
      }

      assert.ok(statuses.includes(429));
      assert.equal(throttledBody?.error?.code, "RATE_LIMITED");
      assert.equal(throttledBody?.error?.details?.bucket, "commands");
      assert.equal(typeof throttledBody?.error?.details?.retryAfterMs, "number");
    },
    {
      windowMs: 1_000,
      commandsMaxPerWindow: 5,
      readsMaxPerWindow: 50,
      healthMaxPerWindow: 50,
    },
  );
});

test("commands API remains responsive under expected command cadence", async () => {
  await withServer(
    async (baseUrl) => {
      const roundResponse = await postJson(baseUrl, "/api/v1/rounds", { difficulty: "easy" });
      assert.equal(roundResponse.status, 201);
      const created = (await roundResponse.json()) as { round: { id: string } };
      const roundId = created.round.id;

      for (let i = 0; i < 12; i += 1) {
        const response = await postJson(baseUrl, "/api/v1/commands", {
          roundId,
          actorId: "player-1",
          action: "wait",
        });
        assert.equal(response.status, 200);
        await response.json();
      }
    },
    {
      windowMs: 1_000,
      commandsMaxPerWindow: 20,
      readsMaxPerWindow: 50,
      healthMaxPerWindow: 50,
    },
  );
});
