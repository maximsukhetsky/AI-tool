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

TBD: Vercel deployment and CI are planned in session 5 (see the PRD).

## Known gaps

- No Content-Security-Policy yet: it needs per-request nonces, which conflicts with prerendered pages under `cacheComponents`. Baseline security headers are set in `next.config.ts`.
