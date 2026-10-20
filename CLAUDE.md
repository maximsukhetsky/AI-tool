# CLAUDE.md

AI writing tool: the user pastes text, picks a mode (improve / email / linkedin / technical / translate / tone) and gets a Claude-generated result streamed in real time.

## Stack
- **Next.js 16** (App Router, TypeScript strict, React Server Components by default)
- **Supabase**: Auth, Postgres (history, usage, settings), Row Level Security; `@supabase/ssr` for the server and browser clients
- **Anthropic API**: `@anthropic-ai/sdk`, server-side only; default model `claude-sonnet-5-5`, set through `ANTHROPIC_MODEL`
- **UI**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **Package manager**: pnpm
- **Tests**: none yet (see Rules)

## Architecture
All application code lives in `src/`; the `@/` alias maps to `src/` (so `lib/...` below means `src/lib/...`). Config, `supabase/` and `docs/` stay in the repo root.
```
src/
  app/
    (auth)/login, (auth)/callback   # Supabase Auth pages + OAuth callback
    (app)/page.tsx                  # Main editor: input, mode picker, streamed output
    (app)/history/                  # Past generations
    (app)/settings/                 # User preferences & saved custom prompts
    api/generate/route.ts           # POST → SSE stream from Anthropic
  lib/
    anthropic/client.ts             # Singleton SDK client (server-only)
    prompts/                        # One file per mode: system prompt builder
    prompts/index.ts                # Mode registry: Mode → { label, buildSystemPrompt, maxTokens }
    supabase/server.ts, client.ts, proxy.ts
    schemas/                        # Zod schemas shared by client & server
    usage.ts                        # Quota checks and increments
  components/
    ui/                             # shadcn/ui (generated, do not hand-edit)
    editor/                         # ModePicker, InputArea, OutputStream, etc.
  types/database.ts                 # Generated Supabase types
  proxy.ts                          # Supabase session refresh + route protection
supabase/migrations/                # SQL migrations (source of truth for schema)
docs/prd/                           # Product requirements
```

### Generation flow
1. The client POSTs `{ text, mode, options }` (for example `targetLanguage` in translate mode) to `/api/generate`.
2. The route handler authenticates the user through the Supabase server client and returns 401 if there is no session.
3. It validates the body with the Zod schema from `lib/schemas` and returns 400 on failure.
4. It checks the quota (`lib/usage.ts`) and returns 429 when the limit is reached.
5. It builds the system prompt from the mode registry, plus the user's saved custom prompt if one exists.
6. It calls `anthropic.messages.stream(...)` and pipes text deltas to a `ReadableStream` as SSE events (`data: {"type":"delta","text":"..."}`), then sends `done` (or `error`).
7. When the stream finishes, it saves the generation (input, output, mode, model, token usage) and increments the usage counter. This happens server-side, after the stream completes.
8. The client reads the stream through `fetch` + `response.body.getReader()`, renders tokens as they arrive, and supports cancelling through `AbortController`.

### Data model (Supabase)
- `profiles`: user id, plan, preferences (default mode, default target language)
- `generations`: id, user_id, mode, input, output, model, input_tokens, output_tokens, created_at
- `usage`: user_id, period, request_count, token_count
- `custom_prompts`: id, user_id, mode, name, instructions
- RLS is enabled on every table; users can only read and write their own rows.

## Commands
```bash
pnpm install                 # install deps
pnpm dev                     # dev server at http://localhost:3000
pnpm build                   # production build (must pass before finishing a task)
pnpm lint                    # ESLint
pnpm typecheck               # next typegen && tsc --noEmit
pnpm dlx shadcn@latest add <component>        # add a shadcn/ui component
pnpm supabase migration new <name>            # create a migration
pnpm supabase db push                         # apply migrations to the linked cloud project
pnpm supabase gen types typescript --linked > src/types/database.ts   # regenerate DB types
```

Supabase is a **cloud project** (no local Docker). One-time setup, run by the user because it's interactive: `pnpm supabase login`, then `pnpm supabase link --project-ref <ref>`.

Required env (`.env.local`, never commit):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`.

## Rules
- **Never expose secrets to the client.** `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are used only in server code. Mark those modules with `import "server-only"`.
- **All Anthropic calls go through `/api/generate`**; never call the API from the browser.
- **Always validate input with Zod** on the server, even if the client already validated it. Enforce a max input length.
- **Auth and quota checks come before calling Anthropic**, every time.
- **RLS on every table.** Use the service-role client only where it is unavoidable (for example usage increments), and never with user-controlled filters.
- **Schema changes only through migrations** in `supabase/migrations/`, then regenerate `src/types/database.ts`. Never edit the DB through the dashboard.
- **Prompts live in `lib/prompts/`**, never inline in route handlers or components. Adding a mode means adding a prompt file, registering it in the mode registry, and adding it to the Zod `Mode` enum.
- **Treat user text as data, not instructions.** Wrap it in clear delimiters (for example `<user_text>`) in the user message, and keep mode instructions in the system prompt.
- **Streaming must handle errors and aborts**: send an `error` SSE event instead of throwing mid-stream, stop the Anthropic stream when the client disconnects (`request.signal`), and save nothing for aborted requests unless they produced partial output.
- Don't hand-edit `src/components/ui/*` (shadcn-generated) or `src/types/database.ts` (generated).
- No tests yet: before finishing a task, `pnpm lint`, `pnpm typecheck` and `pnpm build` must pass, and verify UI changes manually in `pnpm dev`.
- Don't add new dependencies without a clear reason; prefer what's already in the stack.

## Conventions
- **Language**: code, identifiers, comments and commit messages in English.
- **TypeScript**: `strict`, no `any`; infer types from Zod (`z.infer`) and from generated Supabase types.
- **Components**: Server Components by default; add `"use client"` only where state, effects or browser APIs are needed. One component per file, PascalCase filenames for components and kebab-case for everything else.
- **React imports**: import React APIs and types by name (`import { Suspense, useState, type ComponentProps } from "react"`); never use the `React.` namespace or `import * as React` / `import React`. Exception: generated `src/components/ui/*` stays as shadcn writes it.
- **Imports**: use the `@/` alias for absolute imports; no deep relative paths (`../../..`).
- **Styling**: Tailwind utility classes only; compose with `cn()` from `lib/utils`; no CSS modules or inline styles.
- **Modes**: a single `Mode` union/enum (`"improve" | "email" | "linkedin" | "technical" | "translate" | "tone"`) in `lib/schemas`, used everywhere, with no string literals scattered around.
- **API responses**: errors as JSON `{ error: { code, message } }` with the correct HTTP status; streams as SSE with typed events (`delta` / `done` / `error`).
- **Data access**: put Supabase queries in small functions in `lib/` (for example `lib/db/generations.ts`), not directly in components.
- **Server mutations** (settings, custom prompts, deleting history): use Server Actions with Zod validation.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`).
