# Starter Analysis Checklist

Use this data in:
- `openspec/changes/<change-id>/proposal.md` (analysis narrative)
- `openspec/changes/<change-id>/specs/<domain>/spec.md` (normative requirements)

## Backend
- Existing route map and request/response shapes.
- Validation approach and error envelope.
- Middleware order and auth/access model.
- Timeout/retry behavior and external dependencies.

## Frontend
- Routing structure and data-fetch model.
- Existing state/query/cache boundaries.
- Reusable components and style system constraints.

## Data Layer
- Postgres schema and migration strategy.
- Redis usage and failure behavior.

## Compatibility Map
| Endpoint/Surface | Current Behavior | Proposed Change | Break Risk | Mitigation |
| --- | --- | --- | --- | --- |
|  |  |  | Low/Med/High |  |

## Spec Delta Mapping
| Requirement ID | Delta Spec Path | Change Type (Add/Modify/Remove) | Backward Compatible | Notes |
| --- | --- | --- | --- | --- |
|  | openspec/changes/<change-id>/specs/<domain>/spec.md |  | Yes/No |  |

## Evolution Rules
- Preserve behavior by default.
- Prefer additive changes.
- Route breaking changes through ADR with migration note.
