# Verification Gates

Include this matrix in `openspec/changes/<change-id>/tasks.md` and keep evidence links updated.

## OpenSpec Gate
- `npx -y @fission-ai/openspec@latest validate --strict`

## Frontend
- Lint.
- Typecheck.
- Unit tests.
- Smoke E2E (critical path).

## Backend
- Lint.
- Typecheck.
- Unit tests.
- Integration smoke tests.

## Cross-Cutting
- Security best-practices review.
- Failure-mode review (timeouts/retries/validation/error surfaces).
- Basic observability review (logs, traceability, actionable errors).

## Reporting Format
| Gate | Status (Pass/Fail/Skipped) | Evidence | Notes |
| --- | --- | --- | --- |
| OpenSpec strict validation |  |  |  |
|  |  |  |  |

Always report skipped gates and residual risk.
