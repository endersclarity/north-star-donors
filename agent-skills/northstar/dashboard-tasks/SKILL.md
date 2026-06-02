---
name: dashboard-tasks
description: Operate on the StarHouse Mirror dashboard tasks and initiatives at master-portal-fork.vercel.app. Use for dashboard task reads, adding tasks, marking tasks done, blocker relationships, initiative summaries, task triage, or when work should be tracked in The Mirror rather than only in vault notes.
---

# Dashboard Tasks

Operate on The Mirror, not Haley's live Master Portal.

## System

- URL: `https://master-portal-fork.vercel.app/`
- Repo: `/Users/ender/code/north-star-donors`
- Branch: `feat/donor-app-improvements`
- Deploy: `vercel deploy --prod --yes`
- Supabase mirror project ref: `pasamzrwwaqhiwkixpbt`
- Env source: `/Users/ender/.claude/.env`
- Use `SUPABASE_NSH_MASTER_PORTAL_MIRROR_REST_URL` and `SUPABASE_NSH_MASTER_PORTAL_MIRROR_SERVICE_ROLE_KEY`

Never write to production Master Portal keys for task operations.

## Schema

`initiatives`:
- `id`, `title`, `description`, `owner`, `started_at`, `target_close_at`, `status`, timestamps.
- Status values: `active`, `completed`, `archived`.

`tasks`:
- `id`, `title`, `label text[]`, `domain text[]`, `status`, `due_date`, `notes`, `attachment_url`, `assigned_to`, `initiative_id uuid`, `blocked_by uuid[]`, timestamps.
- Status values: `todo`, `in_progress`, `done`.
- Blocked is not a status. The Blocked tab is driven by non-empty `blocked_by`.

Canonical domains: `Donors`, `Members`, `Sponsors`, `Grants`, `Earned Revenue`, `Infrastructure`.
Canonical labels: `Proof Reading`, `Graphic Design`, `Grant Writing`, `Blog Post`, `Brainstorming`, `Research`, `Technical`, `Editing`, `Stakeholder Outreach`, `Other`.

## Rules

- Do a holistic read before proposing new tasks. Search existing titles and notes for overlapping work.
- Do not create dashboard tasks without explicit user approval.
- Status changes use the `status` column. Do not write `DONE` into notes as the source of truth.
- For blockers, update both `blocked_by` and human notes with `BLOCKED-BY: <prefix>`.
- Use full UUID with PostgREST `eq`. UUID columns do not support `like`.
- Batch inserts need uniform keys. Use `null` rather than omitting fields.

## Common Operations

Read current active work:

```bash
python3 - <<'PY'
from pathlib import Path
import json, urllib.request
env={}
for raw in Path('/Users/ender/.claude/.env').read_text().splitlines():
    if '=' in raw and not raw.strip().startswith('#'):
        k,v=raw.split('=',1); env[k]=v.strip().strip('"').strip("'")
base=env['SUPABASE_NSH_MASTER_PORTAL_MIRROR_REST_URL'].rstrip('/')
key=env['SUPABASE_NSH_MASTER_PORTAL_MIRROR_SERVICE_ROLE_KEY']
headers={'apikey':key,'Authorization':'Bearer '+key}
req=urllib.request.Request(base+'/tasks?select=*&status=in.(todo,in_progress)&order=due_date.asc.nullslast', headers=headers)
print(json.dumps(json.load(urllib.request.urlopen(req)), indent=2))
PY
```

For writes, read the row first, propose the exact patch in chat, then PATCH with `Prefer: return=representation` and verify.

When marking a task done, query for tasks where its UUID appears in `blocked_by` and tell the user what may now be unblocked.

## Source Reference

If more detail is needed, read `/Users/ender/.claude/skills/dashboard-tasks/SKILL.md`.
