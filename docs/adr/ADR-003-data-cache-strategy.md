# ADR-003: Data and Cache Strategy

## Status
Accepted

## Context
Profile/stats/history require persistence, while round state and request shaping benefit from fast cache.

## Decision
- Model profile/stats/history in Postgres via forward-only migrations.
- Use Redis for runtime session/cache/rate-limit concerns.
- Keep in-memory stores for current foundation phase, with repository seam for persistence migration.

## Consequences
- Enables phased delivery without blocking MVP on full infra integration.
- Requires follow-up implementation work to replace in-memory stores.
