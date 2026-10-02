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

## `.cursor/rules/*.mdc` into `AGENTS.md`

- `git-workflow.mdc` has `alwaysApply: true`. Its text becomes the `AGENTS.md`
  git workflow section, and its explicit blocks become `permission.bash` `ask`
  rules.
- `copy.mdc` has `globs: apps/web/**/*.{tsx,ts},docs/**/*.md,*.md`. opencode has
  no per-glob instruction files, so the `AGENTS.md` prose section must name
  those paths itself.
- Cursor frontmatter (`description`, `globs`, `alwaysApply`) is not copied.
  The rule text is.

## `CONTRIBUTING.md`, `package.json`, `.vale.ini` into `AGENTS.md`

- Contract text: keep the reference-first order, the Python paths, the
  `export_*` fixture scripts, and the "no reference, no merge" rule.
- Branching: keep `dev` as the work branch, the `main` prohibition, and the
  `CAELUS_ALLOW_MAIN_PUSH=1` promotion escape hatch.
- Commands: mirror only scripts that exist in `package.json`. Do not document
  commands the repo does not ship.
- Prose: point at `docs/editorial-voice.md` and `docs/ai-slop-style-sheet.md`,
  and name `npm run lint:prose`.

## Drift checklist

- [ ] `AGENTS.md` git rules match `git-workflow.mdc`, including the no-branches
      and no-PRs defaults.
- [ ] `AGENTS.md` prose rules name the same paths as `copy.mdc` globs.
- [ ] `AGENTS.md` commands all exist in `package.json`.
- [ ] `opencode.json` `mcp` matches `.cursor/mcp.json` server-for-server,
      including disabled entries.
- [ ] `opencode.json` `permission.bash` covers pushes to `main`, force-pushes,
      hard resets, and `gh pr create`.
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
