# Scaffold Instruction Template (Plan Mode Output)

## API-First Sequence
1. Define contract source of truth (`openapi.yaml` or starter contract extension).
2. Define backend route and module changes.
3. Define validation, error, timeout/retry, and logging behavior.
4. Define schema/migration/index updates.
5. Define Redis/cache/rate-limit behavior only where required.
6. Define backend unit and integration checks.

## UI-Second Sequence
1. Map screens to finalized API contracts.
2. Define route boundaries and data fetching strategy.
3. Define table/list/search interactions where required.
4. Define frontend unit checks.
5. Define Playwright critical path.

## Container Contract
- Required services.
- Required env vars.
- Health/readiness expectations.
- Local run commands.

## CI Contract
- Required checks.
- Blocking policy.
- Artifact/log expectations.
