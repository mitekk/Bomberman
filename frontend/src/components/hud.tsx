import type { RoundState } from "../types/game";

export function Hud({ round }: { round: RoundState }) {
  const player = round.actors.find((actor) => actor.type === "player");
  const botsAlive = round.actors.filter((actor) => actor.type === "bot" && actor.alive).length;
  const seconds = Math.ceil(round.timerTicksRemaining / 4);

  return (
    <div className="hud">
      <div className="hud-item">Timer: {seconds}s</div>
      <div className="hud-item">Bots alive: {botsAlive}</div>
      <div className="hud-item">
        Bombs: {player?.bombsPlaced ?? 0}/{player?.bombCapacity ?? 0}
      </div>
      <div className="hud-item">Range: {player?.bombRange ?? 0}</div>
    </div>
  );
}
