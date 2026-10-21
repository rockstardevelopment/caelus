# Sync reference

Combined shape translations and drift checklist for `sync-agent-config`.

## `.cursor/mcp.json` into `opencode.json.mcp`

Cursor:

```json
{ "mcpServers": { "caelus": { "command": "npx", "args": ["caelus-mcp"] } } }
```

opencode:

```json
{
  "mcp": {
    "caelus": {
      "type": "local",
      "command": ["npx", "caelus-mcp"],
      "enabled": true
    }
  }
}
```

- `type: "local"` is required.
- Join Cursor's `command` string and `args` into one opencode `command` array.
- Copy `env` to `environment` only when Cursor sets it.
- Remote servers: Cursor `url` becomes `{ "type": "remote", "url": ... }`.
  Header values support `{env:VAR}` and `{file:path}` interpolation.
- Keep `enabled: false` wrappers for servers Cursor lists but disables.

## `.cursor/rules/git-workflow.mdc` into `AGENTS.md` and `opencode.json`

- The upstream restrictions are the agent git rules: work commits to `dev`,
  never commit, push, reset, or force-push `main`, no feature branches or pull
  requests unless asked, and the pre-push hook is not bypassed.
- `AGENTS.md` carries those rules. `opencode.json` `permission.bash` encodes
  the asks: pushes to `main`, force-pushes, hard resets, and every
  `gh pr create`.
- When upstream changes a restriction, mirror it into both targets.

## `docs/fork-workflow.md` into `AGENTS.md` (pointer only)

- Source only, never edited by the skill. It is the developer branch-flow doc:
  remotes, branch roles, feature and pull-request loop, upstream sync,
  fast-forward promotion.
- `AGENTS.md` links to it for developers; the agent git rules do not adopt the
  branch flow.

## `.cursor/rules/copy.mdc` into `AGENTS.md`

- `copy.mdc` has `globs: apps/web/**/*.{tsx,ts},docs/**/*.md,*.md`. opencode has
  no per-glob instruction files, so the `AGENTS.md` prose section must name
  those paths itself.
- Cursor frontmatter (`description`, `globs`, `alwaysApply`) is not copied.
  The rule text is.

## `CONTRIBUTING.md`, `package.json`, `.vale.ini` into `AGENTS.md`

- Contract text: keep the reference-first order, the Python paths, the
  `export_*` fixture scripts, and the "no reference, no merge" rule.
- Branching: agent git rules come from `.cursor/rules/git-workflow.mdc`;
  `AGENTS.md` links to `docs/fork-workflow.md` for the developer flow.
  `CONTRIBUTING.md` is upstream-owned and describes the upstream process.
- Commands: mirror only scripts that exist in `package.json`. Do not document
  commands the repo does not ship.
- Prose: point at `docs/editorial-voice.md` and `docs/ai-slop-style-sheet.md`,
  and name `npm run lint:prose`.

## Drift checklist

- [ ] `AGENTS.md` git rules mirror `.cursor/rules/git-workflow.mdc` (work on
      `dev`, no branches or pull requests unless asked, main prohibition,
      hook).
- [ ] `AGENTS.md` links to `docs/fork-workflow.md` for the developer branch
      flow and does not restate it as agent rules.
- [ ] `AGENTS.md` prose rules name the same paths as `copy.mdc` globs.
- [ ] `AGENTS.md` commands all exist in `package.json`.
- [ ] `opencode.json` `mcp` matches `.cursor/mcp.json` server-for-server,
      including disabled entries.
- [ ] `opencode.json` `permission.bash` covers pushes to `main`, force-pushes,
      hard resets, and every `gh pr create` (ask).
- [ ] `AGENTS.md` keeps the "Local opencode artifacts" section naming this skill
      for upstream policy updates.
- [ ] No target states a rule absent from every source.

## Validator

```sh
node .opencode/skills/sync-agent-config/scripts/validate-config.mjs [file...]
```

- Defaults to `opencode.json`; run from the repo root.
- Exit `0`: parsed and schema-valid.
- Exit `1`: invalid JSON or schema violations (errors printed).
- Exit `2`: could not validate (offline, or `ajv` missing, or unparseable
  schema). Run `npm install` at the repo root if `ajv` is missing.
- JSON only. A `.jsonc` file is out of scope; convert or validate by hand.
