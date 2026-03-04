---
name: fullstack-assessment-lead
description: Execute timeboxed fullstack interview assessments from intake to handoff with explicit architecture tradeoffs, implementation sequencing, verification gates, and leadership artifacts. Use when handling take-home tasks, ambiguous briefs, FE+BE+infra scope, or tight deadlines where decision quality and communication are evaluated.
---

# Fullstack Assessment Lead

## Objective

Drive a complete and defensible delivery process for fullstack assessment tasks. Produce working software plus decision records, risk analysis, and a clear handoff package.

## Workflow

1. Intake and scope alignment
2. Architecture proposal and tradeoff selection
3. Vertical-slice implementation
4. Priority-based expansion
5. Verification and hardening
6. Leadership-pack handoff

### 1) Intake and scope alignment
- Parse requirements into: objective, acceptance criteria, constraints, and unknowns.
- Convert unknowns into explicit assumptions if blocking clarification is unavailable.
- Use [references/intake-checklist.md](references/intake-checklist.md) for a repeatable intake pass.

### 2) Architecture proposal and tradeoff selection
- Propose 2-3 viable architecture options when choices are meaningful.
- Rank options by delivery risk, implementation speed, and operational quality.
- Record the selected approach and rejected alternatives.
- Use [references/architecture-tradeoff-template.md](references/architecture-tradeoff-template.md).

### 3) Vertical-slice implementation
- Build an end-to-end happy path first (UI -> API -> persistence/integration).
- Keep the slice deployable and testable before adding lower-priority features.
- Ensure logs and errors are understandable and actionable.

### 4) Priority-based expansion
- Add features in descending assessment value.
- Avoid speculative abstractions unless they reduce near-term risk or complexity.
- Keep a short "deferred improvements" list while implementing.

### 5) Verification and hardening
- Run frontend and backend quality gates relevant to the stack.
- Perform security and failure-mode checks.
- Document any skipped checks and their rationale.
- Use [references/delivery-checklist.md](references/delivery-checklist.md).

### 6) Leadership-pack handoff
- Deliver the required docs: README, decision log/ADR, risk register, and next-steps roadmap.
- Frame tradeoffs and residual risk in language useful for interview evaluation.
- Use [references/risk-register-template.md](references/risk-register-template.md).

## Trigger Cases

- "Build this take-home fullstack assessment."
- "The brief is vague; make reasonable assumptions and deliver."
- "Implement FE + BE + infra with clear architecture rationale."
- "Ship under time pressure but keep production quality."

## Operating Defaults

- Default to TypeScript-first when language is not specified.
- Stay cloud-agnostic with AWS-ready design decisions.
- Prioritize production rigor over speed-only optimization.
- Prefer explicit constraints over hidden assumptions.

## Output Contract

- Working code that meets core acceptance criteria.
- Short architecture decision log with alternatives considered.
- Risk register with mitigations and residual risk.
- "If more time" roadmap with ordered priorities.
- Final summary of tests run and remaining gaps.

## References

- Intake checklist: [references/intake-checklist.md](references/intake-checklist.md)
- Architecture tradeoff template: [references/architecture-tradeoff-template.md](references/architecture-tradeoff-template.md)
- Delivery checklist: [references/delivery-checklist.md](references/delivery-checklist.md)
- Risk register template: [references/risk-register-template.md](references/risk-register-template.md)
