# Grub Roulette

A simple, free, and open-source web app that helps you find a random restaurant near you. Discover new and locally owned places! :)

## Built With

- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/docs)
- [Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Material UI](https://mui.com/)
- [Google Maps API](https://developers.google.com/maps)

[Visit Grub Roulette](https://grubroulette.app)

---

## Contributing

We welcome contributions from the community! Follow the steps below to set up the project locally and start contributing.

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

   - Rename `.env-sample` to `.env` or copy it:
     ```sh
     cp .env-sample .env
     ```
   - Supply your own Google Maps API key in the `.env` file to use for api calls when running locally.

5. **Run the app:**

   ```sh
   npm run dev
   ```

6. **Submit a pull request targeting `master`:**

   - Ensure your branch is up to date with the latest changes from `master`.
   - Push your feature branch to the repository.
   - Open a pull request on GitHub targeting the `master` branch.

7. **Required build check for PRs:**
   ```sh
   npm run build
   ```

---

Thank you for contributing to Grub Roulette! Your help is greatly appreciated.
