---
name: fullstack-assignment-factory
description: Convert assignment briefs into decision-complete, API-first fullstack execution packets with starter-code compatibility analysis, architecture tradeoffs, scaffold instructions, verification gates, and leadership-pack outputs. Use when a user asks to handle a take-home/fullstack brief, analyze a starter project, prepare a scaffold plan, or orchestrate interview-grade FE+BE delivery. Do not implement by default; require explicit confirmation before execution.
---

# Fullstack Assignment Factory

## Objective
Produce decision-complete OpenSpec artifacts for fullstack assignment tasks before implementation.

## Non-Negotiable Rules
1. Derive architecture and stack from the brief first.
2. Use fallback defaults only when the brief is silent or compatible.
3. Analyze starter code before proposing route or contract changes.
4. Preserve compatibility by default and escalate breaking changes into ADR decisions.
5. Keep topology unlocked (do not force monorepo).
6. Keep infra target unlocked (lock container contract, defer compute decision to ADR).
7. Stop at plan + scaffold instructions unless user explicitly confirms execution.
8. Canonical specs must live in `openspec/specs`; never create root-level `specs/`.
9. Every assignment must use a change ID in `YYYYMMDD-<kebab-scope>` format under `openspec/changes/`.
10. Strict gate before implementation: `proposal.md`, `tasks.md`, and at least one spec delta must exist, and `npx -y @fission-ai/openspec@latest validate --strict` must pass.
11. Archive only after implementation and verification gates are complete.

## Workflow
0. **Bootstrap: OpenSpec Workspace**
- Ensure OpenSpec is initialized (`openspec/specs`, `openspec/changes`, `openspec/changes/archive`).
- If missing, initialize with `npx -y @fission-ai/openspec@latest init --tools codex .`.

1. **Phase 0: Intake**
- Create or select a change ID (`YYYYMMDD-<kebab-scope>`).
- Parse goals, acceptance criteria, constraints, forbidden changes, and timeline.
- Record unknowns and assumptions with impact rating.
- Write intake output into `openspec/changes/<change-id>/proposal.md`.
- Use [references/intake-checklist.md](references/intake-checklist.md).

2. **Phase 1: Starter Analysis**
- Inventory backend routes, middleware, validation, and error model.
- Inventory frontend routing/data-fetching constraints.
- Inventory DB/Redis integration and migration strategy.
- Produce compatibility map and route-evolution policy.
- Write compatibility and evolution policy into `proposal.md` and spec delta files under `openspec/changes/<change-id>/specs/<domain>/spec.md`.
- Use [references/starter-analysis-checklist.md](references/starter-analysis-checklist.md).

3. **Phase 2: Architecture Selection**
- Propose 2-3 options with delivery risk, ops risk, and speed tradeoffs.
- Select one option and record rejected alternatives.
- Apply defaults only when relevant to the brief.
- Write architecture decision into `proposal.md`; write behavioral requirements into spec deltas.
- Use [references/brief-to-defaults-policy.md](references/brief-to-defaults-policy.md).

4. **Phase 3: API-First Scaffold Instructions**
- Define OpenAPI-first contract steps.
- Define backend extension steps, validation, logging, timeout/retry, DB, and Redis roles.
- Define integration and compatibility checkpoints.
- Write implementation sequence to `openspec/changes/<change-id>/tasks.md` as executable checkboxes.
- Use [references/scaffold-instruction-template.md](references/scaffold-instruction-template.md).

5. **Phase 4: UI-Second Scaffold Instructions**
- Map UI screens and data boundaries to finalized API contracts.
- Define TanStack Query/Router/Table usage only if aligned to brief or defaults.
- Define unit and E2E scope.
- Write frontend sequence to `tasks.md` as checkbox tasks.

6. **Phase 5: Verification Gates**
- Define frontend, backend, integration, E2E, security, failure-mode, and observability checks.
- Record skipped checks with rationale and residual risk.
- Add a verification matrix and evidence placeholders in `tasks.md`.
- Use [references/verification-gates.md](references/verification-gates.md).

