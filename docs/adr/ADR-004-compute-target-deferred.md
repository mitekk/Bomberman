# ADR-004: Compute Target Deferred with Container Contract Locked

## Status
Accepted

## Context
The brief does not require a specific hosting platform.

## Decision
- Lock local/container runtime contract (`docker compose` services and env vars).
- Defer production compute target decision until operational constraints are provided.

## Consequences
- Preserves portability.
- Requires future decision once SLO/cost/traffic constraints are known.
