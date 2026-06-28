# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm**.

- `pnpm dev` — start the dev server at localhost:3000
- `pnpm build` — production build
- `pnpm start` — serve a production build
- `pnpm lint` — ESLint (flat config in `eslint.config.mjs`, extends `next/core-web-vitals` + `next/typescript`)

No test runner is configured.

## Environment

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the publishable key var also accepts a legacy anon key). `hasEnvVars` in `lib/utils.ts` checks both are present; when they are missing, auth/proxy logic short-circuits and the UI shows `EnvVarWarning` instead of crashing — preserve this graceful-degradation pattern when touching auth-gated code.

## Architecture

Next.js 15 App Router + React 19 starter wiring Supabase cookie-based auth (`@supabase/ssr`) across every Next.js context. TypeScript path alias `@/*` maps to the repo root.

### Three Supabase clients — pick by execution context

Never share a client across requests (Fluid compute caveat noted in the source). Always create one per call:

- `lib/supabase/client.ts` — `createClient()`, browser client for Client Components.
- `lib/supabase/server.ts` — async `createClient()`, server client wired to Next's `cookies()`. Its `setAll` swallows errors thrown from Server Components on purpose (cookie writes there are refreshed by the proxy instead).
- `lib/supabase/proxy.ts` — `updateSession()`, used only by the proxy to refresh the session cookie on every request.

### Proxy / session refresh (note the unconventional name)

The root middleware file is **`proxy.ts`**, not `middleware.ts`, and it exports `proxy` (not `middleware`). The Supabase `updateSession()` call is **currently commented out** while the project is being re-scaffolded — `proxy.ts` is a pass-through (`NextResponse.next`). To re-enable session refresh, restore the `updateSession` import and call. Two hard rules carried from the Supabase template, with comments in `lib/supabase/proxy.ts` explaining why:

1. Do not insert code between `createServerClient(...)` and `supabase.auth.getClaims()` — it causes random logouts.
2. Always return the `supabaseResponse` object intact (or copy its cookies onto any replacement response), or browser/server sessions desync.

When re-enabled, `updateSession` also enforces auth routing: unauthenticated requests to anything outside `/`, `/login`, and `/auth/*` are redirected to `/auth/login`.

### UI

shadcn/ui (new-york style, configured in `components.json`) on Tailwind CSS with `next-themes` for dark mode. Primitives live in `components/ui/`; compose class names with `cn()` from `lib/utils.ts`. `app/page.tsx` is currently a single welcome page — the auth pages, protected routes, and starter components have been cleared out for a fresh start.
