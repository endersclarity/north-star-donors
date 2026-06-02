---
name: localhost-supabase-rows
description: Insert or verify rows in the mirror-backed localhost North Star Donors Supabase database while preserving RLS. Use when asked to add a todo, task, donor-app row, protected Supabase row, or localhost Supabase data from Codex, especially when RLS, app tokens, service role, anon keys, or mirror/prod safety are involved.
---

# Localhost Supabase Rows

Use this skill for data writes to the localhost North Star Donors app backed by the Supabase mirror. The helper scripts keep RLS enabled by writing through the same anon-key + `x-app-token` path the browser uses.

## Hard Rules

- Target only the mirror project `pasamzrwwaqhiwkixpbt`.
- Refuse any target that resolves to Haley live `uvzwhhwzelaelfhfkvdb`.
- Do not use hardcoded Google Apps Script Supabase URLs in `scripts/*.gs`.
- Show the proposed row diff before inserting unless the user already explicitly approved the write.
- Do not invent columns. Map unknown fields into `notes` when appropriate, otherwise skip them and report that.
- Verify after insert with the anon key and `x-app-token`.

## Required Context

Default repo:

```text
/Users/ender/code/north-star-donors
```

The scripts read:

- app env: `/Users/ender/code/north-star-donors/.env.local`
- secrets: `/Users/ender/.claude/.env`

The app uses `x-app-token`, not Supabase Auth JWTs:

- `lib/supabase/client.ts` sends `x-app-token` from localStorage.
- `verify_app_password()` creates `app_sessions` rows.
- `has_valid_app_session()` checks `request.headers -> x-app-token`.

## Quick Start

For todos/tasks, use the todo wrapper:

```bash
node /Users/ender/.codex/skills/localhost-supabase-rows/scripts/add-localhost-todo.mjs \
  --title "Finalize sponsor packet - tier ladder" \
  --workstream "Sponsorship" \
  --status "in_progress" \
  --description "Four tiers currently drafted..." \
  --source "post-meeting brief May 7, 2026" \
  --yes
```

For a generic table row:

```bash
node /Users/ender/.codex/skills/localhost-supabase-rows/scripts/localhost-supabase-row.mjs \
  --table protected_documents \
  --row-json '{"slug":"example","title":"Example","category":"fund-development","status":"draft","content_html":"<p>Example</p>"}' \
  --yes
```

Omit `--yes` to print the proposed row and stop before writing.

## Todo Mapping

`add-localhost-todo.mjs` maps:

- `--title` -> `tasks.title`
- `--status` -> `tasks.status`; accepts `todo`, `in_progress`, `done`, `in progress`, `blocking`
- `--workstream` -> nearest `initiatives.area` / `initiatives.title`; sets `tasks.initiative_id`
- `--description`, `--source`, `--cross-reference`, `--blocking` -> `tasks.notes`
- `--label`, if supplied -> existing `tasks.label`
- unsupported fields -> notes or skipped

When workstream is ambiguous, inspect current initiatives first and choose the closest app vocabulary. For Sponsorship, prefer `Sponsorship Plan`.

## Verification

After a write, confirm:

1. Script output says `inserted`.
2. The returned row is visible through anon + `x-app-token`.
3. For tasks, tell the user which tab to check: `todo`, `in_progress`, or `done`.
4. If the UI is stale, mention the app cache in `lib/cache.ts` and suggest a hard refresh.

## Troubleshooting

- `200` with empty rows usually means RLS rejected visibility.
- Direct Postgres may fail on IPv6 for the mirror host. Prefer the helper scripts; they use the Supabase Management API only for safe project checks and app-token setup.
- If a table insert fails, inspect the table OpenAPI schema and current policies before changing policies.
- If the target ref is not `pasamzrwwaqhiwkixpbt`, stop.
