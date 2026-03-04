#!/usr/bin/env python3
from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

try:
    import yaml
except ImportError as exc:  # pragma: no cover - startup guard
    print("ERROR: Missing dependency 'PyYAML'. Install with: pip install pyyaml", file=sys.stderr)
    raise SystemExit(2) from exc

HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
CHECKBOX_RE = re.compile(r"^\s*-\s*\[( |x|X)\]\s+(.+?)\s*$")
SECRET_PATH_RE = re.compile(r"(^|/)\.env(\.|$)|\.(pem|key|p12|crt|cer)$", re.IGNORECASE)
SECRET_CONTENT_PATTERNS = [
    re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"ghp_[A-Za-z0-9]{20,}"),
    re.compile(r"ctx7sk-[A-Za-z0-9-]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"-----BEGIN [A-Z ]+ PRIVATE KEY-----"),
    re.compile(r"(?i)(api[_-]?key|secret|token)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{16,}"),
]


class GuardError(RuntimeError):
    """Actionable validation or git workflow error."""


@dataclass(frozen=True)
class PhaseConfig:
    id: str
    task_heading_match: str
    file_allow: list[str]
    gate_commands: list[str]
    commit_type: str


@dataclass(frozen=True)
class BoundaryConfig:
    version: int
    base_branch: str
    integration_branch: str
    shared_allow: list[str]
    deny: list[str]
    phases: list[PhaseConfig]


@dataclass(frozen=True)
class PhaseState:
    heading: str | None
    checked_tasks: list[str]
    unchecked_tasks: list[str]

    @property
    def is_complete(self) -> bool:
        return bool(self.checked_tasks or self.unchecked_tasks) and not self.unchecked_tasks


def run_cmd(cmd: list[str] | str, cwd: Path, *, check: bool = True, capture: bool = True, shell: bool = False) -> str:
    proc = subprocess.run(
        cmd,
        cwd=str(cwd),
        shell=shell,
        text=True,
        capture_output=capture,
    )
    if check and proc.returncode != 0:
        stdout = (proc.stdout or "").strip()
        stderr = (proc.stderr or "").strip()
        rendered = "\n".join([part for part in (stdout, stderr) if part])
        if not rendered:
            rendered = f"Command failed with exit code {proc.returncode}"
        cmd_text = cmd if isinstance(cmd, str) else " ".join(cmd)
        raise GuardError(f"Command failed: {cmd_text}\n{rendered}")
    return (proc.stdout or "").strip() if capture else ""


def git(repo: Path, *args: str, check: bool = True, capture: bool = True) -> str:
    return run_cmd(["git", *args], cwd=repo, check=check, capture=capture, shell=False)


def repo_root() -> Path:
    out = run_cmd(["git", "rev-parse", "--show-toplevel"], cwd=Path.cwd())
    return Path(out).resolve()


def resolve_change_id(repo: Path, explicit: str | None) -> str:
    if explicit:
        change_dir = repo / "openspec" / "changes" / explicit
        if not (change_dir / "tasks.md").exists():
            raise GuardError(f"Change '{explicit}' does not have tasks.md at {change_dir / 'tasks.md'}")
        return explicit

    changes_root = repo / "openspec" / "changes"
    if not changes_root.exists():
        raise GuardError("openspec/changes directory not found")

    candidates: list[str] = []
    for entry in sorted(changes_root.iterdir()):
        if not entry.is_dir():
            continue
        if entry.name in {"archive"}:
            continue
        if (entry / "tasks.md").exists():
            candidates.append(entry.name)

    if not candidates:
        raise GuardError("No active changes with tasks.md found under openspec/changes/")
    if len(candidates) > 1:
        options = ", ".join(candidates)
        raise GuardError(f"Multiple active changes found ({options}). Pass --change explicitly.")
    return candidates[0]


def normalize_patterns(items: Any, field_name: str) -> list[str]:
    if items is None:
        return []
    if not isinstance(items, list) or any(not isinstance(item, str) for item in items):
        raise GuardError(f"Field '{field_name}' must be a list of strings")
    return [item.strip() for item in items if item.strip()]


