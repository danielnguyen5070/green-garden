# Green Garden

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

## Project structure

```text
green-garden/
├── app/
│   ├── [locale]/
│   │   ├── (store)/      # Storefront: plants, categories, cart, blog
│   │   └── (checkout)/   # Checkout flow
│   ├── admin/            # Admin dashboard (auth will be added later)
│   ├── api/              # API routes (not implemented yet)
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/           # UI organized by domain
├── data/
├── lib/
├── services/
├── store/
├── types/
└── public/
```

Customers do not have accounts. Only `/admin` requires authentication (temporary local session until the backend auth API is connected).

Temporary admin credentials (see `.env.example`):

```bash
ADMIN_EMAIL=danielnguyen5070@gmail.com
ADMIN_PASSWORD=123321
AUTH_SECRET=replace-with-a-long-random-string
```
