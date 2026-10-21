# AI Writing Tool

Paste text, pick a mode and get it rewritten by Claude, streamed in real time.

Modes: **improve**, **email**, **linkedin**, **technical**, **translate**, **tone**. Signed-in users get 20 generations per day (reset at 00:00 UTC), a history of past generations, default settings and saved custom instructions per mode.

Product requirements: [`docs/prd/main.md`](docs/prd/main.md). Architecture and coding rules: [`CLAUDE.md`](CLAUDE.md).

## Stack

- Next.js 16 (App Router, TypeScript strict)
- Supabase: Auth (email magic link, Google), Postgres with Row Level Security
- Anthropic API via `@anthropic-ai/sdk` (server-side only)
- Tailwind CSS + shadcn/ui, Zod
- pnpm

## Local setup

Requirements: Node.js 20+, pnpm 10, a Supabase cloud project and an Anthropic API key.

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev                     # http://localhost:3000
```

Environment variables (`.env.local`, never commit):

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server |
| `SUPABASE_SERVICE_ROLE_KEY` | server only (usage increments) |
| `ANTHROPIC_API_KEY` | server only |
| `ANTHROPIC_MODEL` | server only, e.g. `claude-sonnet-5-5` |

## Supabase

The database schema lives in `supabase/migrations/` and is the source of truth; don't change the schema through the dashboard.

One-time setup (interactive):

```bash
pnpm supabase login
pnpm supabase link --project-ref <ref>
```

Then:

```bash
pnpm supabase db push                                                  # apply migrations
pnpm supabase gen types typescript --linked > src/types/database.ts    # regenerate types
```

For sign-in to work, set **Authentication → URL Configuration** in the Supabase dashboard: Site URL `http://localhost:3000` and Redirect URL `http://localhost:3000/callback`. Google sign-in additionally needs the Google provider enabled with OAuth credentials.

## Checks

There are no automated tests yet. Before merging, all of these must pass:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Deployment

Production: <https://writing-ai-tool.vercel.app>

### CI

`.github/workflows/ci.yml` runs `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck` and `pnpm build` on every PR and every push to `main`. The build uses dummy public Supabase values; no real secrets are stored in GitHub. Branch protection on `main` requires the CI check to pass before merging.

### Vercel

Connected to the GitHub repository: pushes to `main` deploy to production, PRs get preview deployments.

Set these environment variables for **Production** and **Preview**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (sensitive), `ANTHROPIC_API_KEY` (sensitive), `ANTHROPIC_MODEL`.

Web Analytics is wired up with `<Analytics />` in the root layout; enable it in **Project → Analytics**.

### Supabase Auth and Google OAuth

In **Authentication → URL Configuration**:

- Site URL: `https://writing-ai-tool.vercel.app`
- Redirect URLs:
  - `https://writing-ai-tool.vercel.app/callback`
  - `http://localhost:3000/callback`

In Google Cloud Console, the OAuth client's authorized redirect URI is the Supabase callback, `https://<project-ref>.supabase.co/auth/v1/callback`; it doesn't change per environment.

## Known gaps

- No Content-Security-Policy yet: it needs per-request nonces, which conflicts with prerendered pages under `cacheComponents`. Baseline security headers are set in `next.config.ts`.
