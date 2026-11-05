# Kagiso Gabonamong â€” Collected ideas

An editorial revision of the existing React/Vite site, for readers interested in clarity, leadership, and purposeful work. Mood: thoughtful, grounded, spacious. Preserve the existing routes for writings, events, resources, guides, contact, and bookings. Remove all order/payment flows and testimonials. Use original temporary cover artwork until the owner supplies complete writings.

The signature is a collection of monochrome, engraved vector studies on warm grey paper. Each is an original drawing, rather than an image copied from the reference website. Six images represent steps, growth, systems, perception, possibility, and direction. Repeated fine lines, off-white negative space, and subtle paper grain give them a consistent visual language. The cover subjects are provisional and selectable in the dashboard.

## Type and palette

Use Cormorant Garamond 600/700, loaded in the existing HTML, for the hero and section headings. Body/UI use the system sans-serif stack. Small labels use ui-monospace. Hero type is clamp(56px,5.7vw,82px), line-height .99, tracking -.045em, maximum width 620px. At mobile widths use clamp(52px,12.5vw,76px). Section headings use clamp(36px,4vw,54px), leading 1.1, tracking -.025em. Body copy is 16px with 1.9 line-height; card descriptions are 14px with 28px line-height. Labels are 10px, 500 weight, .16em tracking, uppercase. Use at least 44px controls.

Background #090e0b, foreground #f0f4ef, muted #bbc6bf, panel #101813, section band #0e1611. The brand accent is exactly #06402B. Primary actions and author portrait background use it with white text. Readable green text uses #a6cfb7 or #8dc6a7; these are tonal companions, because deep green text would be difficult to read on the dark background. Borders use white at 10â€“15% or #56866b at 60%. Remove every old gold token and warm gold gradient.

## Layout

The desktop content container is 1280px. Hero padding is 82px 32px 72px, grid columns 1.05fr 1fr, gap 62px. Reading order: eyebrow, heading, description, two actions, small downward reading cue. The right panel shows the doorway study with a 1.14 aspect crop and a 1.5-degree rotation, finishing with a thin caption rail. No unprovided portrait or fabricated biography appears. At 767px the hero becomes a single column with 44px spacing; art becomes a flat 1.65 aspect panel. There is no fixed viewport height.

Following sections: latest writings (three columns desktop, one mobile), free resources (four desktop, two tablet, one mobile), guides (three desktop), and events (three desktop). Use 80px vertical spacing, alternating subtle green-black panels. Article covers use a consistent 16:9 crop; titles have readable hierarchy and individual article routes. Long writing text is bounded to a 768px container and rendered as paragraphs, never unsafe HTML. Shared author section sits above the footer with a 260px square portrait or honest monogram placeholder, 72px gutter and editable name, story, image and location. On mobile the portrait is 180px, followed by the copy. The author section is shared across public pages.

Navigation moves to its mobile menu below 1280px to avoid overflow from the long author name. Menu state is exposed with aria-expanded. Show owner login discreetly in the footer. Public pages have no cart, checkout, payment methods or order preview. Event and guide actions carry the entry title into an email enquiry. The email action states clearly that the visitor must send it from their own email app.

## Motion and interaction

Section headers stay visible and move 14px upward over .45 seconds, once in view at 50% visibility. No looping animation, scroll hijacking, or exaggerated card motion. Cover hover scale is 1.05 over .5 seconds. Visible focus outline is 2px #a6cfb7 with 4px offset. Respect prefers-reduced-motion: final header state, no transition or animation.

## Owner workspace

/admin contains password sign-in, separate tabs for writings, events, downloads, guides, and site/author settings. The content layout has a 280px list and flexible editor with 28px gap. At 767px these stack. The editor exposes titled fields, full writing text, cover choices, visibility, add/remove/reorder controls and a global Publish changes action. New entries start as drafts hidden from the website. Display unsaved, publishing, success and error states, protect against accidental navigation, and reject concurrent overwrites using a content revision. Save to disk in development and authenticated GitHub commits on Vercel. Owner credentials stay on the server; public payloads and frontend bundles omit drafts.

## Acceptance

Check desktop 1440px and mobile 390px, all routes and assets, no horizontal overflow or console errors. Verify admin authentication, draft isolation, add/edit/remove/reorder, saved content after refresh, invalid URL rejection, stale revision protection and logout. Run a production build and meaningful browser/API checks. Never commit secrets or generated test screenshots.
