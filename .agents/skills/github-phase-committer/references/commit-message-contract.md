# Commit Message Contract

## Header Format
Use this exact pattern:

```text
<type>(<phase>): <summary> [<change-id>]
```

Examples:
- `feat(spec): define OpenSpec deltas for cache timeout [20260305-cache-timeout]`
- `feat(api): add retries and timeout handling [20260305-cache-timeout]`
- `fix(fixes): resolve null-state regression [20260305-cache-timeout]`

## Required Body Sections
The body must contain these sections in order:
1. `Scope:`
2. `Validation:`
3. `Files:`

## Required Footers
Include all footer lines:
- `Change-Id: <change-id>`
- `Phase: <phase-id>`
- `Leak-Check: pass`
- `Phase-Snapshot: <hash>`

## Determinism Rules
- Use the first checked task from the phase section as summary seed.
- Keep file list sorted lexicographically.
- Keep validation lines in gate command order.
- Use the same snapshot hash logic for duplicate prevention.

## Duplicate Prevention
If a commit already exists with the same `Phase-Snapshot`, do not create a new commit.
