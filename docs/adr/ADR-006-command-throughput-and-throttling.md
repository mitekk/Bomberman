# ADR-006: Command Throughput and Throttling Policy

## Status
Accepted

## Context
Input lockups were traced to a single global rate-limit bucket shared by polling and command traffic.
Under key-repeat and frequent round polling, legitimate gameplay command requests could be throttled, appearing as frozen controls.

## Decision
- Replace global rate limiting with route-scoped buckets:
  - `commands` bucket for `POST /api/v1/commands`
  - `reads` bucket for other API traffic
  - `health` bucket for `/health`
- Return explicit throttling metadata in `429` responses:
  - `error.code = RATE_LIMITED`
  - `error.details.bucket`
  - `error.details.retryAfterMs`
- Make limits configurable by environment:
  - `RATE_LIMIT_WINDOW_MS`
  - `RATE_LIMIT_COMMANDS_MAX`
  - `RATE_LIMIT_READS_MAX`
  - `RATE_LIMIT_HEALTH_MAX`
- Pace frontend command dispatch with a short cadence and queue-coalescing for repeated movement inputs.

## Consequences
- Normal gameplay traffic is less likely to starve command input.
- Clients can present actionable retry feedback instead of failing silently.
- Operational behavior is clearer and easier to tune without changing code.
