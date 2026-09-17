# Ngoc Ngan Ben Tre

Seedling and plant nursery e-commerce website with a blog.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin UI talks to the FastAPI backend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the API (see `green-garden-api`) on port 8000, then sign in at `/admin/login`.

Auth uses HttpOnly cookies (`gg_access_token`, `gg_refresh_token`) set by the backend. Bootstrap the first admin with the API CLI (`python -m app.cli create-admin`).

## Project structure

```text
green-garden/
├── app/
│   ├── [locale]/
│   │   ├── (store)/      # Storefront: plants, categories, cart, blog
│   │   └── (checkout)/   # Checkout flow
│   ├── admin/            # Admin dashboard (JWT cookie auth via FastAPI)
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/           # UI organized by domain
├── data/
├── lib/
│   └── api/              # Central API client for admin
├── services/
├── store/
├── types/
└── public/
```

Customers do not have accounts. Only `/admin` requires authentication.
