# Mystic Mind

Kagiso Gabonamong's editorial website for writings, recommended books, resources, events, and enquiries, with an owner workspace at `/admin`. Future books by Kagiso can also be managed there; that section appears only when a book is published.

## Stack

React, Vite, Tailwind CSS, React Router, Framer Motion, Lucide icons. Vercel Node functions provide owner authentication and GitHub-backed content publishing. Development saves content to a local JSON file.

## Run

```powershell
npm install
Copy-Item .env.example .env.local
# Set OWNER_PASSWORD in .env.local (minimum 16 characters).
npm run dev
```

The public website works without secrets. Owner access requires the password; publishing on Vercel also requires a repository-scoped token. Follow [the owner and hosting guide](docs/owner-guide.md) for the complete setup.

## Validate

```powershell
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

To use an installed Edge browser instead of downloading Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

Browser tests use temporary content and a test-only password. They never edit the real content file. Screenshots appear in the ignored `artifacts` folder.

## Content and design

- `src/data/content.json`: authoritative writings, books, events, resources, guides, and settings.
- `src/pages/Admin.jsx`: owner workspace.
- `server/`: validation, authentication, and durable publishing.
- `api/`: Vercel functions.
- `public/art/`: legacy cover studies. New pencil artwork lives in `public/sketches/`.
- [Design specification](docs/design-spec.md).
- [Current editorial revision and design references](docs/editorial-revision.md).
- [Owner guide and hosting setup](docs/owner-guide.md).

The accent is `#06402B`. Testimonials, cart, checkout, orders, and payment methods have been removed. Work With Me and Contact open the visitor's email app after a confirmed inbox is configured. Author portrait and biography will be added when supplied. Current writings are previews until full text is provided.

Vercel builds with `npm run build` and serves `dist`, plus the `/api` functions. `npm run preview` previews the static build only; use `npm run dev` to exercise owner publishing locally. Always pull before making changes because production content publishing creates GitHub commits.
