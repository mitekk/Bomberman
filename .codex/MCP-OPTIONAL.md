# Optional MCP Servers (Later)

This project keeps the default MCP setup lean (`context7`, `github`, `playwright`).
Enable additional servers only when the assessment requires them.

## AWS-Heavy Assessments

- Candidate toolkit: `awslabs/mcp`
- Use when the task needs direct AWS service operations, IaC introspection, or account-context automation.
- Keep disabled by default to avoid unnecessary credential scope and startup overhead.

## Enablement Guidance

1. Confirm task scope is AWS-heavy.
2. Add the server to project-local `.codex/config.toml`.
3. Use least-privilege AWS credentials/profile.
4. Remove or disable after assessment if no longer needed.
