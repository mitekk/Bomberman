# Scaffold Instruction Template (Plan Mode Output)

Write this into `openspec/changes/<change-id>/tasks.md` using checkbox tasks.

## Gate Prerequisites
- [ ] `proposal.md` exists and is decision-complete.
- [ ] At least one spec delta exists under `specs/<domain>/spec.md`.
- [ ] `npx -y @fission-ai/openspec@latest validate --strict` passes.

## Phase Spec
- [ ] Define problem statement and acceptance criteria deltas.
- [ ] Define contract source of truth (`openapi.yaml` or starter contract extension).
- [ ] Define compatibility policy and backward-compatibility assumptions.

## Phase API
- [ ] Define backend route and module changes.
- [ ] Define validation, error, timeout/retry, and logging behavior.
- [ ] Define schema/migration/index updates.
- [ ] Define Redis/cache/rate-limit behavior only where required.
- [ ] Define backend unit and integration checks.

## Phase UI
- [ ] Map screens to finalized API contracts.
- [ ] Define route boundaries and data fetching strategy.
- [ ] Define table/list/search interactions where required.
- [ ] Define frontend unit checks.
- [ ] Define Playwright critical path.

## Phase Fixes
- [ ] Define regression fixes and cleanup scope.
- [ ] Define bugfix validation scope.

## Optional Phase Docs
- [ ] Define README, ADR, risk register, and roadmap deliverables.

## Phase Boundary Config (`phase-boundaries.yaml`)
- [ ] Create `openspec/changes/<change-id>/phase-boundaries.yaml`.
- [ ] Set `version`, `base_branch`, and `integration_branch`.
- [ ] Set `shared_allow` and `deny` path policies.
- [ ] Define `phases[]` entries with `id`, `task_heading_match`, `file_allow`, `gate_commands`, and `commit_type`.
- [ ] Ensure every phase heading regex matches a heading in this `tasks.md`.

## Container Contract
- Required services.
- Required env vars.
- Health/readiness expectations.
- Local run commands.

## CI Contract
- Required checks.
- Blocking policy.
- Artifact/log expectations.

## Phase Commit Handoff
- [ ] After each phase completion, invoke `$github-phase-committer`.
- [ ] Require phase-contained staging and leakage guard pass before commit.
- [ ] Keep one integration PR (`integration_branch` -> `base_branch`) and append phase evidence comments.
