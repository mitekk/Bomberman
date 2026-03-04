# Delivery Checklist

Use before final submission.

## 1. Core functionality
- Vertical slice works end-to-end.
- Priority features implemented according to acceptance criteria.
- Non-critical ideas moved to deferred roadmap.

## 2. Frontend quality gates
- Lint passes.
- Typecheck passes.
- Unit tests pass.
- Smoke E2E for critical path passes.

## 3. Backend quality gates
- Lint passes.
- Typecheck passes.
- Unit tests pass.
- Integration smoke tests pass.

## 4. Security and resilience
- Input validation for external boundaries.
- Authentication/authorization checks where applicable.
- Error handling avoids leaking secrets/internal details.
- Timeout/retry strategy for external calls.

## 5. Leadership pack
- README: setup/run/test/assumptions/limitations.
- ADR or decision log with alternatives.
- Risk register with mitigations.
- "If more time" roadmap with prioritized sequence.

## 6. Final handoff summary
- Scope delivered.
- Tests executed and results.
- Known gaps and residual risks.
- Suggested next actions.
