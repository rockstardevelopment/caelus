# Fork workflow

This repository is a fork of the upstream Caelus project. `CONTRIBUTING.md`
covers what a change must satisfy, and `docs/releasing.md` covers how a release
is cut. This document covers the fork process for developers: which remote
takes pushes, which branches exist, how upstream changes arrive, and how a
release reaches `main`.

## Remotes

| Remote | URL | Role |
| --- | --- | --- |
| `origin` | `git@github.com:rockstardevelopment/caelus.git` | the fork; all pushes and pull requests go here |
| `upstream` | `https://github.com/heavyblotto/caelus.git` | read-only source of upstream changes; never push |

A fresh clone has `origin` only. Add the upstream remote once:

```bash
git remote add upstream https://github.com/heavyblotto/caelus.git
git fetch upstream
```

## Branch roles

- `main` is the release branch. It is only ever fast-forwarded from `dev`. No
  direct commits, no force-pushes.
- `dev` is the integration branch. Every pull request targets it. It receives
  `upstream/main` periodically.
- `feature/*` is day-to-day work. Branch it off `dev`, open the pull request
  against `dev`, and delete it after the merge.
- Release tags (`vX.Y.Z`) are not branches. The release workflow publishes from
  a tag cut on `main`; see `docs/releasing.md`.

## Bootstrapping `dev`

When the fork has no `dev`, create it from the current `main` so the first sync
starts from a known-good tree:

```bash
git fetch origin
git switch -c dev origin/main
git push -u origin dev
```

## Feature and pull-request loop

```bash
git fetch origin
git switch dev
git pull --ff-only
git switch -c feature/<issue>-<slug>
# work, commit
git push -u origin feature/<issue>-<slug>
gh pr create --base dev
```

`gh pr create` targets `main` by default because that is the repository's
default branch, so pass `--base dev` every time. A pull request opened against
`main` by mistake has to be retargeted by hand.

## Syncing upstream

Fold the upstream release branch into `dev` periodically:

```bash
git fetch upstream
git switch dev
git pull --ff-only
git merge upstream/main
git push origin dev
```

Merge `upstream/main`, never `upstream/dev`. Upstream's `dev` is its own
integration branch with unreleased changes, while this fork tracks upstream's
released branch. Resolve conflicts, run the checks the change warrants, and
push.

## Promoting `dev` to `main`

After `dev` is verified, fast-forward `main`:

```bash
git switch main
git pull --ff-only
git merge --ff-only dev
CAELUS_ALLOW_MAIN_PUSH=1 git push origin main
```

The environment variable is the deliberate promotion path through the
`pre-push` hook, not a general bypass. The `--ff-only` merge encodes the
invariant: `main` never carries a commit that `dev` does not have. If it fails,
the branches have diverged. Do not force-push `main`; merge the stray `main`
commit into `dev` first, then promote again. Never commit directly to `main`
and never open a backport pull request to it.

## More

- `CONTRIBUTING.md` for the conformance contract and what a change must satisfy
- `docs/releasing.md` for version bumps, tags, and publishing
