---
name: mirror-to-production
description: Safely promote StarHouse Mirror or local north-star-donors work into Haley's live Master Portal / production Supabase and GitHub Pages app. Use when the user asks to import a Mirror task into the actual donor app, copy work to Haley's Supabase, promote local dashboard changes to production, move an artifact from localhost/Mirror to live, or create a production task backed by a local/Mirror deliverable.
---

# Mirror To Production

Move work from the local/Mirror environment to Haley's live Master Portal without blind row copies, broken attachments, or branch mess.

This skill is for promotion. It is not for ordinary Mirror task editing; use `dashboard-tasks` for Mirror-only work.

## Guardrails

- Treat production as write-protected until the exact patch is known.
- Read Mirror and production first; never assume schemas match.
- Do not copy UUIDs unless read-back proves they are intentionally shared.
- Do not write production rows that point at undeployed local or Mirror-only assets.
- Use a separate worktree/branch for production app changes when the current worktree is dirty or on a Mirror-specific branch.
- Prefer absolute production attachment URLs for GitHub Pages assets.
- Verify every write by reading back production and checking live URLs.
- For code/assets-only promotions, still read any production data the UI depends on; "no data write" does not mean "no data dependency."
- Build production patches with production public env vars only. Never source service-role env wholesale into the shell.
- Check GitHub auth before pushing upstream; switch to the upstream-capable account before the push, and switch back during cleanup.
- Clean up temporary worktrees, temporary branches, and auth/account switches before finishing.

## Workflow

1. **Confirm scope**
   - Name the source Mirror/local task or artifact.
   - Name the desired production outcome.
   - Decide whether this is data-only, code/assets-only, or both.

2. **Create or update a drilldown sidecar**
   - If `/drilldown` is active, keep findings in the existing sidecar.
   - Otherwise create `sidecars/<promotion-slug>-<YYYY-MM-DD>.md` in the active repo.
   - Do not create new dashboard tasks during discovery unless the user explicitly asks.

3. **Read source state**
   - Query Mirror using `SUPABASE_NSH_MASTER_PORTAL_MIRROR_REST_URL` and `SUPABASE_NSH_MASTER_PORTAL_MIRROR_SERVICE_ROLE_KEY`.
   - Capture source title, status, notes, labels, domains, attachment URL, initiative, blockers, and row id.
   - Treat Mirror-only fields as candidates, not production truth.

4. **Read production state**
   - Query production using `SUPABASE_NSH_MASTER_PORTAL_REST_URL` and `SUPABASE_NSH_MASTER_PORTAL_SERVICE_ROLE_KEY`.
   - Fetch one representative live row with `select=*` to discover columns.
   - Search for an existing production row by title/semantic match.
   - Map the production initiative by live title/area, not by assuming the Mirror UUID.

5. **Map schema differences**
   - Build the production row shape from production columns only.
   - Collapse or move unsupported fields into notes.
   - Preserve production-only fields and existing live data when updating.
   - For StarHouse tasks, remember production may use scalar `label` while Mirror may use `label[]`; production may not have `domain` or `blocked_by`.

6. **Verify assets before row writes**
   - If the task has an attachment or preview, make sure the live app will serve it.
   - For GitHub Pages, production URL is usually `https://northstarhouse.github.io/north-star-donors/...`.
   - If files are only local or in Mirror, deploy/rehost them first.
   - Verify with `HEAD` or `GET` that all live URLs return `200` before inserting the production row.

6a. **For code/assets-only promotions**
   - List every production data record the promoted UI reads, such as `protected_documents`, task rows, initiative rows, or storage URLs.
   - Read those records from production before deciding "no data write needed".
   - If the data exists, record the row slug/title/id in the sidecar and continue with code/assets only.
   - If the data is missing, stop and decide whether to add a production data patch or change the code to use deployed static assets.

7. **Patch production app separately when needed**
   - Base production app patches on `upstream/master`.
   - Use a temporary worktree for clean promotion work:

```bash
git fetch upstream --prune
git worktree add -b codex/<short-promotion-name> /Users/ender/code/<repo>-prod-promote upstream/master
```

   - Keep the patch minimal: production-compatible code plus required public assets.
   - Build using the same public env vars the deploy uses. For this repo that usually means setting only:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_SITE_URL`
   - Do not `source` a broad secrets file into the shell; parse/copy only the public values needed for the build.
   - If the first build fails because a protected/static route lacks public Supabase env, rerun with production public env before changing code.
   - Push/deploy only after local build passes.

7a. **Push preflight**
   - Run `gh auth status` before pushing to `upstream`.
   - If the active account is not upstream-capable, switch first, for example `gh auth switch -u nsh-development`.
   - Record the starting account so it can be restored in cleanup.
   - Push only after confirming the target remote/branch, usually `upstream HEAD:master`.

8. **Propose the exact production data patch**
   - Show insert vs update.
   - Show the exact JSON shape, with unsupported Mirror fields omitted.
   - Include the production initiative id and attachment URL.
   - Get explicit approval before any production write unless the user has already clearly approved the specific patch.

9. **Write and verify**
   - Insert/PATCH with `Prefer: return=representation`.
   - Read back the row with relevant joins.
   - Verify live attachment URLs.
   - If possible, open/check the live app view.
   - For GitHub Pages code/assets promotions:
     - Wait for the Pages workflow run for the pushed commit.
     - Verify dashboard/entry URL, route URL, and raw asset URL with `curl -L`.
     - Use browser verification for pages that depend on client rendering, iframes, `srcDoc`, or protected-document fetches. A `200` alone is not proof the user-facing content rendered.

10. **End gate and cleanup**
   - Record what was merged, promoted, and dropped.
   - Remove temporary worktrees and local temp branches.
   - Switch GitHub auth back if it was changed.
   - Confirm cleanup with `git worktree list`, `gh auth status`, and starting-repo `git status --short`.
   - Leave the starting repo clean or explain any intentional remaining changes.

## StarHouse Reference

For environment names, observed schema drift, and the proven sponsor-packet promotion example, read `references/starhouse-master-portal.md`.
