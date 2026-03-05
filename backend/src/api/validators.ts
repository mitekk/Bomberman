import type { CommandInput, CreateRoundInput, Direction } from "../types/game.js";
import { HttpError } from "../middleware/error-handler.js";

const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

export function parseCreateRound(body: unknown): CreateRoundInput {
  if (!body || typeof body !== "object") {
    return {};
  }

  const payload = body as Record<string, unknown>;
  const out: CreateRoundInput = {};

  if (payload.difficulty !== undefined) {
    if (!["easy", "normal", "hard"].includes(String(payload.difficulty))) {
      throw new HttpError(400, "VALIDATION_ERROR", "difficulty must be easy|normal|hard");
    }
    out.difficulty = payload.difficulty as CreateRoundInput["difficulty"];
  }

  if (payload.bots !== undefined) {
    const bots = Number(payload.bots);
    if (!Number.isInteger(bots) || bots < 1 || bots > 3) {
      throw new HttpError(400, "VALIDATION_ERROR", "bots must be an integer between 1 and 3");
    }
    out.bots = bots;
  }

  return out;
}

export function parseCommand(body: unknown): CommandInput {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "VALIDATION_ERROR", "Request body must be an object");
  }

  const payload = body as Record<string, unknown>;
  const roundId = String(payload.roundId ?? "").trim();
  const actorId = String(payload.actorId ?? "").trim();
  const action = String(payload.action ?? "").trim();

  if (!roundId || !actorId) {
    throw new HttpError(400, "VALIDATION_ERROR", "roundId and actorId are required");
  }

  if (!["move", "bomb", "wait"].includes(action)) {
    throw new HttpError(400, "VALIDATION_ERROR", "action must be move|bomb|wait");
  }

  if (action === "move") {
    const direction = String(payload.direction ?? "").trim() as Direction;
    if (!DIRECTIONS.includes(direction)) {
      throw new HttpError(400, "VALIDATION_ERROR", "direction must be up|down|left|right for move");
    }
    return { roundId, actorId, action: "move", direction };
  }

  return {
    roundId,
    actorId,
    action: action as CommandInput["action"],
  };
}
