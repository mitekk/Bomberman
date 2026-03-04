---
name: fullstack-assignment-factory
description: Convert assignment briefs into decision-complete, API-first fullstack execution packets with starter-code compatibility analysis, architecture tradeoffs, scaffold instructions, verification gates, and leadership-pack outputs. Use when a user asks to handle a take-home/fullstack brief, analyze a starter project, prepare a scaffold plan, or orchestrate interview-grade FE+BE delivery. Do not implement by default; require explicit confirmation before execution.
---

# Fullstack Assignment Factory

## Objective
Produce a decision-complete delivery packet for fullstack assignment tasks before implementation.

## Non-Negotiable Rules
1. Derive architecture and stack from the brief first.
2. Use fallback defaults only when the brief is silent or compatible.
3. Analyze starter code before proposing route or contract changes.
4. Preserve compatibility by default and escalate breaking changes into ADR decisions.
5. Keep topology unlocked (do not force monorepo).
6. Keep infra target unlocked (lock container contract, defer compute decision to ADR).
7. Stop at plan + scaffold instructions unless user explicitly confirms execution.

## Workflow
1. **Phase 0: Intake**
- Parse goals, acceptance criteria, constraints, forbidden changes, and timeline.
- Record unknowns and assumptions with impact rating.
- Use [references/intake-checklist.md](references/intake-checklist.md).

2. **Phase 1: Starter Analysis**
- Inventory backend routes, middleware, validation, and error model.
- Inventory frontend routing/data-fetching constraints.
- Inventory DB/Redis integration and migration strategy.
- Produce compatibility map and route-evolution policy.
- Use [references/starter-analysis-checklist.md](references/starter-analysis-checklist.md).

3. **Phase 2: Architecture Selection**
- Propose 2-3 options with delivery risk, ops risk, and speed tradeoffs.
- Select one option and record rejected alternatives.
- Apply defaults only when relevant to the brief.
- Use [references/brief-to-defaults-policy.md](references/brief-to-defaults-policy.md).

4. **Phase 3: API-First Scaffold Instructions**
- Define OpenAPI-first contract steps.
- Define backend extension steps, validation, logging, timeout/retry, DB, and Redis roles.
- Define integration and compatibility checkpoints.
- Use [references/scaffold-instruction-template.md](references/scaffold-instruction-template.md).

5. **Phase 4: UI-Second Scaffold Instructions**
- Map UI screens and data boundaries to finalized API contracts.
- Define TanStack Query/Router/Table usage only if aligned to brief or defaults.
- Define unit and E2E scope.

6. **Phase 5: Verification Gates**
- Define frontend, backend, integration, E2E, security, failure-mode, and observability checks.
- Record skipped checks with rationale and residual risk.
- Use [references/verification-gates.md](references/verification-gates.md).

7. **Phase 6: Leadership Pack**
- Produce README requirements, ADR set, risk register, and roadmap outputs.
- Summarize delivered scope, deferred work, and residual risk.
- Use [references/leadership-pack-template.md](references/leadership-pack-template.md).

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
1. Intake summary.
2. Unknowns/assumptions with impact.
3. Starter compatibility map.
4. Architecture tradeoff decision.
5. API-first implementation sequence.
6. UI-second implementation sequence.
7. Container runtime contract.
8. CI and verification gate matrix.
9. Leadership pack checklist.
10. "If more time" roadmap.

Execution mode output (only after explicit user confirmation):
1. Concrete file tree.
2. Ordered edit plan.
3. Verification command list.

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

## Final Response Checklist
- Include assumptions and unresolved unknowns.
- Include tradeoff rationale for non-obvious decisions.
- Include tests/gates run or planned and any limitations.
- Include residual risks and next-step roadmap.
