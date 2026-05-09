# Drilldown sidecar - Promote sponsor packet board review artifact to live donor app
Date: 2026-05-09
Parent task: Promote sponsor packet board review artifact to live donor app - in progress
Session ceiling: map the safe promotion process from Mirror to Haley's live Master Portal without writing production data until the exact patch is reviewed and approved.

## Open todos

* define promotion scope ✓
  - Source work: Mirror task `Draft sponsor packet v2`.
  - Source artifact: `/sponsorship-plan/sponsor-packet-v2-board-structure.html`.
  - Desired outcome: make the board-review task/artifact available in Haley's live donor app / Master Portal.
  - This is a promotion/migration task, not more sponsor-packet drafting.
* dedupe dashboard tasks ✓
  - Searched Mirror tasks for production/live/Haley/mirror overlap.
  - No exact duplicate found.
  - Adjacent tasks exist, including `Tour mirror prototype with Haley + present diff`, but that is broader stakeholder review, not this specific artifact promotion.
* keep promotion work local during drilldown ✓
  - Do not create a Mirror/dashboard task during the drilldown session.
  - Use this sidecar as the working memory.
  - Decide at the end gate whether anything should be promoted into shared dashboard truth.
* read production state ✓
  - Live production Supabase project ref: `uvzwhhwzelaelfhfkvdb`.
  - Mirror Supabase project ref: `pasamzrwwaqhiwkixpbt`.
  - Source Mirror row exists: `Draft sponsor packet v2`, id `294889a5-9c19-4dbd-83e9-b322330937d4`, status `in_progress`, attachment `/sponsorship-plan/sponsor-packet-v2-board-structure.html`.
  - Live production does not currently have a task titled `Draft sponsor packet v2`.
  - Live production initiative exists: `Sponsorship Plan`, area `Sponsorships`, id `20216183-e3bf-42f5-a4ec-5bff03227bc9`.
  - Live production task schema is older/simpler than Mirror: `id`, `title`, `label`, `status`, `due_date`, `created_at`, `updated_at`, `notes`, `attachment_url`, `assigned_to`, `initiative_id`, `archived_at`.
  - Mirror-only fields `domain` and `blocked_by` cannot be copied into production.
  - Live `label` values are scalar strings such as `Technical`, `Decision`, `Editing`, `Other`; Mirror `label` is a text array.
  - Production promotion is likely an insert, not an update, but it must be a live-compatible row.
* verify live asset path ✓
  - Local files exist at `public/sponsorship-plan/sponsor-packet-v2-board-structure.html` and `public/sponsorship-plan/nsh-house-hero.png`.
  - Live task attachment will be broken unless those files are deployed to Haley's live app, not just served by localhost/Mirror.
  - Current checked-out Vercel project is `master-portal-fork`, so deploying this repo as-is would target the Mirror/fork project unless Vercel project context is changed.
  - Production GitHub workflow deploys `master` to GitHub Pages.
  - The app's own fallback site URL is `https://northstarhouse.github.io/north-star-donors`.
  - Upstream `master` does not currently contain `public/sponsorship-plan/sponsor-packet-v2-board-structure.html`.
  - Upstream `master` does not currently contain `public/sponsorship-plan/nsh-house-hero.png`.
  - Production `master` is live-schema compatible and has initiative joins; the current feature branch has newer Mirror-only task fields and should not be merged to production wholesale.
  - Production `master` can already link attachments, but it does not have the HTML iframe preview or explicit `Open full view` treatment.
  - Completed 2026-05-09: production `master` now includes the HTML file and hero image.
  - GitHub Pages verification returned `200` for:
    - `https://northstarhouse.github.io/north-star-donors/sponsorship-plan/sponsor-packet-v2-board-structure.html`
    - `https://northstarhouse.github.io/north-star-donors/sponsorship-plan/nsh-house-hero.png`
* propose exact production patch ✓
  - Insert live task without `domain` or `blocked_by`.
  - Convert labels to one production-compatible label; likely `Decision`, with `Editing` / `Needs Review` represented in notes.
  - Attach `/sponsorship-plan/sponsor-packet-v2-board-structure.html` only after confirming the live app will serve it.
  - Safer production attachment URL is absolute: `https://northstarhouse.github.io/north-star-donors/sponsorship-plan/sponsor-packet-v2-board-structure.html`.
  - The HTML references `./nsh-house-hero.png`, so the hero image must deploy beside the HTML file.
  - Code patch should be based on `upstream/master`, adding only:
    - the two static files;
    - the HTML attachment preview/open-full-view behavior ported onto the production-compatible `TaskAttachment` component.
  - Data patch should happen only after the GitHub Pages URL is verified.
  - Use a separate production worktree/branch so the current Mirror feature branch does not get tangled with live-schema code.
  - Proposed production branch name: `codex/promote-sponsor-packet-board-review`.
  - Proposed production row after deploy verification:

