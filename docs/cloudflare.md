# Cloudflare Workers deployment

The Worker serves the React/Vite build from `dist`. The same Worker handles content, CMS authentication and editing, enquiries, private media and the sitemap. It reuses the existing Supabase schema, accounts, roles and storage bucket. Supabase remains the source of truth after configuration. Before configuration, public pages can use the bundled approved content and the CMS and enquiries report that setup is required.

## Connected GitHub deployment

In the Cloudflare dashboard, open **Workers & Pages → mystic-mind → Settings → Build**. The existing Worker name must match `name` in `wrangler.jsonc`. Use the following settings.

| Setting | Value |
| --- | --- |
| Git repository | `MysticMind100/kagiso-gabonamong-mvp` |
| Production branch | `main` |
| Root directory | Repository root, `/` |
| Node version | `24` via build variable `NODE_VERSION` |
| Build command | `npm run build:cloudflare` |
| Deploy command | `npx wrangler deploy` |

In **Settings → Variables & Secrets**, set these runtime bindings as secrets. Use the existing Supabase project values.

| Runtime secret | Value |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase publishable or legacy anon key used for Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase legacy service-role key, used only by Worker API handlers |
| `ENQUIRY_RATE_SECRET` | Existing random enquiry fingerprint secret, or a new random value for a fresh installation |

Keep these values out of Cloudflare **build** variables and out of any variable beginning with `VITE_`. No Vercel password, Vercel token, or GitHub publishing token is needed on the Worker. Wrangler sets `SITE_ORIGIN=https://mysticmind.co.bw` and `CLOUDFLARE_WORKER=1`. The Cloudflare build command defaults the public Vite canonical origin to the same HTTPS URL.

The pinned compatibility date applies Cloudflare's Node.js compatibility defaults, including populating `process.env` from runtime string bindings and secrets. Preserve that date or use a newer date with those defaults enabled. [Cloudflare Node.js process compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/process/)

If Supabase is already provisioned, reuse its data and administrator accounts. For a fresh database, apply the existing migrations and seed once as described in [production setup](production.md). In Supabase Auth, set the Site URL and any existing allowed redirect URLs to the new HTTPS domain as appropriate. Existing sessions on the old hostname require a new sign-in. The seed sets `info@mysticmind.co.bw` for new content stores. For an existing database, update the contact email under **Site & author** if needed. Enquiries continue to go to the CMS. Email delivery is a separate integration.

`wrangler.jsonc` attaches `mysticmind.co.bw` as a Worker Custom Domain. Review **Domains & Routes** before the initial cutover. If Cloudflare reports a conflicting record for the web hostname, review that specific web record before replacing it. Leave existing MX records and mail-related TXT and CNAME records, including SPF, DKIM and DMARC, intact. GitHub branch deployments and custom-domain changes happen when the build/deploy runs on the configured production branch.

## Manual deployment and local checks

```sh
npm ci
npm run build:cloudflare
npm run test:workerd
npx wrangler deploy --dry-run
npx wrangler dev
```

For local integration against a test Supabase project, set the four runtime secrets in a local `.dev.vars`, which Git ignores. Without it, the fallback content works and protected writes remain unavailable. Use a test database for local sign-in and uploads.

To publish manually, use an authorised Cloudflare account, configure the same runtime secrets, run the build above, and run `npx wrangler deploy`. After switching the domain, check a direct article URL and refresh, both PDF downloads, `/sitemap.xml`, administrator login, each role, enquiry submission, and a private media upload and download.

This setup uses Workers Free with static assets, without R2, Durable Objects or other paid add-ons. Ordinary pages and bundled media are served through the asset binding; APIs, custom CMS media, the sitemap and admin routes use the Worker. The CMS retains its existing 3 MB file limit. Worker limits still apply to dynamic routes. The existing Vercel configuration can remain for a rollback.

- [Workers Builds settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Static asset billing and limits](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)

## Resend enquiry alerts and administrator recovery

- The Worker reads its sending-only Resend credential from the encrypted runtime secret `RESEND_API_KEY`. Restrict that key to `notifications.mysticmind.co.bw`. Enquiry alerts are scheduled after a successful new Supabase insert and include only the dashboard link. Duplicate submissions are suppressed by the database and the Resend request uses the saved enquiry ID as its idempotency key. Failed sends leave the enquiry in the dashboard and log a generic error. Enquiry alerts have no automatic retry queue.
- Configure the existing Supabase project's **Authentication → Email → SMTP Settings** with `smtp.resend.com`, port `465`, username `resend`, and a different domain-restricted Resend Sending access key as the password. Use `website@notifications.mysticmind.co.bw` for the sender email and `Mystic Mind` for the sender name. Disable click and open tracking on the sending domain before testing auth email.
- Under **Authentication → Email Templates → Reset Password**, set the link to `https://mysticmind.co.bw/admin/reset-password#token={{ .TokenHash }}`. Use that first-party link in place of `.ConfirmationURL`. The link fragment stays out of HTTP requests until the visitor submits the password form, so opening or previewing the message leaves the token intact.
- After SMTP and the template are configured, set `PASSWORD_RECOVERY_ENABLED=1` as a Worker runtime variable or secret. The sign-in page then displays **Forgot password?**. It returns a generic acknowledgement, and the existing reset endpoint validates the one-time Supabase token and live administrator role before updating a password. Supabase enforces its configured email and token limits.
- Verify delivery in Resend or at the recipient inbox. For real administrator accounts, verify reset email arrival without submitting a replacement password. Exercise password changes on a test identity or through the existing automated fixtures.
