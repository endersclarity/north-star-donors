---
name: find-on-site
description: Alias skill for thesite. Use when the user says /find-on-site, find on site, or asks to locate text/cards/pages/tasks/data on Haley's Master Portal / donor app. Delegates to the thesite skill and its bundled search script.
---

# Find On Site

Alias for `thesite`.

Run:

```bash
node /Users/ender/.codex/skills/thesite/scripts/search-site.mjs "<phrase>"
```

Scope is only Haley's Master Portal / donor app:

- `/Users/ender/code/north-star-donors`
- Master Portal mirror Supabase data

Return summarized plain-English matches only.
