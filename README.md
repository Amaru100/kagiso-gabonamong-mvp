# Mystic Mind

Kagiso Gabonamong’s editorial website and owner workspace. The public site uses React, React Router, Vite and Tailwind. Vercel serves the built site and Node API handlers. Supabase provides PostgreSQL content, password authentication, private media and enquiries when configured.

## Run locally

Use Node 24 with `npm ci`, then `npm run dev`. The checked-in approved content is available immediately. To exercise the existing local editor, copy `.env.example` to `.env.local` and set a private `OWNER_PASSWORD` of at least 16 characters. Local edits write the JSON snapshot. To exercise the new account roles, uploads and enquiries, connect an isolated Supabase environment instead.

- `npm test` runs API tests, including mocked backend responses.
- `npm run test:e2e` runs Playwright. Install Chromium with `npx playwright install chromium` or set `PLAYWRIGHT_CHANNEL=msedge` if Edge is already installed.
- `npm run build` builds the Vercel frontend. `npm run preview` serves static files only.
- See [production setup](docs/production.md), [editorial notes](docs/editorial-revision.md), and [Kagiso’s owner guide](docs/owner-guide.md).
