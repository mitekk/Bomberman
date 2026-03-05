# Proposal: Bomberman-lite Foundation Planning Packet

## Change Metadata
- Change ID: `20260305-bomberman-lite-foundation`
- Summary: Define the MVP-first, multiplayer-ready planning baseline for Bomberman-lite using API-first OpenSpec artifacts.
- Source brief: `game-requirements.md`

## Why Now and Expected Outcomes
The brief defines a multi-phase product but the repository has no starter runtime yet. This change establishes decision-complete planning artifacts so implementation can start with stable contracts, phase boundaries, and verification gates.

Expected outcomes:
- A clear MVP slice (Phase 1) with additive evolution to later phases.
- Architecture choice with explicit tradeoffs and documented rejected options.
- API-first and UI-second scaffold tasks that can be implemented in phase-contained commits.

## Brief Extraction
- Problem statement: Deliver a readable, replayable, solo arena Bomberman-lite experience with bots now and multiplayer-compatible rules later.
- Required deliverables: Core loop (movement, bombs, explosions, bots, win/lose/draw), progressive depth (difficulty/power-ups), replay loop (profile/stats/unlocks), and polish/accessibility phases.
- Submission format: Source repository with tracked specs/tasks (inferred from OpenSpec project conventions).
- Timebox/deadline: Not provided in brief.
- Hard constraints:
  - Single-player only for now.
  - Rule consistency regardless of controller type (player/bot).
  - Match flow must generalize to spectators/late join/rematch in future.
- Forbidden/early non-goals:
  - No campaign/story in early phases.
  - No complex physics/3D.
  - No UGC in early phases.

## Acceptance Criteria
| ID | Requirement | Source | Type | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| AC-001 | Solo Arena mode exists with one human player and 1-3 bots. | `game-requirements.md` Phase 1.1/1.7 | Explicit | Integration + E2E round start | Pending |
| AC-002 | Arena tiles support indestructible, destructible, and walkable semantics. | Phase 1.2 | Explicit | Unit simulation tests | Pending |
| AC-003 | Player can move and place bombs. | Phase 1.3 | Explicit | E2E control smoke | Pending |
| AC-004 | Bomb fuse and 4-direction blast propagation stop at blockers and resolve eliminations. | Phase 1.4 | Explicit | Unit + integration blast cases | Pending |
| AC-005 | Round ends with win, lose, or draw with explicit timeout rule. | Phase 1.5 | Explicit | Integration round lifecycle tests | Pending |
| AC-006 | HUD communicates bombs, fuse timing, blast zones, opponents, timer, and outcome. | Phase 1.6 | Explicit | UI unit + visual smoke | Pending |
| AC-007 | Bots navigate, avoid obvious danger, and place bombs in understandable/fair ways. | Phase 1.7 | Explicit | Bot behavior tests + playtest script | Pending |
| AC-008 | Difficulty tiers adjust bot behavior and pacing. | Phase 2.1 | Explicit | Config-driven integration tests | Pending |
| AC-009 | Power-ups are visually distinct and persist effects for round duration. | Phase 2.3 | Explicit | UI + simulation tests | Pending |
| AC-010 | Persistent profile tracks required stats and recent match history. | Phase 3 | Explicit | API + persistence tests | Pending |
| AC-011 | Accessibility includes colorblind mode, reduced motion, and audio controls. | Phase 5.2 | Explicit | Accessibility checklist + E2E toggles | Pending |
| AC-012 | Rules remain controller-agnostic and round phases are explicit for multiplayer readiness. | Multiplayer-ready A/B | Explicit | Contract + simulation invariants | Pending |

## Unknowns and Assumptions
| Item | Type | Impact (Low/Med/High) | Resolution Path |
| --- | --- | --- | --- |
| Target platform (web-only vs desktop/mobile) is unspecified. | Unknown | High | Confirm target clients before UI execution phase. |
| Real-time networking timeline is unspecified, only readiness is required now. | Unknown | Medium | Keep game engine deterministic and controller-agnostic; defer transport to ADR. |
| Deadline and grading rubric are not provided. | Unknown | Medium | Request timeline/rubric before estimating implementation phases. |
| No starter code exists; greenfield stack can follow defaults if brief-compatible. | Assumption | Medium | Document fallback usage and keep architecture reversible. |
| Containerized local development is acceptable. | Assumption | Low | Lock container contract in tasks and revisit only if environment constraints appear. |

