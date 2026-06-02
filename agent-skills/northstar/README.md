# North Star Codex skills

Portable copies of local Codex skills used for North Star House / North Star
Donors work.

## Install

From a clone of this repository:

```sh
mkdir -p ~/.codex/skills
rsync -a agent-skills/northstar/ ~/.codex/skills/
```

Then start a fresh Codex session so the skills are discovered.

## Included skills

- `dashboard-tasks`
- `drilldown-development-dashboard`
- `find-on-site`
- `linear-issue-shaper`
- `localhost-supabase-rows`
- `mirror-to-production`
- `northstar-linear-to-sandbox`
- `northstar-local-drilldown`
- `northstar-sandbox`
- `sandbox-production-promotion`
- `thesite`
- `tldr`

These files intentionally contain workflow instructions and helper scripts, not
local credentials. Environment-specific credentials should stay in the local
machine's private env file.
