# ADR-001: Architecture Baseline and Boundaries

## Status
Accepted

## Context
The product requires a single-player MVP now with multiplayer-ready rule consistency later.

## Decision
Use a web-first split architecture:
- Frontend UI client (React/Vite)
- Backend API + deterministic simulation adaptor (Express/TypeScript)
- Postgres + Redis as persistence/cache contracts

## Consequences
- Faster MVP delivery than immediate server-authoritative multiplayer.
- Keeps rule engine reusable for future controller/network modes.
