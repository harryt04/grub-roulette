# Contributing to Grub Roulette

Contributions are welcome! Target branch: `master`.

## Setup

1. Fork or clone the repo.
2. `cp .env.local.example .env.local` and add your `GOOGLE_MAPS_API_KEY`.
3. `pnpm install && pnpm run dev`

## When adding shadcn components

Use the CLI so they come in as base-nova variants:
```sh
pnpm exec shadcn@latest add <component-name>
```
Edit in `src/components/ui/` directly.

## Before pushing (recommended)

```sh
pnpm run lint && pnpm exec tsc --noEmit && pnpm run test:unit
```

CI will run full suite (prettier, eslint, tsc, build, unit, e2e).

## PRs

Open PR targeting `master`. CI runs automatically.

See README for local run and testing details.
