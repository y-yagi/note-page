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
