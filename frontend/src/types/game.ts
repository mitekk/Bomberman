export type TileType = "wall" | "block" | "floor";

export interface Actor {
  id: string;
  type: "player" | "bot";
  x: number;
  y: number;
  alive: boolean;
  bombCapacity: number;
  bombRange: number;
  bombsPlaced: number;
}

export interface Bomb {
  id: string;
  x: number;
  y: number;
  fuseTicks: number;
}

export interface Explosion {
  x: number;
  y: number;
  ticksVisible: number;
}

export interface RoundState {
  id: string;
  status: "spawn" | "active" | "ended";
  result?: "win" | "lose" | "draw";
  width: number;
  height: number;
  tiles: TileType[][];
  actors: Actor[];
  bombs: Bomb[];
  explosions: Explosion[];
  tick: number;
  timerTicksRemaining: number;
}

export type Direction = "up" | "down" | "left" | "right";

export type CommandAction = "move" | "bomb" | "wait";

export interface CommandInput {
  roundId: string;
  actorId: string;
  action: CommandAction;
  direction?: Direction;
}

export interface CommandOutcome {
  actorId: string;
  action: CommandAction;
  accepted: boolean;
  reason?:
    | "round_ended"
    | "actor_not_found"
    | "actor_not_alive"
    | "direction_required"
    | "move_blocked"
    | "bomb_capacity_reached"
    | "bomb_already_on_tile";
  tick: number;
}

export interface Profile {
  displayName: string;
  avatar: string;
  roundsPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  eliminations: number;
  bombsPlaced: number;
  longestWinStreak: number;
  currentWinStreak: number;
}
