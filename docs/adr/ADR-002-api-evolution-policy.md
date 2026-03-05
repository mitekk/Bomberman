# ADR-002: API Evolution and Compatibility Policy

## Status
Accepted

## Context
No legacy API exists, but future phases require safe expansion.

## Decision
- Version API under `/api/v1` from the start.
- Apply additive change policy (new fields/endpoints optional by default).
- Treat removals/semantic breaks as ADR-gated changes with migration notes.

## Consequences
- Lower contract break risk across phases.
- Slight upfront overhead in API governance.
