# Phase Boundary Schema

Use `openspec/changes/<change-id>/phase-boundaries.yaml` as the source of truth for commit boundaries.

## Required Root Fields
- `version`: must be `1`.
- `base_branch`: branch used as PR base (for example `main` or `integration/adr-prod-first`).
- `integration_branch`: single PR head branch for phased delivery.
- `shared_allow`: glob patterns allowed across all phases.
- `deny`: glob patterns that are always blocked.
- `phases`: ordered list of phase entries.

## Phase Entry Fields
- `id`: short phase name (`spec`, `api`, `ui`, `fixes`, `tests`, `docs`, `chore`).
- `task_heading_match`: regex used to find this phase in `tasks.md`.
- `file_allow`: glob patterns allowed only for this phase.
- `gate_commands`: commands that must pass before commit; empty list is allowed.
- `commit_type`: conventional commit type (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`).

## Example
```yaml
version: 1
base_branch: "refactor/skills"
integration_branch: "refactor/skills/20260305-github-phase-committer/integration"
shared_allow:
  - "openspec/changes/20260305-github-phase-committer/tasks.md"
  - "openspec/changes/20260305-github-phase-committer/phase-boundaries.yaml"
  - "README.md"
deny:
  - ".env*"
  - "**/*.pem"
  - "**/*.key"
phases:
  - id: "spec"
    task_heading_match: "^##\\s+Phase\\s+Spec\\b"
    file_allow:
      - "openspec/**"
    gate_commands:
      - "npx -y @fission-ai/openspec@latest validate --strict"
    commit_type: "feat"
  - id: "api"
    task_heading_match: "^##\\s+Phase\\s+API\\b"
    file_allow:
      - "backend/**"
      - "openapi/**"
    gate_commands:
      - "npm run test:backend"
    commit_type: "feat"
  - id: "ui"
    task_heading_match: "^##\\s+Phase\\s+UI\\b"
    file_allow:
      - "frontend/**"
    gate_commands:
      - "npm run test:frontend"
    commit_type: "feat"
  - id: "fixes"
    task_heading_match: "^##\\s+Phase\\s+Fixes\\b"
    file_allow:
      - "backend/**"
      - "frontend/**"
      - "openspec/**"
    gate_commands: []
    commit_type: "fix"
```

## Matching Rules
- Paths are evaluated as repository-relative POSIX paths.
- A staged file is valid only if it matches `shared_allow` or the selected phase `file_allow`.
- Any match in `deny` causes a hard block.
- If phase auto-detection is ambiguous, pass `--phase <id>` explicitly.
