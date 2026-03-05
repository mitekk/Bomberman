# Regression and Bot-Fairness Validation Plan

## Regression Cleanup Scope
- Stabilize command-handling edge cases (`move` bounds, repeated `bomb`, `wait` behavior).
- Ensure round terminal states (`win|lose|draw`) are emitted exactly once.
- Normalize error envelope shape for validation and not-found errors.
- Keep API responses additive relative to `backend/openapi.yaml`.

## Bugfix Validation Scope
- Contract checks:
  - `POST /api/v1/rounds` returns round with required lifecycle fields.
  - `POST /api/v1/commands` returns updated round state and preserves envelope.
- Simulation checks:
  - Explosion stopping rules on `wall` and `block`.
  - Elimination parity between player and bots.
  - Timer exhaustion ends round with `draw`.
- Bot fairness checks:
  - Bots should not teleport and should obey walkability constraints.
  - Bots should obey the same bomb capacity constraints as player.
  - Dangerous-cell avoidance should be observable in deterministic scenarios.

## Evidence Hooks
- Unit: `backend/src/domain/engine.test.ts`
- Integration: `backend/tests/integration/health.test.ts` and future API contract suite
- E2E smoke: `frontend/e2e/smoke.spec.ts`
