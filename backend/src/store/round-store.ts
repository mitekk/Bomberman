import type { RoundState } from "../types/game.js";

export class RoundStore {
  private readonly rounds = new Map<string, RoundState>();

  set(round: RoundState): void {
    this.rounds.set(round.id, round);
  }

  get(roundId: string): RoundState | undefined {
    return this.rounds.get(roundId);
  }
}
