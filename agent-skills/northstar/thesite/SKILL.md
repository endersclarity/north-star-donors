---
name: thesite
description: Use when the user asks about text, cards, pages, tasks, routes, records, or "what is this?" on Haley's Master Portal / donor app site; also use when the user says /thesite, /find-on-site, on the site, on the dashboard, on Haley's site, on the donor app, that card, that page, or that section. Searches only the Master Portal local app source and mirror data, then summarizes likely UI/data matches.
---

# The Site

Find what Kaelen is looking at on Haley's Master Portal / donor app.

## Scope

- Live site: `https://northstarhouse.github.io/north-star-donors/`
- Mirror: `https://master-portal-fork.vercel.app/`
- Local repo: `/Users/ender/code/north-star-donors`
- Data: Master Portal mirror Supabase, via `SUPABASE_NSH_MASTER_PORTAL_MIRROR_*` env in `/Users/ender/.claude/.env` or `/Users/ender/.codex/.env`

Do not search the vault, Kaelen's other portal, arbitrary websites, or Haley's upstream checkout unless the user explicitly asks.

## Workflow

1. Extract the phrase the user saw on the site.
2. Run the bundled script:

```bash
node /Users/ender/.codex/skills/thesite/scripts/search-site.mjs "<phrase>"
```

3. Return the script's plain-English result.
4. If the result is ambiguous, ask one clarifying question: what page, what nearby text, or whether they mean UI text vs data row.

## Behavior

- Exact match first.
- Fuzzy keyword match only if exact fails.
- Bias UI/source matches above data rows for "card/page/section" questions.
- Summarize. Do not dump raw `rg`, table rows, schema, file paths, or line numbers unless the user asks for technical details.
- Always preserve the branch footer from the script.

## Output

Say where it probably is:

- Page/route in plain English
- Likely UI location or data surface
- One short explanation

Example:

> Looks like UI text on the **home page**: "Fund Development Plan".  
> *(Searched on branch `codex/static-campaign-overview`)*
