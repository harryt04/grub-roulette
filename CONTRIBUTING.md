# Contributing to Grub Roulette

Contributions are welcome! Target branch: `master`.

## Setup

1. Fork or clone the repo.
2. `cp .env.local.example .env.local` and add your `GOOGLE_MAPS_API_KEY`.
3. `npm install && npm run dev`

## When adding shadcn components

Use the CLI so they come in as base-nova variants:
```sh
npx shadcn@latest add <component-name>
```
Edit in `src/components/ui/` directly.

## Before pushing (recommended)

```sh
npm run lint && npx tsc --noEmit && npm run test:unit
```

CI will run full suite (prettier, eslint, tsc, build, unit, e2e).

## PRs

Open PR targeting `master`. CI runs automatically.

See README for local run and testing details.
