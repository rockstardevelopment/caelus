---
name: sync-agent-config
description: Use when updating AGENTS.md, opencode.json, or .opencode/ config so opencode matches the repo's local conventions (docs/fork-workflow.md, .cursor/rules, CONTRIBUTING.md, package.json scripts, .vale.ini, .cursor/mcp.json). Also validates an opencode config against the live schema.
---

# Sync agent config

Keeps the opencode-facing config aligned with the repo's local sources of truth.
This is a derived-file sync, not a policy generator: it copies and translates
what the sources say and does not invent rules.

## Targets

- `AGENTS.md` (repo root)
- `opencode.json` (repo root)
- `.opencode/agent/`, `.opencode/command/`, `.opencode/skills/` when present

## Sources (read-only)

| Source | Feeds |
| --- | --- |
| `.cursor/rules/git-workflow.mdc` | `AGENTS.md` git workflow (agent rules); `opencode.json` `permission.bash` |
| `docs/fork-workflow.md` | linked from `AGENTS.md` as the developer branch flow; never edited |
| `.cursor/rules/copy.mdc` | `AGENTS.md` prose and user-facing copy |
| `.cursor/mcp.json` | `opencode.json` `mcp` |
| `CONTRIBUTING.md` | `AGENTS.md` contract, provenance, commands |
| `package.json` scripts | `AGENTS.md` commands |
| `.vale.ini` | `AGENTS.md` prose-lint pointer |
| `docs/editorial-voice.md`, `docs/ai-slop-style-sheet.md` | `AGENTS.md` pointers only |
| `docs/agents.md`, `llms.txt`, `MCP_SPEC.md` | `AGENTS.md` pointers only |

`AGENTS.md` and `opencode.json` are targets, never sources. `.cursor/**`,
`CONTRIBUTING.md`, `.vale.ini`, and the upstream-owned `docs/*.md` are never
edited here; if one looks wrong, tell the user instead of rewriting it.

`.cursor/rules/git-workflow.mdc` is the upstream restriction baseline: mirror
its restrictions (work on `dev`, the `main` prohibition, no branches or pull
requests unless asked, the pre-push hook) into the `AGENTS.md` git workflow and
the `opencode.json` `permission.bash` asks.

`docs/fork-workflow.md` is a read-only developer doc: `AGENTS.md` links to it,
and the skill never edits it.

## Procedure

1. Read every source. If a field shape is uncertain, load the
   `customize-opencode` skill or fetch `https://opencode.ai/config.json`; do
   not guess.
2. Diff each target against the sources.
   - `AGENTS.md`: contract, git workflow, commands, prose, provenance, and
     pointers. The git workflow mirrors `.cursor/rules/git-workflow.mdc` and
     links to `docs/fork-workflow.md` for the developer branch flow; when
     upstream changes a restriction, mirror it here.
   - `opencode.json`: `mcp` against `.cursor/mcp.json` (shape translation in
     `reference.md`); `permission.bash` against the
     `.cursor/rules/git-workflow.mdc` restrictions. Leave other fields alone
     unless a source justifies them.
   - `.opencode/**`: flag files that claim something no source states.
3. Apply minimal edits. Preserve `$schema` and unrelated fields. Keep volatile
   counts and versions out of `AGENTS.md`; the claims lint tracks those.
4. Validate: `node .opencode/skills/sync-agent-config/scripts/validate-config.mjs`
5. Report what drifted and what changed. Tell the user to restart opencode,
   since config and skills load once at startup.

## Guardrails

- One-way: local sources into opencode files.
- No agent-invented policy. A rule absent from every source does not go in.
- Do not edit `docs/fork-workflow.md`; it is the developer git doc, linked from
  `AGENTS.md`.
- When sources conflict, stop and ask; do not pick a side silently.
- Never copy secrets into `opencode.json`; use `{env:VAR}` placeholders.
- Do not register this skill in `opencode.json`; `.opencode/skills` is scanned
  by default.
- Editing `AGENTS.md` changes instructions for future sessions; show the diff
  before finishing.
- Skill docs under `.opencode/` are outside `scripts/lint-prose.sh`'s file
  list. Write dry prose anyway.
