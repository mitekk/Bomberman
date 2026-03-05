# Game Platform Spec

## Purpose
Define deterministic Bomberman-lite round behavior, API compatibility guarantees, and MVP presentation requirements for single-player play with multiplayer-ready rule consistency.

## Requirements
### Requirement: Deterministic Round Lifecycle
The system SHALL model every round with explicit phases: `Spawn -> ActiveRound -> RoundEnd`.

#### Scenario: Round phase transitions are explicit
- **GIVEN** a new round is created
- **WHEN** initialization completes
- **THEN** the round enters `Spawn` and only transitions forward to `ActiveRound` and `RoundEnd`
- **AND** the terminal result is one of `win`, `lose`, or `draw`.

### Requirement: Arena Tile Semantics
The arena SHALL support indestructible tiles, destructible tiles, and walkable paths with deterministic collision rules.

#### Scenario: Blast interacts with tile types
- **GIVEN** an explosion propagates across tiles
- **WHEN** the blast reaches an indestructible tile
- **THEN** propagation stops at that tile
- **AND** when reaching a destructible tile, the tile is destroyed and propagation stops there.

### Requirement: Bomb and Explosion Resolution
Bombs SHALL detonate after a defined fuse delay and propagate blast effects in four cardinal directions until blocked.

#### Scenario: Blast resolves actors and blocks
- **GIVEN** actors and destructible blocks are within blast range
- **WHEN** a bomb detonates
- **THEN** destructible blocks in path are removed
- **AND** any actor in a blast cell is eliminated according to shared damage rules.

### Requirement: Controller-Agnostic Rule Parity
Human players and bots SHALL be constrained by the same movement, bomb-capacity, blast-damage, and elimination rules.

#### Scenario: Bot and player obey same bomb limits
- **GIVEN** a player and a bot each have bomb capacity `N`
- **WHEN** either attempts to place bomb `N+1` before a slot is freed
- **THEN** the command is rejected for both with the same rule outcome.

### Requirement: Multiplayer-Ready Session Envelope
The round/session model SHALL separate actor identity from controller type to preserve future support for spectators and next-round late joins.

#### Scenario: Actor model supports future controller swap
- **GIVEN** an actor record in a round
- **WHEN** the controller type is evaluated
- **THEN** rule evaluation remains unchanged regardless of whether controller is `human` or `bot`.

### Requirement: Versioned API Baseline
The backend SHALL expose a versioned HTTP API namespace (`/api/v1`) with additive evolution policy.

#### Scenario: New fields are additive
- **GIVEN** an existing API response contract
- **WHEN** new metadata is introduced
- **THEN** additions are optional/additive
- **AND** existing response fields and semantics remain backward compatible.

### Requirement: MVP Round Presentation Contract
The UI SHALL render round-critical readability elements: bomb state/fuse timing, threat zones, tile distinctions, opponent count, timer, and round outcome.

#### Scenario: Player understands elimination cause
- **GIVEN** the player is eliminated
- **WHEN** the round ends
- **THEN** the UI shows blast context and final outcome so the cause of failure is understandable.
