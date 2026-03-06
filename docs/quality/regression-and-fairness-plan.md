# Regression and Bot-Fairness Validation Plan

## Regression Cleanup Scope
- Stabilize command-handling edge cases (`move` bounds, repeated `bomb`, `wait` behavior).
- Ensure round terminal states (`win|lose|draw`) are emitted exactly once.
- Normalize error envelope shape for validation and not-found errors.
- Keep API responses additive relative to `backend/openapi.yaml`.
- Prevent command starvation from combined polling + key-repeat traffic.
- Ensure bomb placement attribution is explicit when player and bot actions resolve in the same tick.

## Bugfix Validation Scope
- Contract checks:
  - `POST /api/v1/rounds` returns round with required lifecycle fields.
  - `POST /api/v1/commands` returns updated round state and preserves envelope.
  - `POST /api/v1/commands` returns explicit command outcome metadata (`accepted/rejected`, reason).
- Simulation checks:
  - Explosion stopping rules on `wall` and `block`.
  - Elimination parity between player and bots.
  - Timer exhaustion ends round with `draw`.
  - Player bomb command always resolves to player tile (never enemy tile remap).
  - Player can place multiple active bombs from new positions up to configured cap.
- Bot fairness checks:
  - Bots should not teleport and should obey walkability constraints.
  - Bots should obey the same bomb capacity constraints as player.
  - Dangerous-cell avoidance should be observable in deterministic scenarios.
- Throughput checks:
  - Command endpoint remains responsive at expected gameplay cadence with polling enabled.
  - Throttle behavior returns actionable retry signals instead of silent input failure.

## Evidence Hooks
- Unit: `backend/src/domain/engine.test.ts`
- Integration: `backend/tests/integration/health.test.ts` and command-rate/command-outcome suites
- Frontend unit: `frontend/src/lib/__tests__` and command-dispatch tests (to add)
- E2E smoke: `frontend/e2e/smoke.spec.ts` plus multi-bomb interaction scenario (to add)
