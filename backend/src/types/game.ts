export type Direction = "up" | "down" | "left" | "right";

export type TileType = "wall" | "block" | "floor";

export type RoundStatus = "spawn" | "active" | "ended";

export type RoundResult = "win" | "lose" | "draw";

export type ActorType = "player" | "bot";

export interface Position {
  x: number;
  y: number;
}

export interface Actor extends Position {
  id: string;
  type: ActorType;
  alive: boolean;
  bombCapacity: number;
  bombRange: number;
  bombsPlaced: number;
  speed: number;
  style?: "chaser" | "trapper" | "survivor" | "greedy";
}

export interface Bomb extends Position {
  id: string;
  ownerId: string;
  range: number;
  fuseTicks: number;
}

export interface Explosion {
  x: number;
  y: number;
  ticksVisible: number;
}

export interface RoundState {
  id: string;
  status: RoundStatus;
  result?: RoundResult;
  width: number;
  height: number;
  tiles: TileType[][];
  actors: Actor[];
  bombs: Bomb[];
  explosions: Explosion[];
  tick: number;
  timerTicksRemaining: number;
}

export interface CreateRoundInput {
  difficulty?: "easy" | "normal" | "hard";
  bots?: number;
}

export type CommandAction = "move" | "bomb" | "wait";

export interface CommandInput {
  roundId: string;
  actorId: string;
  action: CommandAction;
  direction?: Direction;
}

export type CommandRejectionReason =
  | "round_ended"
  | "actor_not_found"
  | "actor_not_alive"
  | "direction_required"
  | "move_blocked"
  | "bomb_capacity_reached"
  | "bomb_already_on_tile";

export interface CommandOutcome {
  actorId: string;
  action: CommandAction;
  accepted: boolean;
  reason?: CommandRejectionReason;
  tick: number;
}
