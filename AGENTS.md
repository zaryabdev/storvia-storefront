# AGENTS.md: storvia-storefront

## What this repo is

The public customer storefront of Storvia. One deployment serves one Store, chosen by `NEXT_PUBLIC_STORE_ID`. Guest Cash-on-Delivery checkout only. It has no database and no customer auth: it is a pure consumer of `storvia-admin`'s public API.

## Project context lives in `../storvia-ai-context`

Read, in order:
1. `PROJECT_BRIEF.md`
2. `projects/storefront/CONTEXT.md`
3. `RELEASES.md` (current iteration and Backlog)
4. `DECISIONS.md`, before touching API contracts, auth, tenancy or money.

Source code wins over docs. If they disagree, follow the source and fix the doc.

## Commands

- `npm run dev`: dev server on port 4001. It needs a running Admin (usually `http://localhost:4000`).
- `npm run build`, `npm run lint`, `npx tsc --noEmit` (no test framework: these are the checks).
- Env vars are listed in `.env.example`.

## Hard rules

Working:
- Do not commit, push or switch branches unless asked.
- No new dependencies without asking. Keep changes scoped to the request.
- Never write real env values into files.

Architecture:
- This repo has no database access. All data comes from Admin's public API, and the contract lives in `../storvia-ai-context/projects/admin/CONTEXT.md` ("Public Storefront API"). Do not assume fields Admin does not return.
- The Storefront shows the merchant's brand (Store name, logo, favicon), never Storvia's.
- Category icons come only from `lib/category-icons.ts` (and `lib/custom-icons.tsx`), which must stay identical to Admin's copies.
- Prices come from the server; the checkout never trusts client totals.

## Gotchas

- Next.js 13.4.4 (App Router). `lucide-react` is pinned at exactly 0.577.0 until Next.js is upgraded.
- Pages are rendered per request (`revalidate = 0`), and `next build` fetches from Admin, so Admin must be reachable during a build.
- The build also fetches the Urbanist Google font (`next/font/google`); in restricted environments this can fail the build. Say so rather than treating it as a code error.
- `next build` overwrites the `.next` folder used by a running `next dev`; stop the dev server first or build in an isolated copy.

## Updating docs

After a change, update `../storvia-ai-context` (the affected `CONTEXT.md`, `RELEASES.md`, `QA.md`), not this file, unless the working rules themselves changed.
