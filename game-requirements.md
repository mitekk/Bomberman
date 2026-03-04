# Bomberman-lite Product Requirements (Single Player + Bots, Multiplayer-ready)

## Product summary

A retro, tile-based arena game where the player places bombs to destroy blocks, collect power-ups, and outsmart **bots**. Rounds are short, replayable, and score-driven. While this spec is **single-player only**, the product is defined in a way that can later expand into multiplayer without rewriting the core rules.

## Goals

* Deliver a fun, readable, arcade-style experience in 1–5 minute rounds.
* Provide increasing challenge through bots, maps, and power-ups.
* Create a progression loop (stats, unlocks) to keep it replayable.
* Ensure the rule set and match flow are structured to support multiplayer later.

## Non-goals (early)

* No story/campaign in early phases.
* No complex physics or 3D.
* No user-generated content in early phases.

---

## Phase 1 — MVP (Core game loop + basic bots)

### 1) Game mode

* **Solo Arena:** one human player vs bots in a closed arena.

### 2) Arena rules

* The arena is a grid containing:

  * indestructible walls
  * destructible blocks
  * open walkable paths
* Each round begins with the player and bots spawning in safe starting areas.

### 3) Player actions

* The player can:

  * move around the grid
  * place bombs

### 4) Bomb and explosion rules

* Bombs detonate after a short delay.
* Explosions propagate in four directions until blocked.
* Explosions:

  * destroy destructible blocks
  * eliminate characters caught in the blast (player or bot)

### 5) Win/lose conditions

* The player **wins** if all bots are eliminated.
* The player **loses** if eliminated.
* A round can end in a **draw** if time runs out (with a clear rule for what happens next: e.g., count as a loss, or retry prompt).

### 6) Match presentation

The game must clearly show:

* bombs, fuse timing, and explosion areas
* destructible vs indestructible tiles
* remaining opponents
* a round timer
* outcome screen (win/lose/draw)

### 7) Bots (basic)

* Include at least 1–3 bots with simple behavior:

  * navigates around the map
  * avoids obvious danger when possible
  * places bombs occasionally
* Bot behavior should be understandable and feel “fair” (not random teleports, no unreadable advantage).

**MVP success criteria**

* A full round can be played start-to-finish reliably.
* The game feels readable (player understands why they died/won).
* Bots provide basic challenge and interaction with bombs/blocks.

---

## Phase 2 — Challenge depth (difficulty, bot variety, power-ups)

### 1) Difficulty levels

Add at least 3 difficulties (e.g., Easy / Normal / Hard) that change:

* bot aggressiveness
* bot survival instincts
* number of bots and/or round timer

### 2) Bot archetypes (simple variety)

Introduce 2–4 bot “styles,” for example:

* **Chaser:** prioritizes moving toward the player
* **Trapper:** places bombs to cut off paths
* **Survivor:** focuses on staying alive and punishing mistakes
* **Greedy:** prioritizes breaking blocks to find power-ups

### 3) Power-ups

Power-ups appear from destroyed blocks and are collectible:

* Increase bomb capacity
* Increase blast range
* Increase movement speed
* Optional: one “signature” power-up (e.g., bomb kick OR remote detonate—choose one)

Requirements:

* Power-ups must be visually distinct.
* Effects must be clearly communicated and persist for the rest of the round.

### 4) Round pacing

* Add a “sudden death” or escalation mechanic when time is low (to prevent slow stalemates), while keeping rules simple and readable.

---

## Phase 3 — Replayability loop (profiles, stats, progression)

### 1) Player profile (single device is fine)

* Player has a persistent profile with:

  * display name
  * basic avatar/skin selection (simple)

### 2) Stats tracking

Track at least:

* rounds played / wins / losses
* eliminations
* bombs placed
* longest win streak
* best time-to-win (optional)

### 3) Unlocks (cosmetic-first)

* Unlock cosmetics via achievements or milestones:

  * character skins/colors
  * bomb skin
  * explosion visual style (purely visual)

### 4) Match history

* Show a list of recent rounds with outcome and key stats.

---

## Phase 4 — Content expansion (maps, modes, “arcade” features)

### 1) Map rotation

* Provide 5–10 maps with distinct layouts and pacing.
* Maps should be designed to encourage movement and interaction (not just camping).

### 2) Arcade modifiers (optional toggles)

Add optional round modifiers (one at a time):

* “Fast bombs”
* “More blocks”
* “Power-up chaos”
* “No speed boosts” (classic mode)

### 3) Practice tools

* A “training” arena where the player can test power-ups and bomb mechanics without losing progress.

---

## Phase 5 — Polish and accessibility

### 1) Visual clarity

* Provide strong contrast for:

  * danger zones (imminent explosion)
  * explosions vs floor tiles
  * power-ups vs debris

### 2) Accessibility options

* Colorblind-friendly mode
* Reduced motion option
* Sound/music sliders and mute

### 3) Quality expectations

* Rounds should start quickly (minimal menus).
* Failure should encourage retry (“one more run”).

---

## Multiplayer-ready design requirements (still single-player)

These are product constraints that keep the door open for multiplayer later, without adding multiplayer now.

### A) Rule consistency

* The game rules must be fully defined and consistent regardless of who controls a character (human or bot).
* Bots must follow the same movement limits, bomb limits, and damage rules as the player.

### B) Match structure that can generalize

* Every round must have clear phases (e.g., Spawn → Active Round → Round End).
* Joining/leaving is not implemented now, but the game flow should be compatible with:

  * spectators
  * late join at next round
  * rematches in the same “session”

### C) Identity is future-friendly

* The player should be represented as a “participant” with a name/skin/stats—so later additional participants can exist (other humans).

### D) Outcomes and stats are recorded in a way that could later include multiple participants

* Stats screens and match history should be structured around “participants” rather than hard-coding “player vs bots.”

### E) Difficulty and fairness

* Difficulty should not depend on hidden advantages; it should come from behavior, map pressure, and pacing—this keeps it compatible with future PvP balance.

---

If you want, I can turn this into **user stories + acceptance criteria per phase** (super helpful for a Jira/Trello board), still without implementation details.
