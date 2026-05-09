---
type: "captains-log"
date: "2026-05-09"
slug: "mirror-to-production-skill"
status: "complete"
created: "2026-05-09"
---

# Captain's Log - Mirror to Production Skill

> We promoted the Sponsor Packet V2 board-review artifact into Haley's live donor app, verified the live site and production Supabase row, then turned the real migration path into a reusable Codex skill.

## Status & Purpose

We moved the Sponsor Packet V2 board-review artifact from local/Mirror work into Haley's actual Master Portal production environment.

The promotion included:

- publishing the board-review HTML and hero image to the production GitHub Pages app;
- adding HTML attachment preview and `Open full view` behavior to production `master`;
- inserting the live production task `Draft sponsor packet v2` into Haley's Supabase;
- adding a visible task comment above the HTML embed so the todo has human context without repeating the packet;
- creating and validating the new Codex skill `mirror-to-production`.

The purpose was twofold: make the board-review deliverable available in Haley's real workflow, and preserve the hard-won promotion process so future Mirror-to-live moves are safer and less improvisational.

## What Got Done

The live production app now serves:

- `https://northstarhouse.github.io/north-star-donors/`
- `https://northstarhouse.github.io/north-star-donors/sponsorship-plan/sponsor-packet-v2-board-structure.html`
- `https://northstarhouse.github.io/north-star-donors/sponsorship-plan/nsh-house-hero.png`

GitHub Pages deployed successfully from production commit `d2954ab` / `feat(tasks): publish sponsor packet board review artifact`.

Production Supabase now has task `63ec1fc9-3798-40b1-a9bd-18fdc3dbe0ef`:

- title: `Draft sponsor packet v2`;
- label: `Decision`;
- status: `in_progress`;
- initiative: `Sponsorship Plan` / `Sponsorships`;
- attachment: `https://northstarhouse.github.io/north-star-donors/sponsorship-plan/sponsor-packet-v2-board-structure.html`.

The task now has a visible comment:

> Board-review structure draft is ready for discussion. This is not the final sponsor-facing packet yet; next steps are to approve the tier structure, audit v1 perks for deliverability, then turn the approved structure into Sponsor Packet V2 copy.

The local drilldown sidecar was completed at:

`sidecars/promote-sponsor-packet-board-review-artifact-2026-05-09.md`

The new skill was created at:

`/Users/ender/.codex/skills/mirror-to-production/SKILL.md`

It includes the StarHouse-specific reference:

`/Users/ender/.codex/skills/mirror-to-production/references/starhouse-master-portal.md`

The skill passed `quick_validate.py`.

## Scope & Next Moves

The production promotion is complete for this artifact. No immediate site edit is pending.

Next sponsor-packet work remains:

- review/approve the board-facing tier structure;
- audit Sponsor Packet v1 perks for deliverability;
- decide which perks are real, proposed, aspirational, or cut;
- draft the sponsor-facing Sponsor Packet V2 after the structure and perk audit are cleared.

Next workflow/tooling work:

- use `mirror-to-production` on the next real promotion task;
- patch the skill if another production migration exposes new friction;
- avoid forward-testing the skill against live production without an explicit safe prompt and approval.

## Resource & Capacity

This work required production deploy access, production Supabase service-role access, GitHub Pages verification, and local skill creation.

The current repo was kept out of branch mess by using a separate temporary production worktree. That worktree was removed afterward, and GitHub auth was switched back to the normal active account.

No broad dependency upgrades were performed. A build warning noted GitHub Actions' future Node 20 deprecation, but it did not block deployment.

## Risk & Dependencies

The key risk discovered was schema drift between Mirror and production:

- Mirror `tasks` has `domain`, `blocked_by`, and array labels.
- Production `tasks` has scalar `label` and no `domain` or `blocked_by`.

That means future promotions cannot blindly copy rows. They must read production schema first and map the row deliberately.

The second risk was asset availability. A production task attachment is only useful after the live app serves the artifact. For GitHub Pages, the safe attachment URL shape is:

`https://northstarhouse.github.io/north-star-donors/...`

The third risk was GitHub auth. The default `endersclarity` account could not push directly to `northstarhouse/north-star-donors`, while `nsh-development` had the needed upstream/workflow access. Any future account switch must be cleaned up afterward.

## Decisions, Stakeholders, Learning

Decision: use `drilldown` for focused work and sidecar memory, not immediate dashboard proliferation.

Decision: use `dashboard-tasks` for Mirror only.

Decision: use `mirror-to-production` when local/Mirror work is ready for Haley's live donor app.

Decision: use `captainslog` for durable local paper trail.

Decision: the production task should carry a concise visible comment above the embed, because production currently renders task comments there rather than the underlying task `notes`.

Learning: the best skill came after one real migration pass. The sidecar captured the actual rough edges: schema drift, deploy target confusion, GitHub auth scope, asset URL verification, and cleanup.

Stakeholders who benefit:

- Haley, because the board-review artifact is now present in the live donor app;
- Kaelen / Codex, because the promotion path is now reusable;
- future agents, because the `mirror-to-production` skill tells them where the cliffs are.

## Threads We Noticed

- Node 20 GitHub Actions deprecation warnings will eventually need attention.
- The `mirror-to-production` skill has not been forward-tested by a fresh agent because it can touch live production.
- The Sponsor Packet V2 sponsor-facing draft still depends on perk audit and board/tier approval.
- Mirror and production schemas may continue to drift unless intentionally reconciled.
