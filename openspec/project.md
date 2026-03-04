# OpenSpec Project Conventions

## Purpose
Use OpenSpec to keep fullstack assignment requirements, design decisions, and implementation progress decision-complete and auditable.

## Canonical paths
- Specs: `openspec/specs/<domain>/spec.md`
- Active changes: `openspec/changes/<change-id>/`
- Archived changes: `openspec/changes/archive/YYYY-MM-DD-<change-id>/`

## Change naming
- Format: `YYYYMMDD-<kebab-scope>`
- Example: `20260304-cache-timeout-policy`

## Required artifacts before implementation
Each change must include:
- `proposal.md`
- `tasks.md`
- at least one delta spec in `specs/<domain>/spec.md`

Strict gate command:
```bash
npx -y @fission-ai/openspec@latest validate --strict
```

## Progress model
Progress is derived from checkbox state in `tasks.md`:
- `Not Started`: 0 checked tasks
- `In Progress`: at least one checked and one unchecked task
- `Done (Unarchived)`: all tasks checked and strict validation passes
- `Archived`: change archived with OpenSpec

Status command:
```bash
npx -y @fission-ai/openspec@latest status --change "<change-id>"
```

## Archive policy
Only archive after implementation and verification gates are complete:
```bash
npx -y @fission-ai/openspec@latest archive "<change-id>" --yes
```
