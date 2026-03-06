# ADR-005: Command Semantics and Multi-Bomb Capacity

## Status
Accepted

## Context
Gameplay bug reports showed three coupled issues:
- Player bomb placement looked incorrect when nearby bots acted in the same tick.
- Command rejection reasons were implicit, so failures looked like random behavior.
- Only one active bomb per actor was allowed, conflicting with expected multi-placement flow.

The project requires deterministic, controller-agnostic rules for both players and bots.

## Decision
- Keep server-authoritative tick cadence: valid actor commands advance simulation even when rejected by gameplay rules.
- Add explicit command outcome metadata in command responses:
  - `accepted: boolean`
  - `reason` (for rejections)
  - `actorId`, `action`, and post-tick `tick`
- Keep bomb placement actor-anchored:
  - Bomb coordinates are always resolved from the issuing actor position.
  - Never remap command ownership/coordinates based on nearby actors.
- Increase default active bomb capacity to `3` for all actors (player and bots) to preserve controller parity.

## Consequences
- Players get deterministic and debuggable command feedback.
- Multi-bomb placement from new positions is supported without changing core blast rules.
- Match pacing and difficulty increase; balancing remains a follow-up tuning axis.
