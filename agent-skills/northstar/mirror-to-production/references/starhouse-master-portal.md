# StarHouse Master Portal Promotion Reference

Use this reference only when working on the north-star-donors / Master Portal promotion path.

## Repos and deploys

- Working repo: `/Users/ender/code/north-star-donors`
- Public fork remote: `origin` -> `endersclarity/north-star-donors`
- Production remote: `upstream` -> `northstarhouse/north-star-donors`
- Production deploy source: `upstream/master`
- Production frontend: `https://northstarhouse.github.io/north-star-donors`
- Mirror/fork Vercel project observed locally: `.vercel/project.json` may point to `master-portal-fork`; do not treat that as Haley production.

## Supabase env names

Env source observed locally: `/Users/ender/.claude/.env`

Mirror:

- `SUPABASE_NSH_MASTER_PORTAL_MIRROR_REST_URL`
- `SUPABASE_NSH_MASTER_PORTAL_MIRROR_SERVICE_ROLE_KEY`
- project ref observed: `pasamzrwwaqhiwkixpbt`

Production:

- `SUPABASE_NSH_MASTER_PORTAL_REST_URL`
- `SUPABASE_NSH_MASTER_PORTAL_SERVICE_ROLE_KEY`
- project ref observed: `uvzwhhwzelaelfhfkvdb`

Never print service-role keys.

## Observed schema drift

Mirror `tasks` observed fields:

- `id`
- `title`
- `label` as text array
- `domain` as text array
- `status`
- `due_date`
- `notes`
- `attachment_url`
- `assigned_to`
- `initiative_id`
- `blocked_by` as uuid array
- timestamps

Production `tasks` observed fields:

- `id`
- `title`
- `label` as scalar string
- `status`
- `due_date`
- `created_at`
- `updated_at`
- `notes`
- `attachment_url`
- `assigned_to`
- `initiative_id`
- `archived_at`

Production `initiatives` observed fields:

- `id`
- `title`
- `area`
- `status`
- timestamps

Do not copy Mirror `domain` or `blocked_by` into production. Collapse array labels to one production label and preserve extra meaning in notes when needed.

## Proven promotion example

On 2026-05-09, the Sponsor Packet V2 board-review artifact promotion followed this path:

1. Read Mirror row `Draft sponsor packet v2`.
2. Read production schema and confirmed no existing production task by that title.
3. Found production initiative `Sponsorship Plan` / `Sponsorships`.
4. Patched production `master` with:
   - `public/sponsorship-plan/sponsor-packet-v2-board-structure.html`
   - `public/sponsorship-plan/nsh-house-hero.png`
   - production-compatible HTML attachment preview/open-full-view UI.
5. Built successfully with production public Supabase env vars.
6. Pushed `d2954ab` to `northstarhouse/north-star-donors` `master`.
7. Verified GitHub Pages returned `200` for the HTML and image.
8. Inserted production task `63ec1fc9-3798-40b1-a9bd-18fdc3dbe0ef`.

Good production attachment URL shape:

```text
https://northstarhouse.github.io/north-star-donors/sponsorship-plan/<file>.html
```

## Meeting archive promotion example

On 2026-05-09, the May 7 meeting archive promotion followed this path:

1. Restored and reviewed the archive locally on `feat/donor-app-improvements`.
2. Created a clean production worktree from `upstream/master`.
3. Ported only code/assets:
   - `app/(protected)/meeting-archive/2026-05-07/page.tsx`
   - `app/page.tsx`
   - `components/ProtectedBareDocumentPage.tsx`
   - `components/Sidebar.tsx`
   - `public/briefs/post-meeting-brief.html`
4. Read production `protected_documents` for slug `post-meeting-brief-2026-05-07` and confirmed the backing row already existed. No Supabase write was needed.
5. Built locally in the production worktree with production public env only:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
6. Switched GitHub auth from `endersclarity` to `nsh-development` for the upstream push, then switched back afterward.
7. Pushed `d0ec412` to `northstarhouse/north-star-donors` `master`.
8. Waited for GitHub Pages run `25612789301`, which passed.
9. Verified live URLs:
   - `https://northstarhouse.github.io/north-star-donors/`
   - `https://northstarhouse.github.io/north-star-donors/meeting-archive/2026-05-07/`
   - `https://northstarhouse.github.io/north-star-donors/briefs/post-meeting-brief.html`
10. Browser-verified the route rendered the brief, because HTTP `200` alone did not prove iframe/protected-document content displayed.

Promotion snags that should be expected:

- A clean temp worktree may not have `.env.local`, so static export can fail until production public env is supplied.
- The default active GitHub account may be able to push the fork but not `upstream`.
- Code/assets-only promotions can still need production data read-back when the UI fetches records such as `protected_documents`.

## Auth notes

The default active GitHub account may be `endersclarity`, which can push to the fork but may not push upstream or may lack `workflow` scope. A second account, `nsh-development`, may have `workflow` scope and upstream write access. If switching accounts with `gh auth switch`, switch back before finishing.
