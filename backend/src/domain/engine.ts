import { randomUUID } from "node:crypto";
import type {
  Actor,
  Bomb,
  CommandInput,
  CommandOutcome,
  CreateRoundInput,
  Direction,
  Explosion,
  Position,
  RoundResult,
  RoundState,
  TileType,
} from "../types/game.js";

const WIDTH = 13;
const HEIGHT = 11;
const DEFAULT_FUSE_TICKS = 6;
const DEFAULT_TIMER_TICKS = 180 * 4;
const DEFAULT_ACTIVE_BOMB_CAPACITY = 3;

const DIRS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function buildBaseTiles(): TileType[][] {
  const tiles: TileType[][] = Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => "floor"),
  );

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const boundary = x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1;
      const fixed = x % 2 === 0 && y % 2 === 0;
      if (boundary || fixed) {
        tiles[y][x] = "wall";
      }
    }
  }

  for (let y = 1; y < HEIGHT - 1; y += 1) {
    for (let x = 1; x < WIDTH - 1; x += 1) {
      if (tiles[y][x] !== "floor") {
        continue;
      }
      if ((x <= 2 && y <= 2) || (x >= WIDTH - 3 && y <= 2) || (x <= 2 && y >= HEIGHT - 3)) {
        continue;
      }
      if ((x + y) % 3 === 0) {
        tiles[y][x] = "block";
      }
    }
  }

  return tiles;
}

function difficultyConfig(difficulty: CreateRoundInput["difficulty"]): { bots: number; timer: number } {
  if (difficulty === "easy") {
    return { bots: 1, timer: DEFAULT_TIMER_TICKS + 120 };
  }
  if (difficulty === "hard") {
    return { bots: 3, timer: DEFAULT_TIMER_TICKS - 120 };
  }
  return { bots: 2, timer: DEFAULT_TIMER_TICKS };
}

export function createRound(input: CreateRoundInput = {}): RoundState {
  const diff = difficultyConfig(input.difficulty ?? "normal");
  const botCount = Math.max(1, Math.min(3, input.bots ?? diff.bots));

  const actors: Actor[] = [
    {
      id: "player-1",
      type: "player",
      x: 1,
      y: 1,
      alive: true,
      bombCapacity: DEFAULT_ACTIVE_BOMB_CAPACITY,
      bombRange: 2,
      bombsPlaced: 0,
      speed: 1,
    },
  ];

  const botSpawns: Position[] = [
    { x: WIDTH - 2, y: 1 },
    { x: 1, y: HEIGHT - 2 },
    { x: WIDTH - 2, y: HEIGHT - 2 },
  ];
  const styles: Actor["style"][] = ["chaser", "trapper", "survivor"];

  for (let i = 0; i < botCount; i += 1) {
    const spawn = botSpawns[i];
    actors.push({
      id: `bot-${i + 1}`,
      type: "bot",
      x: spawn.x,
      y: spawn.y,
      alive: true,
      bombCapacity: DEFAULT_ACTIVE_BOMB_CAPACITY,
      bombRange: 2,
      bombsPlaced: 0,
      speed: 1,
      style: styles[i],
    });
  }

  return {
    id: randomUUID(),
    status: "active",
    width: WIDTH,
    height: HEIGHT,
    tiles: buildBaseTiles(),
    actors,
    bombs: [],
    explosions: [],
    tick: 0,
    timerTicksRemaining: diff.timer,
  };
}

function inBounds(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT;
}

function isWalkable(state: RoundState, x: number, y: number): boolean {
  if (!inBounds(x, y)) {
    return false;
  }
  if (state.tiles[y][x] !== "floor") {
    return false;
  }
  if (state.bombs.some((bomb) => bomb.x === x && bomb.y === y)) {
    return false;
  }
  return !state.actors.some((actor) => actor.alive && actor.x === x && actor.y === y);
}

function findActor(state: RoundState, actorId: string): Actor | undefined {
  return state.actors.find((actor) => actor.id === actorId);
}

type PlaceBombResult = "placed" | "actor_not_alive" | "bomb_capacity_reached" | "bomb_already_on_tile";

function placeBomb(state: RoundState, actor: Actor): PlaceBombResult {
  if (!actor.alive) {
    return "actor_not_alive";
  }
  if (actor.bombsPlaced >= actor.bombCapacity) {
    return "bomb_capacity_reached";
  }
  if (state.bombs.some((bomb) => bomb.x === actor.x && bomb.y === actor.y)) {
    return "bomb_already_on_tile";
  }

  state.bombs.push({
    id: randomUUID(),
    ownerId: actor.id,
    x: actor.x,
    y: actor.y,
    range: actor.bombRange,
    fuseTicks: DEFAULT_FUSE_TICKS,
  });
  actor.bombsPlaced += 1;
  return "placed";
}

function moveActor(state: RoundState, actor: Actor, direction: Direction): boolean {
  if (!actor.alive) {
    return false;
  }
  const delta = DIRS[direction];
  const nextX = actor.x + delta.x;
  const nextY = actor.y + delta.y;
  if (isWalkable(state, nextX, nextY)) {
    actor.x = nextX;
    actor.y = nextY;
    return true;
  }
  return false;
}

function explosionCells(state: RoundState, bomb: Bomb): Position[] {
  const cells: Position[] = [{ x: bomb.x, y: bomb.y }];

  const dirs: Direction[] = ["up", "down", "left", "right"];
  for (const dir of dirs) {
    const delta = DIRS[dir];
    for (let i = 1; i <= bomb.range; i += 1) {
      const x = bomb.x + delta.x * i;
      const y = bomb.y + delta.y * i;
      if (!inBounds(x, y)) {
        break;
      }
      const tile = state.tiles[y][x];
      if (tile === "wall") {
        break;
      }
      cells.push({ x, y });
      if (tile === "block") {
        break;
      }
    }
  }

  return cells;
}

