import test from "node:test";
import assert from "node:assert/strict";
import { applyCommand, createRound } from "./engine.js";

test("bomb explosion destroys destructible blocks", () => {
  const round = createRound({ bots: 1 });
  round.tiles[1][2] = "block";
  applyCommand(round, { roundId: round.id, actorId: "player-1", action: "bomb" });

  for (let i = 0; i < 6; i += 1) {
    applyCommand(round, { roundId: round.id, actorId: "player-1", action: "wait" });
  }

  assert.equal(round.tiles[1][2], "floor");
});
