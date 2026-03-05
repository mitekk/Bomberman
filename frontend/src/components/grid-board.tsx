import type { RoundState } from "../types/game";

interface Props {
  round: RoundState;
}

function tileClass(tile: string): string {
  if (tile === "wall") return "tile tile-wall";
  if (tile === "block") return "tile tile-block";
  return "tile tile-floor";
}

export function GridBoard({ round }: Props) {
  const actorIndex = new Map(round.actors.filter((a) => a.alive).map((a) => [`${a.x}:${a.y}`, a]));
  const bombIndex = new Set(round.bombs.map((b) => `${b.x}:${b.y}`));
  const explosionIndex = new Set(round.explosions.map((e) => `${e.x}:${e.y}`));

  return (
    <div
      className="grid-board"
      style={{
        gridTemplateColumns: `repeat(${round.width}, minmax(0, 1fr))`,
      }}
    >
      {round.tiles.flatMap((row, y) =>
        row.map((tile, x) => {
          const key = `${x}:${y}`;
          const actor = actorIndex.get(key);
          const isBomb = bombIndex.has(key);
          const isExplosion = explosionIndex.has(key);

          return (
            <div className={tileClass(tile)} key={key}>
              {isExplosion && <span className="entity explosion" title="Explosion" />}
              {!isExplosion && isBomb && <span className="entity bomb" title="Bomb" />}
              {!isExplosion && actor?.type === "player" && <span className="entity player" title="Player" />}
              {!isExplosion && actor?.type === "bot" && <span className="entity bot" title="Bot" />}
            </div>
          );
        }),
      )}
    </div>
  );
}
