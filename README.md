# Bomberman-lite

Retro tile-based Bomberman-style game with a single-player arena against bots, built to keep the rules multiplayer-ready.

## Stack
- Frontend: React + Vite + TanStack Query + React Router
- Backend: Node.js + Express + TypeScript
- Data layer contract: Postgres + Redis (containerized for local dev)
- Spec and planning: OpenSpec under `openspec/`

## Repository Layout
- `backend/`: API, simulation loop, validation, middleware, migrations, tests
- `frontend/`: UI routes/screens, API client, board rendering, smoke E2E scaffold
- `openspec/`: canonical change/spec tracking
- `docs/adr/`: architecture decisions

## Local Setup
1. Copy env vars from `.env.example` if needed.
2. Install dependencies:
   - `npm install`
   - `npm install --workspace backend`
   - `npm install --workspace frontend`
3. Start services with Docker:
   - `docker compose up --build -d postgres redis backend frontend`
4. Open the app:
   - Frontend: `http://localhost:5173`
   - Backend health: `http://localhost:3000/health`

## Development Commands
- Root workspace:
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Backend only:
  - `npm run dev --workspace backend`
  - `npm run test --workspace backend`
- Frontend only:
  - `npm run dev --workspace frontend`
  - `npm run test --workspace frontend`
  - `npm run e2e:smoke --workspace frontend`

## API Summary
- `POST /api/v1/rounds`: create round
- `GET /api/v1/rounds/:roundId`: fetch state
- `POST /api/v1/commands`: submit command (`move`, `bomb`, `wait`)
- `GET /api/v1/profile`: fetch profile stats
- `PATCH /api/v1/profile`: update display metadata

OpenAPI source is currently `backend/openapi.yaml`.

## Assumptions
- Single-player mode only for current implementation.
- Deterministic rules and actor parity are prioritized over advanced AI.
- In-memory stores are used for round/profile runtime in this phase.

## Known Limitations
- Persistence repositories are scaffolded by SQL migration contract, but runtime uses in-memory stores.
- Power-ups, advanced bot archetypes, and map rotation are not implemented yet.
- Full accessibility settings and production observability pipeline are not complete.
- OpenSpec strict CLI checks could not run in this environment due offline npm access.

## Roadmap (If More Time)
1. Add Postgres-backed repositories and Redis-backed session/rate-limit state.
2. Implement phase-2 features: bot archetypes, power-ups, sudden death pacing.
3. Expand testing: contract tests, bot fairness suites, and richer Playwright flows.
4. Introduce multiplayer transport while preserving current controller-agnostic simulation.
