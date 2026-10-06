# storvia-storefront

The public customer storefront of Storvia: a mobile-first Next.js app that shows one merchant's catalog (home, categories, search, product pages, cart) and takes guest Cash-on-Delivery orders. It has no database; all data comes from `storvia-admin`'s API.

Stack: Next.js 13.4 (App Router), React 18, TypeScript, Tailwind.

## Setup

```bash
npm install
cp .env.example .env        # then fill in the values
npm run dev                 # http://localhost:4001
```

A running `storvia-admin` (default `http://localhost:4000`) is required, and `NEXT_PUBLIC_STORE_ID` must be a Store id from it.

## More

- `AGENTS.md`: working rules for this repo (`CLAUDE.md` imports it).
- `../storvia-ai-context`: project state, API contracts, decisions and the backlog.