def parse_phase(raw: dict[str, Any]) -> PhaseConfig:
    required = {"id", "task_heading_match", "file_allow", "gate_commands", "commit_type"}
    missing = sorted(required - set(raw))
    if missing:
        raise GuardError(f"Phase entry missing required fields: {', '.join(missing)}")

    phase_id = raw["id"]
    heading_match = raw["task_heading_match"]
    commit_type = raw["commit_type"]
    if not isinstance(phase_id, str) or not phase_id.strip():
        raise GuardError("Phase 'id' must be a non-empty string")
    if not isinstance(heading_match, str) or not heading_match.strip():
        raise GuardError(f"Phase '{phase_id}' field 'task_heading_match' must be a non-empty string")
    if not isinstance(commit_type, str) or not commit_type.strip():
        raise GuardError(f"Phase '{phase_id}' field 'commit_type' must be a non-empty string")

    return PhaseConfig(
        id=phase_id.strip(),
        task_heading_match=heading_match.strip(),
        file_allow=normalize_patterns(raw["file_allow"], f"phases[{phase_id}].file_allow"),
        gate_commands=normalize_patterns(raw["gate_commands"], f"phases[{phase_id}].gate_commands"),
        commit_type=commit_type.strip(),
    )


def load_boundary_config(path: Path) -> BoundaryConfig:
    if not path.exists():
        raise GuardError(f"Missing phase boundary file: {path}")

    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        raise GuardError(f"Invalid YAML in {path}: {exc}") from exc

    if not isinstance(raw, dict):
        raise GuardError(f"Expected mapping at root of {path}")

    required = {"version", "base_branch", "integration_branch", "shared_allow", "deny", "phases"}
    missing = sorted(required - set(raw))
    if missing:
        raise GuardError(f"Missing required field(s) in {path.name}: {', '.join(missing)}")

    version = raw["version"]
    if isinstance(version, str) and version.isdigit():
        version = int(version)
    if version != 1:
        raise GuardError("Only phase-boundaries schema version 1 is supported")

    base_branch = raw["base_branch"]
    integration_branch = raw["integration_branch"]
    if not isinstance(base_branch, str) or not base_branch.strip():
        raise GuardError("Field 'base_branch' must be a non-empty string")
    if not isinstance(integration_branch, str) or not integration_branch.strip():
        raise GuardError("Field 'integration_branch' must be a non-empty string")

    phases_raw = raw["phases"]
    if not isinstance(phases_raw, list) or not phases_raw:
        raise GuardError("Field 'phases' must be a non-empty list")
    if not all(isinstance(item, dict) for item in phases_raw):
        raise GuardError("Field 'phases' must contain mapping entries")

    phases = [parse_phase(item) for item in phases_raw]
    phase_ids = [phase.id for phase in phases]
    if len(set(phase_ids)) != len(phase_ids):
        raise GuardError("Phase IDs must be unique in phase-boundaries.yaml")

    return BoundaryConfig(
        version=1,
        base_branch=base_branch.strip(),
        integration_branch=integration_branch.strip(),
        shared_allow=normalize_patterns(raw["shared_allow"], "shared_allow"),
        deny=normalize_patterns(raw["deny"], "deny"),
        phases=phases,
    )


def read_tasks_lines(tasks_path: Path) -> list[str]:
    if not tasks_path.exists():
        raise GuardError(f"Missing tasks file: {tasks_path}")
    return tasks_path.read_text(encoding="utf-8").splitlines()


def phase_state_for(tasks_lines: list[str], heading_pattern: str) -> PhaseState:
    try:
        matcher = re.compile(heading_pattern, re.IGNORECASE)
    except re.error as exc:
        raise GuardError(f"Invalid task_heading_match regex '{heading_pattern}': {exc}") from exc

    start_idx = -1
    start_level = 0
    heading_text: str | None = None

    for idx, line in enumerate(tasks_lines):
        heading_match = HEADING_RE.match(line)
        if not heading_match:
            continue
        if matcher.search(line):
            start_idx = idx + 1
            start_level = len(heading_match.group(1))
            heading_text = line.strip()
            break

    if start_idx < 0:
        return PhaseState(heading=None, checked_tasks=[], unchecked_tasks=[])

    end_idx = len(tasks_lines)
    for idx in range(start_idx, len(tasks_lines)):
        heading_match = HEADING_RE.match(tasks_lines[idx])
        if heading_match and len(heading_match.group(1)) <= start_level:
            end_idx = idx
            break

    checked_tasks: list[str] = []
    unchecked_tasks: list[str] = []
    for line in tasks_lines[start_idx:end_idx]:
        box = CHECKBOX_RE.match(line)
        if not box:
            continue
        checked = box.group(1).lower() == "x"
        text = box.group(2).strip()
        if checked:
            checked_tasks.append(text)
        else:
            unchecked_tasks.append(text)

    return PhaseState(heading=heading_text, checked_tasks=checked_tasks, unchecked_tasks=unchecked_tasks)


