# Writing AI Tool

Paste text, pick a mode and get it rewritten by Claude, streamed in real time.

Production: <https://writing-ai-tool.vercel.app>

## Overview

- Modes: **improve**, **email**, **linkedin**, **technical**, **translate**, **tone**
- Sign-in with email magic link or Google
- 20 generations per user per day (reset at 00:00 UTC)
- History of past generations, default settings, saved custom instructions per mode

Product requirements: [`docs/prd/main.md`](docs/prd/main.md). Coding rules: [`CLAUDE.md`](CLAUDE.md).

## Stack

- Next.js 16 (App Router, TypeScript strict)
- Supabase: Auth, Postgres with Row Level Security
- Anthropic API via `@anthropic-ai/sdk` (server-side only)
- Tailwind CSS + shadcn/ui, Zod
- Vercel (hosting, Web Analytics), GitHub Actions (CI)

## Architecture

```
src/
  app/
    (auth)/             # login page + OAuth callback
    (app)/              # editor, history, settings
    api/generate/       # POST → SSE stream from Anthropic
  components/           # editor, history, settings, ui (shadcn)
  lib/
    prompts/            # one system prompt per mode + mode registry
    schemas/            # Zod schemas shared by client and server
    db/                 # Supabase queries
    supabase/           # server, browser and proxy clients
    usage.ts            # daily quota
  proxy.ts              # session refresh + route protection
supabase/migrations/    # database schema (source of truth)
```

Request flow: auth → Zod validation → quota check → Claude stream (SSE) → save generation and usage.

## Getting started

Requires Node.js 20+, pnpm 10, a Supabase cloud project and an Anthropic API key.

```bash
pnpm install
cp .env.example .env.local   # fill in the values
pnpm supabase login && pnpm supabase link --project-ref <ref>
pnpm supabase db push        # apply migrations
pnpm dev                     # http://localhost:3000
```

| Variable | Scope |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server |
| `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` | server only |
| `ANTHROPIC_MODEL` | server only, e.g. `claude-sonnet-5-5` |

In Supabase **Authentication → URL Configuration**, add `http://localhost:3000/callback` and `https://writing-ai-tool.vercel.app/callback` as redirect URLs.

## Scripts

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm supabase gen types typescript --linked > src/types/database.ts
```

No automated tests yet; CI runs lint, typecheck and build on every PR and push to `main`.

## Deployment

Vercel is connected to this repository: `main` deploys to production, PRs get preview deployments. Environment variables are set in Vercel for Production and Preview.
