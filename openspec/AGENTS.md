# OpenSpec Agent Contract

This repository uses OpenSpec as the canonical system for assignment specs and implementation tracking.

## Core rules
1. Never create root-level `specs/`; use `openspec/specs/`.
2. Every assignment or feature must have a change at `openspec/changes/<change-id>/`.
3. Change IDs must use `YYYYMMDD-<kebab-scope>`.
4. Do not implement code until strict gate passes:
   - `proposal.md` exists
   - `tasks.md` exists
   - at least one spec delta exists under `openspec/changes/<change-id>/specs/`
   - `npx -y @fission-ai/openspec@latest validate --strict` passes
5. Progress source of truth is task checkboxes in `tasks.md`.
6. Archive completed changes with `npx -y @fission-ai/openspec@latest archive "<change-id>" --yes`.

## Recommended flow
1. Create a change: `npx -y @fission-ai/openspec@latest new change "<change-id>"`
2. Fill `proposal.md`, `tasks.md`, and delta specs.
3. Validate: `npx -y @fission-ai/openspec@latest validate --strict`
4. Implement while keeping tasks current.
5. Re-validate and archive.