def path_matches(path: str, pattern: str) -> bool:
    target = path.strip()
    pat = pattern.strip()
    if not target or not pat:
        return False

    if PurePosixPath(target).match(pat):
        return True
    if fnmatch.fnmatch(target, pat):
        return True
    if pat.startswith("./"):
        trimmed = pat[2:]
        if PurePosixPath(target).match(trimmed) or fnmatch.fnmatch(target, trimmed):
            return True
    return False


def matches_any(path: str, patterns: list[str]) -> bool:
    return any(path_matches(path, pattern) for pattern in patterns)


def get_staged_files(repo: Path) -> list[str]:
    output = git(repo, "diff", "--cached", "--name-only", "--diff-filter=ACMR")
    files = [line.strip() for line in output.splitlines() if line.strip()]
    if not files:
        raise GuardError("No staged files found. Stage phase-scoped files first.")
    return sorted(files)


def evaluate_phase_scope(staged_files: list[str], phase: PhaseConfig, shared_allow: list[str]) -> tuple[int, list[str]]:
    phase_hits = 0
    leakage: list[str] = []

    for rel_path in staged_files:
        if matches_any(rel_path, shared_allow):
            continue
        if matches_any(rel_path, phase.file_allow):
            phase_hits += 1
            continue
        leakage.append(rel_path)

    return phase_hits, leakage


def read_staged_blob(repo: Path, rel_path: str) -> bytes:
    proc = subprocess.run(
        ["git", "show", f":{rel_path}"],
        cwd=str(repo),
        capture_output=True,
    )
    if proc.returncode != 0:
        raise GuardError(f"Unable to read staged blob for {rel_path}")
    return proc.stdout


def detect_secret_issues(repo: Path, staged_files: list[str]) -> list[str]:
    issues: list[str] = []

    for rel_path in staged_files:
        if SECRET_PATH_RE.search(rel_path):
            issues.append(f"{rel_path}: matches secret-sensitive filename pattern")
            continue

        blob = read_staged_blob(repo, rel_path)
        if not blob:
            continue
        if b"\x00" in blob[:4096]:
            continue
        if len(blob) > 750_000:
            continue

        text = blob.decode("utf-8", errors="ignore")
        for pattern in SECRET_CONTENT_PATTERNS:
            if pattern.search(text):
                issues.append(f"{rel_path}: matches secret-like content pattern '{pattern.pattern}'")
                break

    return issues


