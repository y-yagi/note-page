# note-page

Next.js frontend. Authentication uses Firebase Auth (Google, via FirebaseUI);
data is read and written through the notebook JSON API
(`notebook-edge-api`) using the Firebase ID token as a Bearer token.

## Environment variables

Put these in `.env.local` (not committed):

```
NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# Base URL of the API. Required in production and must be https://.
# In development it defaults to http://localhost:8787 (wrangler dev)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
```

## Development

```
pnpm install
pnpm dev
```

## E2E tests

```
pnpm exec playwright install chromium   # first time only
pnpm e2e
```

`pnpm e2e` (Playwright) starts the Firebase Auth Emulator and a production
build of the app on port 3100 (it overwrites `.next/`). The API is not
started: the tests answer its requests with an in-memory fake
(`e2e/fake-api.ts`) that mirrors `notebook-edge-api`. The emulator is used
only when `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST` is set at build time.
