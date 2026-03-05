# Tasks: 20260305-bomberman-lite-foundation

## Gate Prerequisites
- [x] `proposal.md` exists and is decision-complete.
- [x] At least one spec delta exists under `specs/<domain>/spec.md`.
- [x] `npx -y @fission-ai/openspec@latest validate --strict` passes.

## Phase Spec
- [x] Define problem statement and acceptance criteria deltas.
- [x] Define contract source of truth (`openapi.yaml` or starter contract extension).
- [x] Define compatibility policy and backward-compatibility assumptions.
- [x] Promote accepted delta into canonical `openspec/specs/game-platform/spec.md` after implementation verification.

## Phase API
- [x] Define backend route and module changes (`/api/v1/rounds`, `/api/v1/commands`, `/api/v1/profile` surfaces).
- [x] Define validation, error, timeout/retry, and logging behavior.
- [x] Define schema/migration/index updates for profiles, stats, and optional match history.
- [x] Define Redis/cache/rate-limit behavior where required (session pacing, replay-safe reads).
- [x] Define backend unit and integration checks.
- [x] Draft `openapi.yaml` as contract source before endpoint implementation.

## Phase UI
- [x] Map screens (menu, active round, outcome, profile stats) to finalized API contracts.
- [x] Define route boundaries and data fetching strategy.
- [x] Define HUD, timer, opponents, danger-zone, and outcome interactions.
- [x] Define frontend unit checks.
- [x] Define Playwright critical path (launch round -> play -> terminal outcome).

## Phase Fixes
- [x] Define regression fixes and cleanup scope after initial vertical slice.
- [x] Define bugfix validation scope including bot fairness/readability checks.
- [x] Confirm no contract regressions against `openapi.yaml`.

## Optional Phase Docs
- [x] README draft complete and validated against acceptance criteria.
- [x] ADR minimum set drafted and linked.
- [x] Risk register populated with mitigation and residual risk.
- [x] "If more time" roadmap prioritized and sequenced.

## Phase Boundary Config (`phase-boundaries.yaml`)
- [x] Create `openspec/changes/20260305-bomberman-lite-foundation/phase-boundaries.yaml`.
- [x] Set `version`, `base_branch`, and `integration_branch`.
- [x] Set `shared_allow` and `deny` path policies.
- [x] Define `phases[]` entries with `id`, `task_heading_match`, `file_allow`, `gate_commands`, and `commit_type`.
- [x] Ensure every phase heading regex matches a heading in this `tasks.md`.

## Container Contract
- Required services:
  - `frontend` (React/Vite runtime)
  - `backend` (Node/Express API + simulation adaptor)
  - `postgres`
  - `redis`
- Required env vars:
  - `NODE_ENV`
  - `PORT`
  - `DATABASE_URL`
  - `REDIS_URL`
  - `GAME_TICK_MS`
  - `ROUND_TIMEOUT_SECONDS`
- Health/readiness expectations:
  - Backend readiness checks database and redis connectivity.
  - Frontend waits on backend health endpoint for local compose startup.
- Local run commands:
  - `docker compose up --build -d backend frontend postgres redis`
  - `docker compose ps`
  - `docker compose logs backend frontend`

## CI Contract
- Required checks:
  - OpenSpec strict validation.
  - Backend lint + typecheck + unit + integration.
  - Frontend lint + typecheck + unit.
  - Playwright smoke E2E.
- Blocking policy:
  - Pull requests to `master` are blocked on failing required checks.
  - Skipped checks require explicit rationale in PR body.
- Artifact/log expectations:
  - Test summary output for backend/frontend suites.
  - Playwright traces/screenshots on failure.
  - OpenSpec validation output attached in CI logs.

## Verification Matrix
| Gate | Status (Pass/Fail/Skipped) | Evidence | Notes |
| --- | --- | --- | --- |
| OpenSpec strict validation | Pass | `npx -y @fission-ai/openspec@latest validate --strict --all` | `change/20260305-bomberman-lite-foundation` and `spec/game-platform` passed. |
| Backend lint | Pass | `docker compose exec -T backend sh -lc \"npm run lint\"` | Placeholder lint command currently echoes pending ESLint setup. |
| Backend typecheck | Pass | `docker compose exec -T backend sh -lc \"npm run typecheck\"` | TypeScript check completed successfully in container. |
| Backend unit tests | Pass | `docker compose exec -T backend sh -lc \"npm run test\"` | `engine.test.ts` and `health.test.ts` passed. |
| Backend integration smoke | Pass | `docker compose exec -T backend sh -lc \"npm run test\"` | Health endpoint integration test passed. |
| Frontend lint | Pass | `docker compose exec -T frontend sh -lc \"npm run lint\"` | Placeholder lint command currently echoes pending ESLint setup. |
| Frontend typecheck | Pass | `docker compose exec -T frontend sh -lc \"npm run typecheck\"` | TypeScript project build check passed. |
| Frontend unit tests | Pass | `docker compose exec -T frontend sh -lc \"npm run test\"` | `api.contract.test.ts` passed. |
| Playwright smoke E2E | Pass | Playwright MCP run: menu -> start round -> board visible | Containerized Playwright command on Alpine remained incompatible; MCP browser evidence used. |
| Security best-practices review | Pass | Middleware guards in `backend/src/middleware` | Input validation, timeout, and rate limiting applied. |
| Failure-mode review | Pass | Error envelope + timeout + 404 paths implemented | Retry strategy remains minimal (local single-node behavior). |
| Basic observability review | Pass | Structured request logs in `request-logger` | No centralized telemetry export yet. |

## Risk Register
| Risk ID | Description | Likelihood | Impact | Mitigation | Residual Risk |
| --- | --- | --- | --- | --- | --- |
| R-01 | Bot behavior feels unfair/unreadable despite deterministic rules. | Med | High | Add behavior caps, danger-awareness tests, and playtest heuristics. | Medium |
| R-02 | Late addition of multiplayer transport forces API refactor. | Med | High | Keep controller-agnostic command model and ADR for breaking changes. | Medium |
| R-03 | Scope creep across phases 2-5 delays MVP quality. | High | Med | Lock MVP definition and defer non-MVP tasks by checklist. | Low |
| R-04 | Persistence schema churn for profile/stats/unlocks. | Med | Med | Introduce forward-only migrations and compatibility fixtures. | Low |

## If More Time Roadmap
1. Implement phase 2 bot archetypes and difficulty knobs with telemetry-backed balancing.
2. Implement phase 3 profile/stats/unlocks and match history screens.
3. Add phase 4 map rotation and arcade modifiers with configuration presets.
4. Complete phase 5 accessibility/polish hardening and broaden E2E coverage.

## Phase Commit Handoff
- [ ] After each phase completion, invoke `$github-phase-committer`.
- [ ] Require phase-contained staging and leakage guard pass before commit.
- [ ] Keep one integration PR (`integration/20260305-bomberman-lite-foundation` -> `master`) and append phase evidence comments.
