---
type: "captains-log"
date: "2026-05-09"
slug: "draft-sponsor-packet-v2-drilldown"
status: "complete"
created: "2026-05-09"
---

# Draft Sponsor Packet V2 Drilldown

> We turned the "Draft sponsor packet v2" todo from a fuzzy drafting task into a board-reviewable tier-architecture package, with the sponsor-facing packet and perk audit deliberately kept as follow-on work.

## Status & Purpose

The session focused on the dashboard task `Draft sponsor packet v2`.

The purpose was to stop treating the task as an amorphous "finish the packet" request and instead identify what could be responsibly completed now. The completed notch is a board-facing structure draft: enough to present the sponsorship tier architecture for approval without pretending the sponsor-facing packet or final benefit menu is complete.

The work connects to the Fund Development plan and the broader sponsorship pipeline: Haley's existing sponsor tracker, the May 7 development meeting, the v1 sponsorship packet draft, and the need to support real sponsor outreach with a usable structure.

## What Got Done

- Installed and used the local `/drilldown` workflow for one active umbrella todo.
- Created the drilldown sidecar at `sidecars/draft-sponsor-packet-v2-2026-05-09.md`.
- Created the working outline at `sidecars/draft-sponsor-packet-v2-working-outline.md`.
- Found the local export of Haley's Sponsor List & Tracker at `/Users/ender/code/vault/Sponsorship/source/2026-05-07-sponsor-list-tracker/`.
- Confirmed the full May 7 cleaned transcript exists at `/Users/ender/code/vault/data/transcripts/2026-05-07_first-developers-meeting-clean.md`.
- Clarified that Sponsorship Packet v1 was a pitch/draft artifact, not a sponsor-facing packet that had already been circulated.
- Cleared several tier-architecture decisions:
  - formal sponsorship begins at `$1,000` cash or approved in-kind value;
  - approved in-kind value can count toward sponsor tiers;
  - Haley / NSH should confirm in-kind fair value before final tier assignment;
  - `$5,000-$9,999` tier name is `Keystone`;
  - `Heritage Partner` is the first formal sponsor tier at `$1,000-$2,499`;
  - `Preservation Leader` remains the middle sponsor tier at `$2,500-$4,999`;
  - `Presenting Sponsor` is reserved for control benefits.
- Marked `Friend of North Star` as a working assumption below the formal sponsor ladder, with final recognition boundaries still open.
- Created the board-facing structure draft at `sidecars/draft-sponsor-packet-v2-board-structure.md`.
- Created the designed HTML board-review artifact at `sidecars/draft-sponsor-packet-v2-board-structure.html`.
- Rendered supporting artifacts:
  - `sidecars/draft-sponsor-packet-v2-board-structure-preview.png`;
  - `sidecars/draft-sponsor-packet-v2-board-structure.pdf`.
- Published the HTML artifact into the app public path at `public/sponsorship-plan/sponsor-packet-v2-board-structure.html`.
- Added `public/sponsorship-plan/nsh-house-hero.png` for the embedded HTML artifact.
- Updated the Mirror task row:
  - status: `in_progress`;
  - domain: `Sponsors`;
  - labels: `Decision`, `Editing`, `Needs Review`;
  - attachment: `/sponsorship-plan/sponsor-packet-v2-board-structure.html`;
  - notes shortened to status plus next sequence.
- Updated `app/page.tsx` so HTML task attachments render inline and include an explicit `Open full view` link for cramped viewports.

## Current Deliverables

- Board review HTML: `public/sponsorship-plan/sponsor-packet-v2-board-structure.html`
- Source HTML sidecar: `sidecars/draft-sponsor-packet-v2-board-structure.html`
- Board structure markdown: `sidecars/draft-sponsor-packet-v2-board-structure.md`
- Drilldown sidecar: `sidecars/draft-sponsor-packet-v2-2026-05-09.md`
- Working outline: `sidecars/draft-sponsor-packet-v2-working-outline.md`

The HTML artifact is preferred over PDF for review and future embedding. The PDF is a convenience export only.

## Decisions

- Treat v1 as draft/pitch source material, not as historical sponsor commitments.
- Keep v2 architecture separate from sponsor-facing final copy.
- Use `Keystone` for the `$5,000-$9,999` tier.
- Count cash, approved in-kind value, or a combination toward formal sponsor tiers.
- Set formal sponsorship floor at `$1,000`.
- Use this ladder for board review:
  - Friend of North Star: supporter lane below formal sponsorship, still open;
  - Heritage Partner: `$1,000-$2,499`;
  - Preservation Leader: `$2,500-$4,999`;
  - Keystone: `$5,000-$9,999`;
  - Presenting Sponsor: `$10,000+` or signature event underwriting.
- Reserve control benefits for Presenting unless the board explicitly approves an exception.
- Do not present `4 / 6 / 8 / 12` ticket counts as final.
- Do not create a new dashboard todo just for "update the task"; update the existing task, then use the existing perk-audit task as the next blocker.

## Still Open

- Final ticket counts.
- Final `Friend of North Star` recognition boundaries.
- Exact benefit menu by tier.
- Which v1 draft perks are deliverable, aspirational, or should be cut.
- Whether and how to promote the Mirror task row and HTML asset into Haley's live Master Portal Supabase.
- Whether the board-review HTML should become a formal packet asset or remain an internal decision artifact.

## Risks & Dependencies

- Production import into Haley's Supabase is not a blind copy. It requires mapping the live initiative ID, ensuring the HTML asset exists in the live deployed app, and using live project keys only after explicit approval.
- `dashboard-tasks` is intentionally Mirror-only. It should not be used to write to production Master Portal data.
- The task attachment preview depends on the app serving `/sponsorship-plan/sponsor-packet-v2-board-structure.html`.
- The board artifact relies on the local/public hero image at `/sponsorship-plan/nsh-house-hero.png`.
- Lint verification is currently blocked by unrelated repo-wide lint issues, mostly React lint/compiler rules in other pages/components.

## Next Moves

1. Review the board-facing HTML artifact in the dashboard task or directly at `/sponsorship-plan/sponsor-packet-v2-board-structure.html`.
2. Work the existing task `Audit sponsor packet v1 perks for deliverability`.
3. After board structure and perk audit are approved, draft the sponsor-facing Sponsor Packet V2.
4. If the work should appear in Haley's live donor app, run a separate production promotion step:
   - read live production task and initiative rows;
   - propose the exact live patch;
   - confirm the HTML asset deploy path;
   - wait for explicit approval before writing to live Supabase.

## Threads We Noticed

- OpenDesign exists locally, but no Codex-facing OpenDesign skill is installed yet.
- The v1 packet design system is reproducible and lives at `/Users/ender/code/vault/Sponsorship/artifacts/packet-v1-irma-boom/`.
- The dashboard task UI now supports inline HTML previews for task attachments.
- The current working tree has uncommitted changes in `app/page.tsx`, `public/sponsorship-plan/`, and `sidecars/`.

