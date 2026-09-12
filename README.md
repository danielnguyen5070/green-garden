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
│   ├── (store)/          # Storefront: plants, categories, cart, checkout, blog
│   ├── admin/            # Admin (auth will be added later)
│   ├── api/              # API routes (not implemented yet)
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/           # UI organized by domain
├── lib/
├── services/
├── store/
├── types/
└── public/
```

Customers do not have accounts. Only `/admin` will require authentication later.
