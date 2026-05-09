# Drilldown sidecar - Restore Meeting Archive locally
Date: 2026-05-09
Parent task: Restore prior Meeting Archive git work into localhost:3000 for review
Session ceiling: Local/Mirror restore only: May 7 Meeting Archive dropdown, route, and HTML brief visible on localhost:3000. Production promotion waits for explicit approval.

## Open todos

* Restore prior archive implementation locally ✓
  - Prior work found in commit `32378c6 Add meeting archive brief`.
  - Brief-only source found in commit `b731387 Add cleaned post-meeting brief HTML`.
  - Expected files: `app/page.tsx`, `app/(protected)/meeting-archive/2026-05-07/page.tsx`, `components/ProtectedBareDocumentPage.tsx`, `components/Sidebar.tsx`, `next.config.ts`, `public/briefs/post-meeting-brief.html`.
  - Restored as working tree edits rather than a commit.
  - Kept current dashboard behavior and added only the archive dropdown pieces from the prior patch.
  - Adjusted `next.config.ts` so local dev and Vercel/Mirror run at root while GitHub Actions keeps `/north-star-donors`.
* Verify localhost:3000 behavior ✓
  - `npm run build` passed.
  - `http://localhost:3000/` returns 200.
  - Dashboard shows `Meeting Archive` near the top date line.
  - Dropdown shows `May 7, 2026`.
  - Archive route opens at `http://localhost:3000/meeting-archive/2026-05-07` and renders the post-meeting brief.
* Decide promotion readiness
  - Gate after local review; use `mirror-to-production` only if approved.
  - User concluded drilldown and asked for cleanup/commit.

## Notes / observations

- Current branch before restore: `feat/donor-app-improvements`.
- Existing unrelated dirty files before restore: `Captain's Log/index.md`, `Captain's Log/2026-05-09-mirror-to-production-skill.md`.
- Current source search did not show committed Meeting Archive UI in this branch.
- `npm run lint` still fails on existing repo-wide lint issues, including React set-state-in-effect errors in existing pages/components and a script `prefer-const` issue.
- Browser verification succeeded against the in-app browser on localhost.
- Git cleanup found no rebase/cherry-pick in progress.
- `stash@{0}` remains from `codex/open-sponsorship-packet-standalone`; it touches `app/page.tsx` and `app/team/[member]/TeamMemberClient.tsx` and appears to contain task/team-member follow-up work. Left untouched.
- Local `codex/*` branches still exist with upstream refs gone. Relevant Meeting Archive work has been restored here; other branch/stash work should be reviewed separately before pruning.

## Gate candidates

- Merge: restored archive UI into local branch. Chosen; committed locally.
- Promote: production app patch and assets after explicit approval. Deferred; use `mirror-to-production`; verify GitHub Pages base path and live brief URL first.
- Drop: archive/sidebar changes that feel too heavy after local review. Not chosen.
- Review later: `stash@{0}` task/team-member work and gone-upstream local branches before pruning.
