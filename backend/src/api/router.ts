import { Router } from "express";
import { applyCommand, createRound } from "../domain/engine.js";
import { HttpError } from "../middleware/error-handler.js";
import { parseCommand, parseCreateRound } from "./validators.js";
import { ProfileStore } from "../store/profile-store.js";
import { RoundStore } from "../store/round-store.js";

const rounds = new RoundStore();
const profiles = new ProfileStore();

function safeRound(roundId: string) {
  const round = rounds.get(roundId);
  if (!round) {
    throw new HttpError(404, "ROUND_NOT_FOUND", `Round ${roundId} not found`);
  }
  return round;
}

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.post("/api/v1/rounds", (req, res) => {
  const payload = parseCreateRound(req.body);
  const round = createRound(payload);
  rounds.set(round);
  res.status(201).json({ round });
});

apiRouter.get("/api/v1/rounds/:roundId", (req, res) => {
  const round = safeRound(req.params.roundId);
  res.json({ round });
});

apiRouter.post("/api/v1/commands", (req, res) => {
  const command = parseCommand(req.body);
  const round = safeRound(command.roundId);

  const { commandOutcome } = applyCommand(round, command);

  if (round.status === "ended" && round.result) {
    const player = round.actors.find((actor) => actor.type === "player");
    const eliminations = round.actors.filter((actor) => actor.type === "bot" && !actor.alive).length;
    profiles.updateResult(round.result, player?.bombsPlaced ?? 0, eliminations);
  }

  res.json({ round, commandOutcome });
});

apiRouter.get("/api/v1/profile", (_req, res) => {
  res.json({ profile: profiles.get() });
});

apiRouter.patch("/api/v1/profile", (req, res) => {
  const displayName = String(req.body?.displayName ?? "Player").slice(0, 32);
  const avatar = String(req.body?.avatar ?? "classic").slice(0, 32);
  const profile = profiles.updateProfile(displayName, avatar);
  res.json({ profile });
});
