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

test("player can place multiple active bombs from new positions up to capacity", () => {
  const round = createRound({ bots: 1 });

  const first = applyCommand(round, { roundId: round.id, actorId: "player-1", action: "bomb" });
  assert.equal(first.commandOutcome.accepted, true);

  const moveOne = applyCommand(round, {
    roundId: round.id,
    actorId: "player-1",
    action: "move",
    direction: "right",
  });
  assert.equal(moveOne.commandOutcome.accepted, true);
  const second = applyCommand(round, { roundId: round.id, actorId: "player-1", action: "bomb" });
  assert.equal(second.commandOutcome.accepted, true);

  const moveTwo = applyCommand(round, {
    roundId: round.id,
    actorId: "player-1",
    action: "move",
    direction: "right",
  });
  assert.equal(moveTwo.commandOutcome.accepted, true);
  const third = applyCommand(round, { roundId: round.id, actorId: "player-1", action: "bomb" });
  assert.equal(third.commandOutcome.accepted, true);

  const fourth = applyCommand(round, { roundId: round.id, actorId: "player-1", action: "bomb" });
  assert.equal(fourth.commandOutcome.accepted, false);
  assert.equal(fourth.commandOutcome.reason, "bomb_capacity_reached");

  const playerBombs = round.bombs.filter((bomb) => bomb.ownerId === "player-1");
  assert.ok(playerBombs.length >= 2);
});

test("rejected player bomb still advances tick and does not remap bomb placement to enemy", () => {
  const round = createRound({ bots: 1 });
  const player = round.actors.find((actor) => actor.id === "player-1");
  const bot = round.actors.find((actor) => actor.id === "bot-1");
  assert.ok(player);
  assert.ok(bot);

  player.x = 5;
  player.y = 5;
  player.bombCapacity = 1;
  player.bombsPlaced = 1;
  bot.x = 7;
  bot.y = 5;
  round.bombs = [{ id: "existing", ownerId: "player-1", x: 4, y: 5, range: 2, fuseTicks: 5 }];

  const tickBefore = round.tick;
  const result = applyCommand(round, { roundId: round.id, actorId: "player-1", action: "bomb" });

  assert.equal(result.commandOutcome.accepted, false);
  assert.equal(result.commandOutcome.reason, "bomb_capacity_reached");
  assert.equal(round.tick, tickBefore + 1);
  assert.ok(round.bombs.some((bomb) => bomb.ownerId === "bot-1" && bomb.x === 7 && bomb.y === 5));
  assert.ok(!round.bombs.some((bomb) => bomb.ownerId === "player-1" && bomb.x === 7 && bomb.y === 5));
});

test("bot and player obey the same active bomb capacity rule", () => {
  const round = createRound({ bots: 1 });
  const player = round.actors.find((actor) => actor.type === "player");
  const bot = round.actors.find((actor) => actor.id === "bot-1");
  assert.ok(player);
  assert.ok(bot);

  const positions = [
    { x: 9, y: 8 },
    { x: 10, y: 9 },
    { x: 11, y: 9 },
    { x: 9, y: 7 },
  ];

  for (let i = 0; i < 3; i += 1) {
    bot.x = positions[i].x;
    bot.y = positions[i].y;
    const outcome = applyCommand(round, { roundId: round.id, actorId: bot.id, action: "bomb" });
    assert.equal(outcome.commandOutcome.accepted, true);
  }

  bot.x = positions[3].x;
  bot.y = positions[3].y;
  const rejected = applyCommand(round, { roundId: round.id, actorId: bot.id, action: "bomb" });
  assert.equal(rejected.commandOutcome.accepted, false);
  assert.equal(rejected.commandOutcome.reason, "bomb_capacity_reached");
});