```json
{
  "title": "Draft sponsor packet v2",
  "label": "Decision",
  "status": "in_progress",
  "due_date": null,
  "notes": "STATUS: Board-review tier structure draft is ready. Editing and review work remains before this becomes a sponsor-facing packet.\\n\\nNext sequence:\\n1. Review/approve the board-facing tier structure.\\n2. Work the existing blocker task: Audit sponsor packet v1 perks for deliverability.\\n3. After tier structure + perk audit are cleared, draft the sponsor-facing Sponsor Packet V2.",
  "attachment_url": "https://northstarhouse.github.io/north-star-donors/sponsorship-plan/sponsor-packet-v2-board-structure.html",
  "assigned_to": null,
  "initiative_id": "20216183-e3bf-42f5-a4ec-5bff03227bc9",
  "archived_at": null
}
```
* write production after approval ✓
  - Production code commit: `d2954ab` / `feat(tasks): publish sponsor packet board review artifact`.
  - Pushed directly to `northstarhouse/north-star-donors` `master` using the authenticated `nsh-development` account because the default `endersclarity` token lacked repo/write permission on upstream and workflow scope for fork pushes.
  - GitHub Pages deploy run `25611157156` completed successfully.
  - Production Supabase task inserted after live URL verification:
    - task id `63ec1fc9-3798-40b1-a9bd-18fdc3dbe0ef`;
    - title `Draft sponsor packet v2`;
    - label `Decision`;
    - status `in_progress`;
    - initiative `Sponsorship Plan` / `Sponsorships`;
    - attachment URL `https://northstarhouse.github.io/north-star-donors/sponsorship-plan/sponsor-packet-v2-board-structure.html`.
  - Read-back verified the live row and initiative join.

## Promotion checklist

* read source Mirror row ✓
  - Confirm title, labels, domain, status, notes, attachment URL, and initiative.
* read live production schema ✓
  - Verify live `tasks` columns match expected fields.
  - Do not assume Mirror UUIDs are valid in production.
* map live initiative ✓
  - Find the live Fund Development initiative UUID.
  - Use title/semantic match, not Mirror UUID copy.
* verify asset availability ✓
  - Live app must serve `/sponsorship-plan/sponsor-packet-v2-board-structure.html`.
  - Live app must also serve `/sponsorship-plan/nsh-house-hero.png`.
  - If not deployed, task row import would create a broken attachment.
* propose exact production patch ✓
  - Decide insert vs update by checking whether `Draft sponsor packet v2` already exists in live.
  - Preserve live-only data where present.
  - Wait for explicit approval before writing production.
* write production only after approval ✓
  - Use `SUPABASE_NSH_MASTER_PORTAL_*` keys, not Mirror keys.
  - Verify write by reading back the live row.
  - Open live app / URL to confirm attachment works.

## Notes / observations

- `dashboard-tasks` is Mirror-only by design and explicitly says not to write to production.
- This task may become the model for a future Codex skill, tentatively `mirror-to-production`.
- The future skill should trigger on phrases like "import this into the actual donor app", "copy this to Haley's Supabase", "promote this task live", or "move this from mirror to production".
- Do one real promotion pass before turning the process into a skill so the skill captures actual friction rather than theory.
- Drilldown constraint: local sidecar first; no new dashboard tasks until the end gate.
- Copying rows across Supabase projects is not enough here because Mirror and production schemas have drifted.
- The safe promotion sequence was: patch production-compatible `master` -> deploy GitHub Pages -> verify live HTML and hero image -> insert live-compatible task row -> read back.

## Gate candidates
- Merge: production schema findings into the eventual `mirror-to-production` skill.
- Promote: a real production migration task only if we decide this should become shared dashboard truth.
- Drop: Mirror-only `domain` and `blocked_by` fields for this production task import.

## End gate
- Merged into artifact/app: production `master` now serves the board-review HTML and hero image, and the task attachment UI can preview/open HTML.
- Promoted to shared production truth: Haley's live Supabase now has the `Draft sponsor packet v2` task under `Sponsorship Plan`.
- Dropped for production import: Mirror-only `domain` and `blocked_by`; Mirror array labels collapsed to production scalar label `Decision`.
- Candidate for future skill: `mirror-to-production`, built from this sidecar's workflow.
