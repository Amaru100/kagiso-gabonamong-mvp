# Owner workspace

Open **/admin**, or choose **Owner login** in the footer. Enter the owner password. The workspace manages writings, books, events, free resources, guides, homepage text, contact details, author story, and portrait. No coding or developer is needed for regular content updates once the hosting setup below is complete.

## Regular use

1. Choose a tab and an entry, or use **Add**. New entries start as drafts hidden from the website.
2. Edit the fields. For writings, enter plain text in **Full writing**; put a blank line between paragraphs. HTML and Markdown are not interpreted.
3. Choose one of the six temporary covers, or paste an HTTPS URL for your own hosted image. Use an HTTPS download URL for a resource. Portraits also use a hosted image URL. The dashboard does not upload files; upload them to your preferred media service first.
4. Turn on **Visible on website** when ready. Turn it off to unpublish without deleting. Arrow controls change the display order.
5. Select **Publish changes**. The success message confirms a durable save. Until then, changes are only in the current editor; closing the page loses unpublished edits.
6. Use **View site** to review. Sign out on shared computers. Sessions expire after four hours; the password is never stored in browser storage.

**Remove** asks for confirmation and takes effect on publishing. Deleting a writing removes its public URL. Keep the URL ID unchanged when editing an existing article unless you intend to change its address. IDs must be unique, lowercase letters/numbers/hyphens. The workspace supports up to 500 entries per collection and a 900KB total publish request. Split very large content libraries into a dedicated CMS when necessary.

If another session publishes while you edit, your save is rejected instead of overwriting their changes. Copy your pending edits somewhere safe, reload, and reapply them to the latest content. If a session expires, retain/copy any pending text and sign in again. Browser refreshes warn before discarding unpublished work.

## Adding books

Choose **Books → Add book**. Enter the title, author, cover URL, and a short explanation in **Why recommend it / book description**. You can add an optional HTTPS details link. Select **Recommended book** for the reading list immediately after the homepage writings. Choose **Kagiso's own book** for his future publications; the public own-book section appears only after at least one is published.

The initial Atomic Habits, Deep Work, and Meditations entries are samples, not his confirmed endorsements. Edit or remove them when he shares his list. Clear **Sample selection, awaiting approval** once he approves an entry. Use **Visible on website** and **Publish changes** to make it public. Books support the same reorder, hide, delete and conflict protection as writings.

## One-time local setup

Copy `.env.example` to `.env.local`. Set `OWNER_PASSWORD` to a unique password of at least 16 characters (a password-manager generated value of 32+ characters is recommended). Leave `CONTENT_GITHUB_TOKEN` empty for local development. Restart `npm run dev` after changing environment values.

Local publishing writes `src/data/content.json` on disk. Those local changes still need a Git commit/push to reach production. The browser tests use a separate temporary copy and never overwrite your actual content.

## One-time Vercel setup

In the Vercel **kagiso-gabonamong** project, open **Settings → Environment Variables**, and add these server-only values for Production:

| Variable               | Value                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `OWNER_PASSWORD`       | A unique secret password, at least 16 characters; share only with the owner through a secure channel              |
| `CONTENT_GITHUB_TOKEN` | A fine-grained GitHub access token limited to `Amaru100/kagiso-gabonamong-mvp`, with **Contents: read and write** |
| `CONTENT_REPO`         | `Amaru100/kagiso-gabonamong-mvp`                                                                                  |
| `CONTENT_BRANCH`       | `main`                                                                                                            |

Never prefix secrets with `VITE_`, put them in source code, or send them in public messages. This repository contains an empty example only. Redeploy after adding the environment variables. Do not give Preview deployments a write token for the production branch; use a separate content branch/repository if preview publishing is needed. GitHub branch protections must permit the publishing identity to commit content.

On Vercel, **Publish changes** commits the content file to GitHub using a server function. All visitors read the latest published content through `/api/content`; the bundled public snapshot is used if GitHub is temporarily unavailable. A connected Vercel Git integration can also rebuild the static snapshot after each content commit. GitHub history provides a backup of published changes. Pull the latest commits before doing development work, because owner publishing creates new commits on the branch.

The dashboard deliberately stays locked if the password is missing or too short. Publishing stays unavailable until the repository token is configured. The public website works without either secret. This task adds and tests the publishing feature; it does not provision a new GitHub token or choose the owner's password.

## Security and maintenance

Requests require a signed HttpOnly, SameSite=Strict session cookie and same-origin writes. Production cookies are Secure. Drafts are omitted from both public API payloads and frontend bundles. They are still stored in the GitHub content file and its history; a public repository makes that source content public. Use a private repository for unpublished material that must remain confidential. Content is validated server-side; URL fields accept HTTPS URLs or simple root-relative paths, and writing bodies render as text. Sessions expire after four hours; rotating `OWNER_PASSWORD` immediately invalidates existing sessions.

Failed logins are throttled to eight attempts per IP per 15 minutes **within a running function instance**. That counter is not shared across Vercel instances or restarts. Configure a Vercel Firewall rate-limit rule for POST `/api/admin` if exposing this shared-password login on a busy public site; use a managed identity provider when multiple editors and individual accounts are needed. Keep the owner password long and unique, limit the token to this repository, and rotate/renew the token before expiry. A single owner login does not provide separate editor roles or an audit log of individual users.

## Enquiries and payments

Event and guide buttons lead to the contact page with the item in the subject. **Continue in email** opens the visitor's email application; the visitor must send the message. There is no email delivery service, checkout, cart, order storage, or payment processing in this version.

The existing contact details, article previews, event listings and guide descriptions remain sample content until confirmed by the owner. Author photo/story fields are intentionally blank. Original temporary SVG art is in `public/art`; replace or select covers in the workspace when complete writings are available.