## Scope Control
- MVP slice definition: Phase 1 only (core round loop + basic bots + readable presentation), with API contracts designed to expand into phases 2-5.
- Deferred to preserve delivery confidence:
  - Advanced bot archetypes and sudden death.
  - Profiles/stats/unlocks/history.
  - Content expansion and practice mode.
  - Full accessibility/polish package.

In scope now:
- Planning and spec deltas for phase-structured implementation.
- API-first contract surface and runtime contracts.

Out of scope now:
- Runtime implementation code.
- Infrastructure compute target lock-in.

Delivery confidence: `medium` due to absent timeline/rubric and no starter runtime.

## Phase 1 Starter Analysis (Greenfield)
### Backend inventory
- Existing route map: none in repository.
- Validation/error envelope: none yet.
- Middleware/auth/access model: none yet.
- Timeout/retry/external dependencies: none yet.

### Frontend inventory
- Routing/data-fetch model: none yet.
- State/query/cache boundaries: none yet.
- Reusable component/style constraints: none yet.

### Data layer inventory
- Postgres schema/migrations: none yet.
- Redis usage/failure behavior: none yet.

### Compatibility map
| Endpoint/Surface | Current Behavior | Proposed Change | Break Risk | Mitigation |
| --- | --- | --- | --- | --- |
| HTTP API surface | No existing endpoints | Introduce `/api/v1` additive baseline for rounds, commands, profile/stats | Low | Versioned namespace from day one; additive-only policy. |
| UI routes | No existing routes | Introduce menu, round, and results routes | Low | Keep route contracts internal and typed. |
| Persistence schema | No existing tables | Introduce profile/stats and optional match-history tables | Low | Migrations forward-only; seed fixtures for tests. |

### Spec delta mapping
| Requirement ID | Delta Spec Path | Change Type (Add/Modify/Remove) | Backward Compatible | Notes |
| --- | --- | --- | --- | --- |
| AC-001..AC-012 | `openspec/changes/20260305-bomberman-lite-foundation/specs/game-platform/spec.md` | Add | Yes | Greenfield baseline requirements for implementation phases. |

### Evolution rules
- Preserve behavior by default after first implementation cut.
- Prefer additive API/data changes.
- Route breaking changes through ADR with migration notes and compatibility window.

## Phase 2 Architecture Selection
| Option | Description | Delivery Risk | Ops Risk | Speed | Decision |
| --- | --- | --- | --- | --- | --- |
| A | Web-first: React + Vite frontend with deterministic game simulation module, Node/Express API, Postgres + Redis, containerized local runtime. | Medium | Medium | Fast | Selected |
| B | Server-authoritative simulation immediately (thin UI client + heavy realtime backend). | High | High | Slow | Rejected |
| C | Client-only game first (local storage, no backend until later). | Low | High (future rewrite) | Fastest short-term | Rejected |

Selected architecture: **Option A**.

Rationale:
- Preserves multiplayer-ready rule model without paying full realtime backend complexity immediately.
- Aligns with default profile where brief is silent.
- Keeps infra target unlocked: container contract is fixed, compute platform deferred.

Decision tags:
- `brief-derived`: deterministic rules, controller parity, explicit match lifecycle, readability-first UX.
- `fallback-applied`: React/Vite/Tailwind/TanStack, Node/Express, Redis, Postgres, GitHub Actions CI, Playwright smoke, containerized local runtime.

Rejected alternatives:
- Option B rejected for schedule/complexity overhead before multiplayer is required.
- Option C rejected because it likely forces contract rewrite when profiles/stats/multiplayer-readiness arrive.

## Phase 3 API-First Scaffold Direction
- Contract source of truth: `openapi.yaml` under backend module (to be created in API phase).
- API namespace: `/api/v1`.
- Controller-agnostic command model: player and bot actions pass through same simulation command interface.
- Compatibility policy: additive fields/endpoints only during active development; breaking changes require ADR + migration plan.
- Observability baseline: structured logs keyed by `round_id`, `tick`, `actor_id`, and outcome reason.
