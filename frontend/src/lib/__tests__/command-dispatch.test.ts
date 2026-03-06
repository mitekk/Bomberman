import { describe, expect, it } from "vitest";
import { commandOutcomeMessage, enqueueCommand } from "../command-dispatch";
import type { CommandInput, CommandOutcome } from "../../types/game";

function command(input: Partial<CommandInput>): CommandInput {
  return {
    roundId: "round-1",
    actorId: "player-1",
    action: "wait",
    ...input,
  };
}

describe("enqueueCommand", () => {
  it("keeps only latest movement command while preserving non-move commands", () => {
    const queued = [
      command({ action: "move", direction: "left" }),
      command({ action: "bomb" }),
      command({ action: "move", direction: "up" }),
    ];

    const next = enqueueCommand(queued, command({ action: "move", direction: "right" }));

    expect(next).toEqual([command({ action: "bomb" }), command({ action: "move", direction: "right" })]);
  });
});

describe("commandOutcomeMessage", () => {
  it("returns a readable message for bomb-capacity rejections", () => {
    const outcome: CommandOutcome = {
      actorId: "player-1",
      action: "bomb",
      accepted: false,
      reason: "bomb_capacity_reached",
      tick: 10,
    };

    expect(commandOutcomeMessage(outcome)).toContain("No bomb slots");
  });
});