function detonate(state: RoundState, bomb: Bomb): Explosion[] {
  const cells = explosionCells(state, bomb);

  for (const cell of cells) {
    if (state.tiles[cell.y][cell.x] === "block") {
      state.tiles[cell.y][cell.x] = "floor";
    }
  }

  for (const actor of state.actors) {
    if (!actor.alive) {
      continue;
    }
    if (cells.some((cell) => cell.x === actor.x && cell.y === actor.y)) {
      actor.alive = false;
    }
  }

  return cells.map((cell) => ({ ...cell, ticksVisible: 2 }));
}

function runBots(state: RoundState): void {
  const player = state.actors.find((actor) => actor.type === "player" && actor.alive);
  if (!player) {
    return;
  }

  const directions: Direction[] = ["up", "down", "left", "right"];

  for (const bot of state.actors.filter((actor) => actor.type === "bot" && actor.alive)) {
    const dangerous = state.explosions.some((explosion) => explosion.x === bot.x && explosion.y === bot.y);
    if (dangerous) {
      const safeMove = directions.find((dir) => {
        const delta = DIRS[dir];
        return isWalkable(state, bot.x + delta.x, bot.y + delta.y);
      });
      if (safeMove) {
        moveActor(state, bot, safeMove);
        continue;
      }
    }

    const dx = player.x - bot.x;
    const dy = player.y - bot.y;

    if (Math.abs(dx) + Math.abs(dy) <= 2) {
      placeBomb(state, bot);
      continue;
    }

    const preferred: Direction[] =
      Math.abs(dx) > Math.abs(dy)
        ? [dx > 0 ? "right" : "left", dy > 0 ? "down" : "up"]
        : [dy > 0 ? "down" : "up", dx > 0 ? "right" : "left"];

    const moved = preferred.some((dir) => {
      const delta = DIRS[dir];
      if (isWalkable(state, bot.x + delta.x, bot.y + delta.y)) {
        moveActor(state, bot, dir);
        return true;
      }
      return false;
    });

    if (!moved) {
      const fallback = directions.find((dir) => {
        const delta = DIRS[dir];
        return isWalkable(state, bot.x + delta.x, bot.y + delta.y);
      });
      if (fallback) {
        moveActor(state, bot, fallback);
      }
    }
  }
}

function evaluateResult(state: RoundState): RoundResult | undefined {
  const player = state.actors.find((actor) => actor.type === "player");
  const botsAlive = state.actors.some((actor) => actor.type === "bot" && actor.alive);

  if (!player?.alive) {
    return "lose";
  }
  if (!botsAlive) {
    return "win";
  }
  if (state.timerTicksRemaining <= 0) {
    return "draw";
  }

  return undefined;
}

function resolveActorCommand(state: RoundState, actor: Actor, command: CommandInput): CommandOutcome {
  if (command.action === "move") {
    if (!command.direction) {
      return {
        actorId: actor.id,
        action: command.action,
        accepted: false,
        reason: "direction_required",
        tick: state.tick,
      };
    }

    const moved = moveActor(state, actor, command.direction);
    return {
      actorId: actor.id,
      action: command.action,
      accepted: moved,
      reason: moved ? undefined : "move_blocked",
      tick: state.tick,
    };
  }

  if (command.action === "bomb") {
    const bombResult = placeBomb(state, actor);
    return {
      actorId: actor.id,
      action: command.action,
      accepted: bombResult === "placed",
      reason: bombResult === "placed" ? undefined : bombResult,
      tick: state.tick,
    };
  }

  return {
    actorId: actor.id,
    action: command.action,
    accepted: true,
    tick: state.tick,
  };
}

export function applyCommand(
  state: RoundState,
  command: CommandInput,
): { state: RoundState; commandOutcome: CommandOutcome } {
  if (state.status === "ended") {
    return {
      state,
      commandOutcome: {
        actorId: command.actorId,
        action: command.action,
        accepted: false,
        reason: "round_ended",
        tick: state.tick,
      },
    };
  }

  const actor = findActor(state, command.actorId);
  if (!actor) {
    return {
      state,
      commandOutcome: {
        actorId: command.actorId,
        action: command.action,
        accepted: false,
        reason: "actor_not_found",
        tick: state.tick,
      },
    };
  }
  if (!actor.alive) {
    return {
      state,
      commandOutcome: {
        actorId: actor.id,
        action: command.action,
        accepted: false,
        reason: "actor_not_alive",
        tick: state.tick,
      },
    };
  }

  const commandOutcome = resolveActorCommand(state, actor, command);

  runBots(state);

  state.tick += 1;
  state.timerTicksRemaining -= 1;

  const newlyExploded: Explosion[] = [];
  const remainingBombs: Bomb[] = [];

  for (const bomb of state.bombs) {
    bomb.fuseTicks -= 1;
    if (bomb.fuseTicks <= 0) {
      const owner = findActor(state, bomb.ownerId);
      if (owner) {
        owner.bombsPlaced = Math.max(0, owner.bombsPlaced - 1);
      }
      newlyExploded.push(...detonate(state, bomb));
    } else {
      remainingBombs.push(bomb);
    }
  }

  state.bombs = remainingBombs;
  state.explosions = state.explosions
    .map((explosion) => ({ ...explosion, ticksVisible: explosion.ticksVisible - 1 }))
    .filter((explosion) => explosion.ticksVisible > 0)
    .concat(newlyExploded);

  const result = evaluateResult(state);
  if (result) {
    state.status = "ended";
    state.result = result;
  }

  return {
    state,
    commandOutcome: {
      ...commandOutcome,
      tick: state.tick,
    },
  };
}
