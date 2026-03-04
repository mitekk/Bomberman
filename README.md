# agent_starter

Codex interview starter configuration for timeboxed fullstack assessment tasks.

## Included setup
- Project instructions: `AGENTS.md`
- Project Codex config: `.codex/config.toml`
- Optional MCP recommendations: `.codex/MCP-OPTIONAL.md`
- Custom skill: `.agents/skills/fullstack-assignment-factory`
- Env template: `.env.example`

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
