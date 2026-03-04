# Codex Interview Agent Contract

## Mission
Deliver interview-grade fullstack solutions with explicit tradeoffs and leadership-quality documentation.

## Defaults
- Use TypeScript-first for frontend and backend when language is unspecified.
- Stay cloud-agnostic by default while keeping implementation AWS-ready.
- Prioritize production rigor over raw speed.
- Keep scope tight: implement only what maps to acceptance criteria or explicitly recorded assumptions.

## Standard Workflow
1. Parse the brief into goals, constraints, acceptance criteria, and unknowns.
2. Propose architecture options and a tradeoff table before major implementation.
3. Implement a vertical slice first (end-to-end happy path).
4. Expand features by priority, preserving working software after each step.
5. Run verification gates and record failures, mitigations, or deferred work.
6. Produce the leadership pack before final handoff.

## Mandatory Leadership Pack
- `README.md` with setup, run, test, assumptions, and known limitations.
- ADR or decision log documenting major architecture choices and alternatives considered.
- Risk register with mitigation strategy and residual risk.
- "If more time" roadmap with prioritized next improvements.

## Quality Gates
Run all applicable gates, or report exactly why a gate could not run.

### Frontend Gates
- Lint
- Typecheck
- Unit tests
- Smoke E2E (critical path only)

### Backend Gates
- Lint
- Typecheck
- Unit tests
- Integration smoke tests

### Cross-Cutting Gates
- Security best-practices review
- Failure-mode review (timeouts, retries, validation, error surfaces)
- Basic observability check (logs and actionable error messages)

## Tooling Policy
- Use `context7` MCP for framework, API, SDK, and version-specific guidance.
- Use `playwright` MCP for browser-level validation and smoke E2E checks.
- Use `github` MCP for PR/issues/review tasks when repository workflows require it.
- Treat `.agents/skills` as the primary skill source for this repository (both curated and custom skills).

## MCP Configuration Intent
- Active baseline MCPs: `context7` (project-local), `github`, `playwright`.
- Optional later MCPs: AWS MCP toolkit for AWS-heavy assessments.

## Security and Secrets
- Never commit secrets or tokens.
- Keep runtime credentials in environment variables (for example `GITHUB_PAT_TOKEN`).
- Prefer `.env` for local development and `.env.example` for documented placeholders.

## Output Requirements
- Surface assumptions explicitly when requirements are ambiguous.
- Provide concise progress updates during implementation.
- Include tradeoff rationale for non-obvious choices.
- End with a clear summary of implemented scope, tests run, and residual risks.

## Skill Routing
- Use `fullstack-assignment-factory` for assignment/take-home orchestration requests that require brief intake, starter analysis, architecture tradeoffs, and scaffold planning.
- Use `github-phase-committer` for phase-scoped commit/push workflows that must block cross-phase leakage and keep one integration PR updated.
- Keep `fullstack-assessment-lead` available for implementation-heavy execution once planning is approved.
- Enforce planning-first behavior for assignment orchestration and require explicit user confirmation before implementation.
- Derive stack defaults from the assignment brief first; apply fallback defaults only when brief constraints are silent.
