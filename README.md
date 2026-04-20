# Grub Roulette

A simple, free, and open-source web app that helps you find a random restaurant near you. Discover new and locally owned places!

## Built With

- [React](https://reactjs.org/) + [Next.js](https://nextjs.org/docs) (App Router)
- [shadcn/ui](https://ui.shadcn.com/) (base-nova variant, built on [@base-ui/react](https://base-ui.com/))
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Google Maps API](https://developers.google.com/maps)
- [PostHog](https://posthog.com/) analytics

[Visit Grub Roulette](https://grub.harryt.dev)

---

## Contributing

Contributions are welcome! Follow the steps below to set up the project locally and start contributing.

### Prerequisites

You'll need a [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) with the following APIs enabled:
- Places API (New)
- Geocoding API
- Maps Static API (for photos)

### Run Locally

1. **Clone the repository:**

   ```sh
   git clone https://github.com/harryt04/grub-roulette.git grub-roulette
   cd grub-roulette
   ```

2. **Create your feature branch:**

   ```sh
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies:**

   ```sh
   npm install
   ```

4. **Configure environment variables:**

   ```sh
   cp .env.local.example .env.local
   ```

   Open `.env.local` and add your Google Maps API key:

   ```
   GOOGLE_MAPS_API_KEY=your_key_here
   ```

5. **Run the app:**

   ```sh
   npm run dev
   ```

### Testing

```sh
npm run test:unit          # run unit tests once
npm run test:unit:watch    # run unit tests in watch mode

# E2E tests require a production build:
npm run build && npm run start
# then in another terminal:
npm run test:e2e
```

### Before Submitting a PR

You can verify your changes locally before pushing — or push and let CI handle it for you.

**Local check (optional but faster feedback):**
```sh
npm run lint && npx tsc --noEmit && npm run test:unit
```

**CI will automatically run on every PR:**
- Prettier + ESLint
- TypeScript type-check
- Production build
- Unit tests
- E2E tests (2 shards, Chromium)

### Submit a Pull Request

- Target branch: **`master`**
- Ensure your branch is up to date with `master`
- Open a pull request on GitHub — CI will run all checks automatically

---

Thank you for contributing to Grub Roulette!
