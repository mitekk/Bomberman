import type { CommandInput, CommandOutcome } from "../types/game";

export const COMMAND_DISPATCH_INTERVAL_MS = 90;
const MAX_COMMAND_QUEUE_SIZE = 8;

export function enqueueCommand(queue: CommandInput[], command: CommandInput): CommandInput[] {
  let next = queue;

  // Keep only the latest queued movement to avoid flooding with key-repeat events.
  if (command.action === "move") {
    next = next.filter((queued) => queued.action !== "move");
  }

  next = [...next, command];
  if (next.length > MAX_COMMAND_QUEUE_SIZE) {
    return next.slice(next.length - MAX_COMMAND_QUEUE_SIZE);
  }

  return next;
}

export function commandOutcomeMessage(outcome: CommandOutcome): string | undefined {
  if (outcome.accepted) {
    return undefined;
  }

  switch (outcome.reason) {
    case "bomb_capacity_reached":
      return "No bomb slots left yet. Wait for a fuse to finish.";
    case "bomb_already_on_tile":
      return "A bomb is already on this tile.";
    case "move_blocked":
      return "Cannot move into a blocked tile.";
    case "round_ended":
      return "Round has already ended.";
    case "actor_not_alive":
      return "Actor is no longer alive.";
    default:
      return "Command rejected.";
  }
}
