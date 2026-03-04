# agent_starter

Codex interview starter configuration for timeboxed fullstack assessment tasks.

## Included setup
- Project instructions: `.codex/AGENTS.md`
- Project Codex config: `.codex/config.toml`
- Optional MCP recommendations: `.codex/MCP-OPTIONAL.md`
- Custom skill: `.agents/skills/fullstack-assignment-factory`
- Env template: `.env.example`
- OpenSpec workspace: `openspec/`

## Project-local skills in `.agents/skills`
- `fullstack-assignment-factory`

## Usage
1. Populate your local env values from `.env.example`.
2. Load env vars (choose one):
   - Preferred (`direnv`): install direnv, run `direnv allow` in this repo, and `.env` will auto-load.
   - Manual: `set -a; source .env; set +a`
3. Ensure this project is trusted in Codex so `.codex/config.toml` is applied.
4. Restart Codex so project-local skills and config are re-indexed.
5. Open this repo as the working directory so `.agents/skills` is in scan scope.
6. Invoke skills explicitly as needed, for example `$fullstack-assignment-factory`.

## OpenSpec workflow

Canonical planning artifacts are tracked in OpenSpec:
- Specs: `openspec/specs/<domain>/spec.md`
- Active changes: `openspec/changes/<change-id>/`
- Archived changes: `openspec/changes/archive/YYYY-MM-DD-<change-id>/`

Change ID format:
- `YYYYMMDD-<kebab-scope>` (example: `20260304-cache-timeout-policy`)

### Create a change
```bash
npx -y @fission-ai/openspec@latest new change "20260304-my-change"
```

### Update progress
Progress source of truth is checkbox state in `openspec/changes/<change-id>/tasks.md`:
- `Not Started`: zero checked tasks
- `In Progress`: at least one checked and one unchecked task
- `Done (Unarchived)`: all tasks checked and strict validation passing
- `Archived`: archived with OpenSpec CLI

Inspect progress:
```bash
npx -y @fission-ai/openspec@latest status --change "<change-id>"
```

### Validate
Run strict validation before implementation and before merge:
```bash
npx -y @fission-ai/openspec@latest validate --strict
```

### Archive
After implementation and verification gates complete:
```bash
npx -y @fission-ai/openspec@latest archive "<change-id>" --yes
```

### Helpful commands
```bash
npx -y @fission-ai/openspec@latest list
npx -y @fission-ai/openspec@latest show "<change-id>"
```
