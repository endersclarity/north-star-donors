# Drilldown sidecar - Promote Meeting Archive to Haley production
Date: 2026-05-09
Parent task: Port local Meeting Archive restore to Haley's live Master Portal
Session ceiling: Code/assets-only production promotion from local restore commit `1b98c07` onto `upstream/master`, with build and live URL verification. No Supabase production writes unless explicitly approved later.

## Open todos

* Prepare clean production worktree ✓
  - Source repo has unrelated dirty Captain's Log files, so production work must happen in a separate worktree.
  - Production deploy source is `upstream/master`.
  - Created `/Users/ender/code/north-star-donors-prod-promote` on `codex/promote-meeting-archive` from `upstream/master`.
* Port Meeting Archive patch ✓
  - Source commit: `1b98c07 Restore local meeting archive`.
  - Expected production files: dashboard dropdown, archive route, protected/static document viewer, Sidebar asset base fix, GitHub Pages-safe config, post-meeting brief HTML.
  - Production already had `protected_documents` row `post-meeting-brief-2026-05-07`; no Supabase write needed.
  - Production patch committed as `d0ec412 Add meeting archive brief`.
* Build production patch ✓
  - Local production worktree build passed with production public Supabase env.
  - GitHub Actions Pages build/deploy run `25612789301` passed.
* Verify live deployment path ✓
  - Production URL shape: `https://northstarhouse.github.io/north-star-donors/...`.
  - Dashboard verified: `https://northstarhouse.github.io/north-star-donors/` contains `Meeting Archive`.
  - Archive route verified visually: `https://northstarhouse.github.io/north-star-donors/meeting-archive/2026-05-07/` renders the post-meeting brief.
  - Static HTML asset verified: `https://northstarhouse.github.io/north-star-donors/briefs/post-meeting-brief.html` returns 200.

## Notes / observations

- Mirror/local branch: `feat/donor-app-improvements`.
- Production remote: `upstream` -> `northstarhouse/north-star-donors`.
- Latest observed upstream master: `d2954ab`.
- Treat production as write-protected until exact code patch is known.
- Initial push failed as `endersclarity`; switched GitHub auth to `nsh-development` for upstream push.

## Gate candidates

- Merge: production code/assets branch into `upstream/master`. Chosen; pushed `d0ec412`.
- Promote: live GitHub Pages deployment after push completes. Chosen; deploy succeeded.
- Drop: any Mirror-only sidecar/docs files from production patch. Chosen; restore sidecar was removed from production patch.
