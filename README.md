# Bettrboxd

Your films, your words. Live at https://bettrboxd.com

A Cloudflare Workers app: GraphQL API + auth served from a Worker bundle, backed by D1, with a Vite-built static frontend served via Workers Assets.

## Structure

- `src/index.js` — deployed Worker bundle (minified build of the backend: GraphQL, auth, D1 queries, TMDB integration). `src/index.beautified.js` is a beautified copy for editing; rebuild with `npm run build:beautify`.
- `frontend/` — static frontend build (Vite SPA) served via the `ASSETS` binding.
- `migrations/` — D1 migrations.
- `wrangler.jsonc` — Worker configuration (bindings, vars, rate limiters, D1).

## Local development

```bash
npm install
npm run types            # regenerate worker-configuration.d.ts
npm run dev              # start local dev server on http://localhost:8787
```

For local dev, copy `.dev.vars.example` to `.dev.vars` and add your TMDB read token. `DEV_AUTO_LOGIN=true` in `.dev.vars` enables auto-login locally.

## Deploy

```bash
npm run deploy
```

Requires `CLOUDFLARE_API_TOKEN` (Workers perms) and optionally `CLOUDFLARE_ACCOUNT_ID`. CI deploys on push to `main` via `.github/workflows/deploy.yml`.

## Secrets (Cloudflare)

- `TMDB_API_READ_TOKEN` — TMDB API read token. Set with `npx wrangler secret put TMDB_API_READ_TOKEN`.

## Notes

- The backend bundle was recovered from the deployed Worker (original source is not available). Source maps were not uploaded, so editing is done against the beautified build.
- Search falls back to Cinemeta (free) when no TMDB token is configured; Trending requires a TMDB token/key.