7. **Phase 6: Leadership Pack**
- Produce README requirements, ADR set, risk register, and roadmap outputs.
- Summarize delivered scope, deferred work, and residual risk.
- Add explicit leadership-pack completion tasks in `tasks.md`.
- Use [references/leadership-pack-template.md](references/leadership-pack-template.md).

8. **Phase 7: Gate + Handoff**
- Run `npx -y @fission-ai/openspec@latest status --change <change-id>`.
- Run `npx -y @fission-ai/openspec@latest validate --strict`.
- Report current progress state from task checkboxes: `Not Started`, `In Progress`, `Done (Unarchived)`, `Archived`.
- For completed implementation, archive with `npx -y @fission-ai/openspec@latest archive <change-id> --yes`.

## Input Contract
Required:
- Assignment brief text or acceptance criteria.

Optional:
- Starter repository paths and route map.
- Stack or platform constraints.
- Timeline and grading rubric.
- Explicit framework/database/testing/deployment overrides.

## Output Contract
Default output mode (always):
1. Change ID and artifact paths.
2. Intake summary in `proposal.md`.
3. Unknowns/assumptions with impact in `proposal.md`.
4. Starter compatibility map in `proposal.md` and spec deltas.
5. Architecture tradeoff decision in `proposal.md`.
6. API-first implementation sequence in `tasks.md`.
7. UI-second implementation sequence in `tasks.md`.
8. Container runtime contract in `tasks.md` and/or spec delta.
9. CI and verification gate matrix in `tasks.md`.
10. Leadership pack checklist and "if more time" roadmap in `tasks.md`.

Execution mode output (only after explicit user confirmation):
1. Concrete file tree.
2. Ordered edit plan.
3. Verification command list.
4. Task checkbox updates in `openspec/changes/<change-id>/tasks.md`.

## OpenSpec Command Checklist
- Initialize: `npx -y @fission-ai/openspec@latest init --tools codex .`
- Create change: `npx -y @fission-ai/openspec@latest new change "<change-id>"`
- List changes: `npx -y @fission-ai/openspec@latest list`
- Show change: `npx -y @fission-ai/openspec@latest show "<change-id>"`
- Progress status: `npx -y @fission-ai/openspec@latest status --change "<change-id>"`
- Validate gates: `npx -y @fission-ai/openspec@latest validate --strict`
- Archive change: `npx -y @fission-ai/openspec@latest archive "<change-id>" --yes`

## Brief-First Defaults Policy
When the brief is silent, use this default profile:
- Frontend: React + Vite + Tailwind + TanStack.
- Backend: Node/Express + Redis.
- DB: Postgres.
- Deployment intent: Vercel-aligned where relevant.
- CI: GitHub Actions.
- Local development: containerized.
- Testing: unit, integration, and Playwright smoke E2E.

## Trigger and Behavior Validation Scenarios
Use these scenario checks before finalizing responses:
1. Brief with no starter code: produce full plan packet and fallback defaults where relevant.
2. Brief with starter API and strict compatibility: produce additive evolution plan and ADR gates for breaks.
3. Conflicting constraints (speed vs rigor): present explicit tradeoff table and selected path.
4. User asks "implement now": still provide plan/scaffold first and require explicit execution confirmation.
5. User-provided stack conflicts with defaults: prioritize brief/overrides over default profile.
6. Brief omits infra: lock container contract, defer compute target decision to ADR.
7. Missing OpenSpec artifacts: refuse implementation and return artifact checklist to complete gate.

## Final Response Checklist
- Include assumptions and unresolved unknowns.
- Include tradeoff rationale for non-obvious decisions.
- Include tests/gates run or planned and any limitations.
- Include residual risks and next-step roadmap.
- Include change status and artifact path references under `openspec/`.
