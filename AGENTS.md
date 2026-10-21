# Caelus — agent instructions

Clean-room, MIT-licensed TypeScript astrology engine, checked against a Python
reference and golden fixtures. Package/API map: `llms.txt`. Contribution rules:
`CONTRIBUTING.md`. Developer fork process: `docs/fork-workflow.md`.
Agent-facing API pitfalls: `docs/agents.md`. MCP protocol: `MCP_SPEC.md`.

## The conformance suite is the contract

`packages/caelus/test/golden.json` pins the TypeScript engine to the Python
reference. A red suite blocks merge. New engine behavior lands reference-first:

1. Implement and validate it in the Python reference (`python/astroengine/`),
   checked against Swiss Ephemeris (`python/validate_swiss.py`) and, where
   relevant, JPL Horizons (`python/validate_horizons.py`).
2. Generate golden fixtures (`python/export_golden.py`,
   `python/export_query_golden.py`).
3. Port to TypeScript so the suite reproduces the fixtures.

A feature that exists only in TypeScript, with no reference and no fixtures,
will not be merged.

## Git workflow

Agents follow upstream's git policy (`.cursor/rules/git-workflow.mdc`):

- Commit and push work to `dev`. Nothing else by default.
- Never commit, push, reset, or force-push `main`.
- Do not create feature branches or open pull requests unless asked.
- Before every push, verify the current branch is `dev` (or a branch named in
  this session). If it is `main`, stop.
- A local `pre-push` hook blocks pushes to `main`; do not bypass it.

Developers working the fork branch flow (`feature/*` off `dev`, pull requests
to `dev`, upstream sync, fast-forward promotion to `main`) should read
`docs/fork-workflow.md`.

## Local opencode artifacts

`AGENTS.md`, `opencode.json`, and `.opencode/**` are fork-owned; upstream does
not ship them. When upstream changes its policies (`CONTRIBUTING.md`,
`.cursor/rules/**`), fold those changes into the local artifacts with the
`sync-agent-config` skill (`.opencode/skills/sync-agent-config/`).

## Provenance and licensing

Caelus is written from published sources (VSOP87, ELP/DE, IAU models, JPL
Horizons fits), not ported from Swiss Ephemeris or any other licensed
ephemeris. Do not introduce GPL or AGPL code, or bundled ephemeris files. New
data packs need documented provenance. Contributions are MIT.

## Commands

```sh
npm install
npm run build          # build all packages
npm test               # golden conformance suite (caelus) + package tests
npm run lint:prose     # Vale prose checks (requires vale installed)
npm run lint:claims    # prose numbers must match measured stats
npm run preflight      # full local gate before finishing (slow)
```

The Python reference is not a runtime dependency; it mints coefficient data and
golden fixtures. After a reference change, regenerate fixtures with the
`export_*` scripts and review the diff.

## Prose and user-facing copy

Before editing text under `apps/web/`, `docs/`, or any `*.md`, read
`docs/editorial-voice.md` and `docs/ai-slop-style-sheet.md`, then run
`npm run lint:prose`.

- Dry engineer, not pitch deck. Facts and measurements over adjectives.
- No AI filler (`delve`, `unpack`, `landscape`, `tapestry`, `testament`,
  `resonates`, `pivotal`, `holistic`, "it's important to note").
- No manifesto lines, mic-drops, or performed wit. No em-dash chains.
- **Caelus** capitalized in prose; **`caelus`** lowercase for the npm package,
  imports, and commands.
- `Swiss Ephemeris` as oracle/referee, never as source code.
- Mechanical fixes (banned phrases, em dashes) are yours. Tone rewrites that
  need judgment: propose, don't silently rewrite.
- Numbers in prose are checked against measured stats; regenerate them with
  `npm run facts:sync` / `npm run stats:golden` rather than editing by hand.
