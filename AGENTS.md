# AGENTS.md — Grub Roulette

Agent quick-reference for this repo. Every entry here is something you'd likely miss without reading multiple files.

---

## Stack

- **Next.js** (App Router, RSC) + **React 18** + **TypeScript 5** (strict)
- **Tailwind CSS v4** via `@tailwindcss/postcss` — no `tailwind.config.js`; config lives in `globals.css`
- **shadcn/ui** with `style: "base-nova"` — built on **`@base-ui/react`**, NOT Radix UI. The `TooltipTrigger` uses a `render` prop (`render={<Button />}`) not `asChild`. Add components with `npx shadcn@latest add <name>` (they'll come in as base-nova variants).
- **Vitest** (unit) + **Playwright** (e2e, Chromium only)
- **PostHog** analytics proxied through `/ingest/` (configured in `next.config.js` rewrites)

---

## Commands

```sh
npm run dev           # dev server
npm run build         # production build
npm run start         # production server (requires build first)
npm run lint          # eslint + prettier check (both must pass)
npm run prettify      # auto-format with prettier
npm run test:unit     # vitest, run once
npm run test:unit:watch  # vitest, watch mode
npm run test:e2e      # playwright (requires a running server on :3000)
npx tsc --noEmit      # type-check — there is NO npm typecheck script
```

### Run a single unit test

```sh
npx vitest run src/__tests__/lib/restaurant-logic.test.ts
npx vitest run -t "filterOpenPlaces"   # by test name
```

### Run a single e2e spec

```sh
npx playwright test e2e/home.spec.ts
npx playwright test -g "page loads with correct title"
```

---

## CI Order (mirrors what GitHub Actions runs)

```
prettier check → eslint → tsc --noEmit → build → unit tests → e2e (2 shards)
```

Run this locally before pushing if you want to catch failures early:

```sh
npm run lint && npx tsc --noEmit && npm run test:unit
```

E2E runs in CI automatically after the above. To run e2e locally, build first:

```sh
npm run build && npm run start   # then in another terminal:
npm run test:e2e
```

---

## Environment Variables

Copy `.env.local.example` → `.env.local` (not `.env-sample` — that file does not exist):

```sh
cp .env.local.example .env.local
```

| Variable | Purpose |
|---|---|
| `GOOGLE_MAPS_API_KEY` | **Required.** Server-only (no `NEXT_PUBLIC_`). Used by all three API routes. |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key (can be omitted locally) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Defaults to `https://app.posthog.com` |
| `NEXT_PUBLIC_BASE_URL` | App origin (used in sitemap) |

---

## Architecture Notes

### Directory layout

```
src/
  app/
    api/            ← Route Handlers (server-only): getRestaurants, getPlaceDetails, getPhotos
    client-utils/   ← fetch() wrappers that call the API routes from the browser
    components/     ← App-specific React components
    context/        ← paletteContext.tsx (color palette state)
    hooks/          ← useGeoLocation.ts
    types/          ← GetRestaurantRequest/Response, helpers
  components/ui/    ← shadcn component files (project-owned copies — edit here, not in node_modules)
  lib/              ← Pure utility modules: restaurant-logic, localStorage, domain-utils, google-maps
src/__tests__/      ← Unit tests (mirrors src/ structure)
e2e/                ← Playwright specs + fixtures/mockData.ts
```

### Key design decisions

- **Module-level mutable state** in `restaurantFinder.tsx`: `placesMap`, `usedPlaces`, and `placeDetailsCache` are declared at module scope (not inside the component). They persist across re-renders as a tab-level singleton. Unit tests importing this module share this state — reset it between tests if needed.

- **Palette system uses `data-palette` attribute on `<html>`**, not a class. `next-themes` owns the `class` attribute (`dark`/`light`). The palette CSS variable blocks are injected via `<style dangerouslySetInnerHTML>` in `layout.tsx` — this is intentional because Tailwind v4 would purge `[data-palette="..."]` selectors that don't appear as literal strings in `.tsx` source.

- **`isMobile` prop is hardcoded `false`** everywhere. Mobile responsiveness is Tailwind breakpoint classes only.

- **`darkModeSwitch.tsx`** exists and has a unit test but is not rendered anywhere. `ThemeSwitcher` (dropdown combining palette + dark mode) is what's used in `page.tsx`. Do not remove the file without also removing its test.

- **No Zustand.** State is plain `useState`/`useEffect` in `restaurantFinder.tsx`. Older agent spec docs in `.agents/specs/rewrite/` describe a Zustand store — that was planned but not implemented.

- **Business logic lives in `src/lib/`**, not `src/app/utils/`. Agent specs reference the latter; trust the code.

### API routes

All three are `POST` handlers:

| Route | Input | Notes |
|---|---|---|
| `/api/getRestaurants` | `lat/lng` OR `zip`, radius+units, optional keywords | ZIP triggers Geocoding API call first |
| `/api/getPlaceDetails` | `place_id` | Returns detailed place info |
| `/api/getPhotos` | `photo_references[]` | Returns signed Google Maps photo URLs |

---

## Code Style

- **No semicolons, single quotes, trailing commas** — enforced by Prettier and ESLint (`"semi": ["warn", "never"]`)
- Path alias: `@/*` → `./src/*`
- `vitest.config.ts` is excluded from `tsconfig.json` — intentional

---

## Testing

### Unit tests (Vitest + jsdom + Testing Library)

- Config: `src/__tests__/**/*.test.{ts,tsx}`, setup: `src/__tests__/setup.ts`
- Coverage: lib utilities, all three API route handlers, client-utils fetch wrappers, core components, `useGeoLocation` hook

### E2E tests (Playwright — Chromium only)

- All API routes are mocked via `page.route()` — see `e2e/fixtures/mockData.ts`
- Both geolocation-granted and geolocation-denied (ZIP fallback) flows are tested
- Playwright config webServer command is `npm run start` (not `dev`) — a build is required

---

## Contributing

Target branch: **`master`**

1. Fork or branch from `master`
2. `cp .env.local.example .env.local` and add your `GOOGLE_MAPS_API_KEY`
3. `npm install && npm run dev`
4. Make your changes with tests where applicable
5. Before pushing (optional but recommended): `npm run lint && npx tsc --noEmit && npm run test:unit`
6. Open a PR targeting `master` — CI will run the full check suite automatically

When adding shadcn components, use the CLI so they come in as base-nova variants:
```sh
npx shadcn@latest add <component-name>
```
Edit components in `src/components/ui/` directly — they are project-owned copies.
