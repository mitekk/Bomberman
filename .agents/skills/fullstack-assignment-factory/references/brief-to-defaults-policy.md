# Brief-to-Defaults Policy

Record all decisions in `openspec/changes/<change-id>/proposal.md` with tags:
- `brief-derived`
- `fallback-applied`

## Priority Order
1. Assignment brief and acceptance criteria.
2. Explicit user overrides.
3. Existing starter code constraints.
4. Fallback default profile.

## Fallback Default Profile (use only when relevant)
- Frontend: React + Vite + Tailwind + TanStack.
- Backend: Node/Express + Redis.
- Data: Postgres.
- Deploy intent: Vercel-aligned.
- CI: GitHub Actions.
- Local runtime: containers.
- Tests: unit + integration + Playwright smoke.

## Mandatory Guardrails
- Never force defaults that conflict with brief constraints.
- Mark every default choice as "brief-derived" or "fallback-applied".
- When conflicts appear, choose brief/override and document why.
