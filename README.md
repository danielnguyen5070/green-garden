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

## Updating the FAQ

The FAQ page and the chatbot use the same questions and answers. The page reads them from this repo; the chatbot reads a copy (`green-garden-api/app/data/faqs.json`) that you regenerate after every FAQ change.

1. **Edit the text** in both `messages/vi.json` and `messages/en.json`, under `faq.items.<id>`.
   - To add a question, add its `id` and category to `FAQ_ITEMS` in `config/faq.ts`, then add `question` and `answer` for that `id` in both message files.
   - To remove or reorder questions, change `FAQ_ITEMS`; delete unused entries from both message files.
2. **Check it locally:** `npm run dev`, then open `/vi/faq` and `/en/faq`.
3. **Update the chatbot's copy:** `npm run export:faq`. It fails if a question is missing a translation, and says so if nothing changed.
4. **Commit and push both repos:**
   - `green-garden`: the message files (and `config/faq.ts`). Pushing deploys the FAQ page.
   - `green-garden-api`: `app/data/faqs.json`.
5. **Update the VPS:** in the `green-garden-api` folder, run `./scripts/update_vps.sh`. It pulls, rebuilds the API, runs migrations, and re-indexes the chatbot because `faqs.json` changed.
6. **Verify:** ask the chatbot one of the changed questions on the live site.

If the chatbot still gives the old answer, step 3 or the `green-garden-api` push was probably skipped. Run `./scripts/update_vps.sh --reindex` to force a re-index.

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