def run_gates(repo: Path, commands: list[str]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []

    for command in commands:
        proc = subprocess.run(
            command,
            cwd=str(repo),
            shell=True,
            text=True,
            capture_output=True,
        )
        results.append(
            {
                "command": command,
                "exit_code": proc.returncode,
                "stdout": (proc.stdout or "").strip(),
                "stderr": (proc.stderr or "").strip(),
            }
        )

    return results


def choose_phase(
    config: BoundaryConfig,
    tasks_lines: list[str],
    staged_files: list[str],
    explicit_phase: str | None,
) -> tuple[PhaseConfig, PhaseState, int]:
    phase_lookup = {phase.id: phase for phase in config.phases}

    if explicit_phase:
        if explicit_phase not in phase_lookup:
            options = ", ".join(phase_lookup)
            raise GuardError(f"Unknown phase '{explicit_phase}'. Valid phase IDs: {options}")

        phase = phase_lookup[explicit_phase]
        state = phase_state_for(tasks_lines, phase.task_heading_match)
        if not state.is_complete:
            raise GuardError(
                f"Phase '{phase.id}' is not complete in tasks.md. "
                f"Heading: {state.heading or 'not found'}"
            )

        phase_hits, leakage = evaluate_phase_scope(staged_files, phase, config.shared_allow)
        if leakage:
            joined = "\n- ".join(["", *leakage])
            raise GuardError(
                f"Phase leakage detected for phase '{phase.id}'. "
                f"The following staged files are out of scope:{joined}"
            )
        return phase, state, phase_hits

    candidates: list[tuple[PhaseConfig, PhaseState, int]] = []
    for phase in config.phases:
        state = phase_state_for(tasks_lines, phase.task_heading_match)
        if not state.is_complete:
            continue
        phase_hits, leakage = evaluate_phase_scope(staged_files, phase, config.shared_allow)
        if leakage:
            continue
        candidates.append((phase, state, phase_hits))

    if not candidates:
        completed = [
            phase.id for phase in config.phases if phase_state_for(tasks_lines, phase.task_heading_match).is_complete
        ]
        raise GuardError(
            "Could not auto-detect a complete phase that matches current staged files. "
            f"Completed phases: {completed or 'none'}. Pass --phase explicitly."
        )

    candidates.sort(key=lambda item: item[2], reverse=True)
    best_hits = candidates[0][2]
    best = [item for item in candidates if item[2] == best_hits]

    if len(best) > 1:
        ids = ", ".join(item[0].id for item in best)
        raise GuardError(
            f"Ambiguous phase detection ({ids}). Pass --phase explicitly to select one."
        )

    return best[0]


def compute_snapshot(repo: Path, change_id: str, phase_id: str, staged_files: list[str]) -> str:
    digest = hashlib.sha256()
    digest.update(change_id.encode("utf-8"))
    digest.update(phase_id.encode("utf-8"))

    for rel_path in sorted(staged_files):
        digest.update(rel_path.encode("utf-8"))
        blob_sha = git(repo, "rev-parse", f":{rel_path}")
        digest.update(blob_sha.encode("utf-8"))

    return digest.hexdigest()[:12]


def find_snapshot_commit(repo: Path, snapshot: str) -> str | None:
    out = git(
        repo,
        "log",
        "--all",
        "--format=%H",
        "--grep",
        f"Phase-Snapshot: {snapshot}",
        "-n",
        "1",
        check=False,
    )
    return out.strip() or None


def summary_text(state: PhaseState, phase_id: str) -> str:
    base = state.checked_tasks[0] if state.checked_tasks else f"complete {phase_id} phase checklist"
    compact = re.sub(r"\s+", " ", base).strip().rstrip(".")
    return compact[:72]


def build_commit_message(
    change_id: str,
    phase: PhaseConfig,
    state: PhaseState,
    staged_files: list[str],
    gate_results: list[dict[str, Any]],
    snapshot: str,
) -> str:
    header = f"{phase.commit_type}({phase.id}): {summary_text(state, phase.id)} [{change_id}]"

    scope_lines = state.checked_tasks or ["Completed phase checklist in tasks.md"]
    validation_lines: list[str] = []
    if gate_results:
        for item in gate_results:
            status = "pass" if item["exit_code"] == 0 else f"fail ({item['exit_code']})"
            validation_lines.append(f"`{item['command']}` [{status}]")
    else:
        validation_lines.append("No gate commands configured")

    file_lines = sorted(staged_files)

    body = [header, "", "Scope:"]
    body.extend([f"- {line}" for line in scope_lines])
    body.append("")
    body.append("Validation:")
    body.extend([f"- {line}" for line in validation_lines])
    body.append("")
    body.append("Files:")
    body.extend([f"- {line}" for line in file_lines])
    body.append("")
    body.append(f"Change-Id: {change_id}")
    body.append(f"Phase: {phase.id}")
    body.append("Leak-Check: pass")
    body.append(f"Phase-Snapshot: {snapshot}")

    return "\n".join(body) + "\n"


def ref_exists(repo: Path, ref: str) -> bool:
    return bool(git(repo, "rev-parse", "--verify", ref, check=False))


def ensure_integration_branch(repo: Path, base_branch: str, integration_branch: str, auto_checkout: bool) -> None:
    current = git(repo, "rev-parse", "--abbrev-ref", "HEAD")
    if current == integration_branch:
        return

    if not auto_checkout:
        raise GuardError(
            f"Current branch is '{current}', expected '{integration_branch}'. "
            "Re-run on integration branch or remove --no-auto-checkout."
        )

    if ref_exists(repo, f"refs/heads/{integration_branch}"):
        git(repo, "checkout", integration_branch, capture=False)
        return

    start_ref = None
    if ref_exists(repo, f"refs/heads/{base_branch}"):
        start_ref = base_branch
    elif ref_exists(repo, f"refs/remotes/origin/{base_branch}"):
        start_ref = f"origin/{base_branch}"

    if not start_ref:
        raise GuardError(
            f"Cannot create integration branch '{integration_branch}'. "
            f"Base branch '{base_branch}' not found locally or on origin."
        )

    git(repo, "checkout", "-b", integration_branch, start_ref, capture=False)


def make_pr_payload(
    change_id: str,
    config: BoundaryConfig,
    phase: PhaseConfig,
    commit_sha: str | None,
    gate_results: list[dict[str, Any]],
    staged_files: list[str],
    phase_branch: str,
) -> dict[str, Any]:
    validation = []
    if gate_results:
        for item in gate_results:
            validation.append(
                {
                    "command": item["command"],
                    "status": "pass" if item["exit_code"] == 0 else "fail",
                    "exit_code": item["exit_code"],
                }
            )
    else:
        validation.append({"command": "<none>", "status": "pass", "exit_code": 0})

    title = f"[{change_id}] Integration branch for phased delivery"
    body_lines = [
        f"Change: `{change_id}`",
        f"Base: `{config.base_branch}`",
        f"Head: `{config.integration_branch}`",
        "",
        "Phase commits are merged into the integration branch and linked by comments.",
    ]

    comment_lines = [
        f"Phase `{phase.id}` committed.",
        f"Commit: `{commit_sha or 'dry-run'}`",
        f"Phase branch: `{phase_branch}`",
        "",
        "Validation:",
    ]
    if gate_results:
        for item in gate_results:
            status_text = "pass" if item["exit_code"] == 0 else f"fail ({item['exit_code']})"
            comment_lines.append(f"- `{item['command']}` => {status_text}")
    else:
        comment_lines.append("- No gate commands configured")
    comment_lines.append("")
    comment_lines.append("Files:")
    comment_lines.extend([f"- `{path}`" for path in staged_files])

    return {
        "change_id": change_id,
        "base_branch": config.base_branch,
        "integration_branch": config.integration_branch,
        "phase_branch": phase_branch,
        "phase": phase.id,
        "commit_sha": commit_sha,
        "pull_request": {
            "title": title,
            "body": "\n".join(body_lines),
            "base": config.base_branch,
            "head": config.integration_branch,
        },
        "phase_comment": "\n".join(comment_lines),
        "validation": validation,
        "files": staged_files,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate phase boundaries, run gates, and perform phase-scoped commit/push."
    )
    parser.add_argument("--change", help="OpenSpec change ID (e.g. 20260305-phase-commits)")
    parser.add_argument("--phase", help="Phase ID from phase-boundaries.yaml")
    parser.add_argument("--tasks-path", help="Override tasks.md path")
    parser.add_argument("--config-path", help="Override phase-boundaries.yaml path")
    parser.add_argument("--emit-pr-payload", help="Write PR update payload JSON to this path")
    parser.add_argument("--dry-run", action="store_true", help="Validate and prepare outputs without committing")
    parser.add_argument("--no-push", action="store_true", help="Commit but do not push to origin")
    parser.add_argument(
        "--no-auto-checkout",
        action="store_true",
        help="Fail if not already on integration branch instead of checking out/creating it",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    try:
        repo = repo_root()
        change_id = resolve_change_id(repo, args.change)

        tasks_path = (
            Path(args.tasks_path).resolve()
            if args.tasks_path
            else repo / "openspec" / "changes" / change_id / "tasks.md"
        )
        config_path = (
            Path(args.config_path).resolve()
            if args.config_path
            else repo / "openspec" / "changes" / change_id / "phase-boundaries.yaml"
        )

        config = load_boundary_config(config_path)

        if not args.dry_run:
            ensure_integration_branch(
                repo,
                base_branch=config.base_branch,
                integration_branch=config.integration_branch,
                auto_checkout=not args.no_auto_checkout,
            )

        staged_files = get_staged_files(repo)

        deny_hits = [path for path in staged_files if matches_any(path, config.deny)]
        if deny_hits:
            joined = "\n- ".join(["", *deny_hits])
            raise GuardError(
                f"Staged files matched deny patterns in {config_path.name}:{joined}"
            )

        secret_issues = detect_secret_issues(repo, staged_files)
        if secret_issues:
            joined = "\n- ".join(["", *secret_issues])
            raise GuardError(f"Secret-leak guard failed for staged content:{joined}")

        tasks_lines = read_tasks_lines(tasks_path)
        phase, state, _ = choose_phase(config, tasks_lines, staged_files, args.phase)

        gate_results = run_gates(repo, phase.gate_commands)
        gate_failures = [result for result in gate_results if result["exit_code"] != 0]
        if gate_failures:
            details = []
            for item in gate_failures:
                details.append(f"{item['command']} -> exit {item['exit_code']}")
                if item["stdout"]:
                    details.append(f"stdout:\n{item['stdout']}")
                if item["stderr"]:
                    details.append(f"stderr:\n{item['stderr']}")
            raise GuardError("Phase gate commands failed:\n" + "\n".join(details))

        snapshot = compute_snapshot(repo, change_id, phase.id, staged_files)
        existing_sha = find_snapshot_commit(repo, snapshot)

        phase_branch = f"{config.base_branch}/{change_id}/{phase.id}"
        status = "ready"
        commit_sha: str | None = None

        if existing_sha:
            status = "already_committed"
            commit_sha = existing_sha
        elif args.dry_run:
            status = "ready"
        else:
            commit_message = build_commit_message(
                change_id=change_id,
                phase=phase,
                state=state,
                staged_files=staged_files,
                gate_results=gate_results,
                snapshot=snapshot,
            )

            with tempfile.NamedTemporaryFile(mode="w", delete=False, encoding="utf-8") as tmp_file:
                tmp_file.write(commit_message)
                tmp_path = Path(tmp_file.name)

            try:
                git(repo, "commit", "-F", str(tmp_path), capture=False)
            finally:
                tmp_path.unlink(missing_ok=True)

            commit_sha = git(repo, "rev-parse", "HEAD")
            git(repo, "branch", "-f", phase_branch, commit_sha, capture=False)

            if args.no_push:
                status = "committed"
            else:
                git(repo, "push", "origin", config.integration_branch, capture=False)
                git(repo, "push", "origin", phase_branch, "--force-with-lease", capture=False)
                status = "committed_and_pushed"

        payload = make_pr_payload(
            change_id=change_id,
            config=config,
            phase=phase,
            commit_sha=commit_sha,
            gate_results=gate_results,
            staged_files=staged_files,
            phase_branch=phase_branch,
        )

        if args.emit_pr_payload:
            out_path = Path(args.emit_pr_payload).expanduser().resolve()
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

        result = {
            "status": status,
            "change_id": change_id,
            "phase": phase.id,
            "phase_heading": state.heading,
            "base_branch": config.base_branch,
            "integration_branch": config.integration_branch,
            "phase_branch": phase_branch,
            "commit_sha": commit_sha,
            "snapshot": snapshot,
            "files": staged_files,
            "validation": [
                {
                    "command": item["command"],
                    "status": "pass" if item["exit_code"] == 0 else "fail",
                    "exit_code": item["exit_code"],
                }
                for item in gate_results
            ]
            if gate_results
            else [{"command": "<none>", "status": "pass", "exit_code": 0}],
            "pr_payload_path": str(Path(args.emit_pr_payload).expanduser().resolve())
            if args.emit_pr_payload
            else None,
        }

        print(json.dumps(result, indent=2))
        return 0

    except GuardError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
