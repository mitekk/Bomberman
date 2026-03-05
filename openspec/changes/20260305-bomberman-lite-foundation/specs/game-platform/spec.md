# Delta Spec: Game Platform Foundation

## ADDED Requirements

### Requirement: Deterministic Round Lifecycle
The system SHALL model every round with explicit phases: `Spawn -> ActiveRound -> RoundEnd`.

#### Scenario: Round phase transitions are explicit
- **Given** a new round is created
- **When** initialization completes
- **Then** the round enters `Spawn` and only transitions forward to `ActiveRound` and `RoundEnd`
- **And** the terminal result is one of `win`, `lose`, or `draw`.

### Requirement: Arena Tile Semantics
The arena SHALL support indestructible tiles, destructible tiles, and walkable paths with deterministic collision rules.

#### Scenario: Blast interacts with tile types
- **Given** an explosion propagates across tiles
- **When** the blast reaches an indestructible tile
- **Then** propagation stops at that tile
- **And** when reaching a destructible tile, the tile is destroyed and propagation stops there.

### Requirement: Bomb and Explosion Resolution
Bombs SHALL detonate after a defined fuse delay and propagate blast effects in four cardinal directions until blocked.

#### Scenario: Blast resolves actors and blocks
- **Given** actors and destructible blocks are within blast range
- **When** a bomb detonates
- **Then** destructible blocks in path are removed
- **And** any actor in a blast cell is eliminated according to shared damage rules.

### Requirement: Controller-Agnostic Rule Parity
Human players and bots SHALL be constrained by the same movement, bomb-capacity, blast-damage, and elimination rules.

#### Scenario: Bot and player obey same bomb limits
- **Given** a player and a bot each have bomb capacity `N`
- **When** either attempts to place bomb `N+1` before a slot is freed
- **Then** the command is rejected for both with the same rule outcome.

### Requirement: Multiplayer-Ready Session Envelope
The round/session model SHALL separate actor identity from controller type to preserve future support for spectators and next-round late joins.

#### Scenario: Actor model supports future controller swap
- **Given** an actor record in a round
- **When** the controller type is evaluated
- **Then** rule evaluation remains unchanged regardless of whether controller is `human` or `bot`.

### Requirement: Versioned API Baseline
The backend SHALL expose a versioned HTTP API namespace (`/api/v1`) with additive evolution policy.

#### Scenario: New fields are additive
- **Given** an existing API response contract
- **When** new metadata is introduced
- **Then** additions are optional/additive
- **And** existing response fields and semantics remain backward compatible.

### Requirement: MVP Round Presentation Contract
The UI SHALL render round-critical readability elements: bomb state/fuse timing, threat zones, tile distinctions, opponent count, timer, and round outcome.

#### Scenario: Player understands elimination cause
- **Given** the player is eliminated
- **When** the round ends
- **Then** the UI shows blast context and final outcome so the cause of failure is understandable.
