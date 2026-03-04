---
name: github-phase-committer
description: Automate phase-scoped commits and GitHub synchronization for OpenSpec changes. Use when the user asks to commit/push a development phase (spec/api/ui/fixes/tests/docs/chore), enforce phase-contained staging with leakage blocking, generate deterministic commit messages, and keep one integration PR updated.
---

# GitHub Phase Committer

## Objective
Commit and push one completed OpenSpec phase at a time without cross-phase leakage, then update a single integration PR.

## Inputs
- Active change in `openspec/changes/<change-id>/`.
- `tasks.md` with stable phase headings.
- `phase-boundaries.yaml` matching the schema in [references/phase-boundary-schema.md](references/phase-boundary-schema.md).

## Core Workflow
1. Resolve change ID.
- Prefer explicit `--change`.
- If omitted, auto-detect from `openspec/changes/*/tasks.md`; fail on ambiguity.

2. Validate phase completion and staged scope.
- Parse `tasks.md` using each phase `task_heading_match`.
- Treat a phase as complete only when its section has checkboxes and all are checked.
- Hard block if staged files fall outside `shared_allow + phase.file_allow`.
- Hard block if staged files hit `deny` patterns.
- Hard block obvious secret leaks (`.env*`, key/cert files, token-like content).

3. Run phase gates.
- Execute `gate_commands` in order.
- If a command fails, stop before commit.
- Empty `gate_commands` is allowed.

4. Commit + push.
- Commit on `integration_branch`.
- Create/update phase branch pointer: `<base_branch>/<change-id>/<phase>`.
- Push integration and phase branches to `origin`.

5. PR sync (single PR model).
- Use GitHub MCP with payload emitted by the script.
- PR head is always `integration_branch`, base is `base_branch`.
- Post a phase summary comment with commit SHA and validation evidence.

## Command Contract
Dry run:
```bash
python .agents/skills/github-phase-committer/scripts/phase_guard.py \
  --change "<change-id>" \
  --phase "<phase-id>" \
  --dry-run \
  --emit-pr-payload /tmp/<change-id>-<phase>-pr.json
```

Execute commit + push:
```bash
python .agents/skills/github-phase-committer/scripts/phase_guard.py \
  --change "<change-id>" \
  --phase "<phase-id>" \
  --emit-pr-payload /tmp/<change-id>-<phase>-pr.json
```

Commit without push:
```bash
python .agents/skills/github-phase-committer/scripts/phase_guard.py \
  --change "<change-id>" \
  --phase "<phase-id>" \
  --no-push
```

## Guardrails
- Never mix phases in one commit.
- Never commit secret material.
- Never generate a second commit for the same phase snapshot.
- Fail fast with actionable errors when `phase-boundaries.yaml` is missing or invalid.

## References
- Schema and examples: [references/phase-boundary-schema.md](references/phase-boundary-schema.md)
- Commit format contract: [references/commit-message-contract.md](references/commit-message-contract.md)
