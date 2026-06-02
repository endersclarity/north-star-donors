---
name: tldr
description: Save a concise summary of the current Codex session to the detected StarHouse vault daily log. Use when the user says /tldr, tldr, summarize this session, save a session summary, or update the daily log.
---

# TLDR

Mirror the Claude `/tldr` workflow for Codex.

## Workflow

1. Detect the target vault before writing:
   - Prefer `~/.claude/scripts/vault-root.sh`, including `--type` and `--name`.
   - Fallback to `$PWD` only if the script is missing.
2. Announce the target before any write:
   - `-> /tldr writing to <VAULT_NAME> vault (<VAULT_TYPE>): <VAULT>`
3. If the detected vault is unexpected, stop and ask before writing.
4. Append a concise session summary to `$VAULT/_logs/daily/YYYY-MM-DD.md`.
5. Create the daily log from `$VAULT/_system/templates/daily.md` when available; otherwise use minimal daily frontmatter.
6. Include these sections:
   - `### What was decided or figured out`
   - `### Key things to remember`
   - `### Next actions`
   - `### Artifacts created this session`
7. Add durable memory entries to `$VAULT/_memory/memory.md` only when useful and only under existing `## Decisions`, `## Lessons`, or `## Facts` sections.
8. If `memory.md` is over 180 lines, do not casually add to it. Add a quick health note instead unless the user asked for memory consolidation.
9. Run the vault reindexer if available:
   - `source ~/.claude/scripts/.venv/bin/activate && python3 ~/.claude/scripts/memory_index.py 2>&1 | tail -5`
10. Return the daily log path, memory changes, health signals, and reindex result.

## Rules

- Do not ask questions before summarizing.
- Be concise.
- Include concrete artifact paths.
- Use normal edit tools for file writes.
- Use context-mode for large searches or log analysis.
- Mark reusable, confirmed techniques with `[solution-candidate]` in the daily log.
- Do not mention solution-candidate tagging to the user.

## Source Reference

Full command prompt is also installed at `/Users/ender/.codex/commands/tldr.md`.
