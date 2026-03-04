# Scaffold Instruction Template (Plan Mode Output)

Write this into `openspec/changes/<change-id>/tasks.md` using checkbox tasks.

## Gate Prerequisites
- [ ] `proposal.md` exists and is decision-complete.
- [ ] At least one spec delta exists under `specs/<domain>/spec.md`.
- [ ] `npx -y @fission-ai/openspec@latest validate --strict` passes.

## API-First Sequence
- [ ] Define contract source of truth (`openapi.yaml` or starter contract extension).
- [ ] Define backend route and module changes.
- [ ] Define validation, error, timeout/retry, and logging behavior.
- [ ] Define schema/migration/index updates.
- [ ] Define Redis/cache/rate-limit behavior only where required.
- [ ] Define backend unit and integration checks.

## UI-Second Sequence
- [ ] Map screens to finalized API contracts.
- [ ] Define route boundaries and data fetching strategy.
- [ ] Define table/list/search interactions where required.
- [ ] Define frontend unit checks.
- [ ] Define Playwright critical path.

## Container Contract
- Required services.
- Required env vars.
- Health/readiness expectations.
- Local run commands.

## CI Contract
- Required checks.
- Blocking policy.
- Artifact/log expectations.
