# Production setup

The repository contains the public site and deployable integration. The live Supabase project, hosting, domain, credentials and notification sender require owner configuration.

1. At the owner’s direction, provision a Supabase project or a local Supabase stack. Apply the versioned migration under `supabase/migrations`. Enable the Data API for the relevant public schema and disable public sign-ups in Auth.
2. Configure the following server-side variables in the development or Vercel environment. Use independent Supabase projects for production and preview if preview will accept writes.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Publishable or legacy anon authentication key |
| `SUPABASE_SERVICE_ROLE_KEY` | Legacy service-role key used only by server functions and seed script |
| `ENQUIRY_RATE_SECRET` | Random secret for hashing rate-limit identifiers |
| `SITE_ORIGIN` | Final HTTPS origin for the sitemap |
| `VITE_SITE_ORIGIN` | Same public HTTPS origin for canonical and sharing metadata |

3. Seed once with `node --env-file=.env.local scripts/seed.mjs` against the intended database. The seed inserts the singleton content row only if missing. It never replaces CMS edits. With Supabase configured, public content failures produce an unavailable message and edits fail closed. The bundled approved snapshot is used for the unconfigured site. The legacy GitHub content adapter remains available when Supabase is unconfigured. Remove legacy owner and GitHub write variables from the production environment after migration.
4. Create the approved administrator identities through Supabase Auth. Grant the first developer account `super_admin` in `public.mystic_admins` using the user UUID, with the site owner's authorisation. A Super Admin can then give the existing Kagiso identity `content_admin` access in the dashboard. Do not create production accounts until the addresses and authorisation are confirmed.
5. In Vercel select Vite, run `npm run build`, and output `dist`. The repository configures SPA routes, the private media proxy, and the sitemap. Configure the confirmed domain and redirect allowlist in Auth. Configure SMTP before enabling password recovery. The workspace currently requires re-sign-in after access-token expiry and has no self-service recovery UI.
6. Confirm testimonial photograph and quotation permission, book cover permissions, business contact details, hosting providers, data retention and privacy wording before launch. Verify admin roles, publishing, private media, enquiry persistence and throttling in the actual environment. No email notification provider is enabled. Enquiries go to the dashboard when configured. A sender, credentials and notification delivery code can be added once the business email is confirmed.

## Backend boundaries

- To clean up a database previously seeded with the legacy demonstration content, rerun the seed command from step 3. It removes only records matching the original placeholders and checks the content revision before writing. Published reads filter those same records while cleanup is pending.

- Public access goes through Vercel functions. Supabase RLS and grants block direct public or authenticated table access. Server handlers verify the Auth session and live administrator role before every privileged operation. The public content handler filters drafts.
- The migration creates a private storage bucket. New files are accessible through the media proxy to signed-in administrators or when referenced by a published record. Uploads currently cap files at 3 MB and accept PDF, PNG, JPEG and WebP. Uploaded originals are retained in the private bucket. The owner can replace references without deleting originals.
- Enquiries use a honeypot, same-origin JSON requests, durable rate limits and request IDs to retry safely. The dashboard can search the most recent 200 records and update their status. Configure a retention policy before launch.
- Publishing is revision-checked and writes an audit entry in the same transaction. Role changes also leave audit entries. No production connectivity, authentication, storage or form delivery is proven by the mock API tests.
- Page-specific metadata is updated in the browser. Some link crawlers may only see the default document metadata. Domain-specific social cards and an end-to-end Lighthouse audit remain launch tasks.
