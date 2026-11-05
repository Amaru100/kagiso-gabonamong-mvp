# Editorial revision

The first design relied too heavily on promotional headings, decorative icons, identical cards, and an oversized decorative hero. This revision gives the author's actual work more space.

References reviewed directly in the browser:

- [Craig Mod](https://craigmod.com/): a working writer's site, prioritising actual publications and straightforward descriptions.
- [Austin Kleon](https://austinkleon.com/): writing, books, and author information have clear, distinct places in the layout.
- [Derek Sivers' book notes](https://sive.rs/book): small identifiable covers accompanied by useful reasons to read each book.

The implementation borrows these content priorities, not their branding, text, or exact layouts. The existing green-and-black palette and original monochrome writing covers remain.

## Layout and type

The home container is 1184px including 32px side padding. The introduction is a 1.1fr/1fr grid with a 100px gutter, 82px top padding and 74px bottom padding. The author's name replaces the generic slogan, at clamp(68px,7vw,104px), Cormorant Garamond 500, .92 line height and -.05em tracking. The right column is the latest writing: actual 16:9 cover, metadata, linked title and excerpt. There is no tilted decorative panel or caption rail.

Subsequent sections use a 220px margin column and flexible content column, with a 64px gap, 54px top and 64px bottom padding, and a single thin top rule. Headings are plain: Writings, Recommended books, Resources, Guides, Events. The writing index uses three rows, 30px serif titles, quiet category/reading-time metadata and 156px thumbnails. Recommended books come immediately after writings, with three 88×136px covers, titles, authors and short reading notes. A visible sentence identifies the current selections as samples until approved.

Below 768px, the intro and sections become one column with 24px side padding. Writing thumbnails become 84px squares and introductory excerpts are removed from the small index rows. Book notes use a 76px cover and flexible text column so the covers stay small. Service choices on Work With Me are plain text rows with an accessible pressed state and the word Selected. No decorative service icons, emoji or check marks. Product/resource/event cards elsewhere have been simplified into border-separated notes and text links as well.

Brand accent remains #06402B. Light green companion colours are retained for legibility on dark backgrounds. There are no new decorative animations. Existing reduced-motion and visible-focus support remain.

## Books management

Owner login → Books manages title, author, cover URL, recommendation/description, optional details URL, visibility, order and a sample-selection flag. Book type distinguishes recommendations from future books by Kagiso. No own-book section is shown until an own-book entry is published. Both kinds can be added, edited, hidden, reordered and removed using the existing durable publishing flow.

Older content files without a books collection are accepted and read as an empty list. Book covers and links receive the same server-side URL validation as other assets. Samples do not claim to be Kagiso's confirmed endorsements. Images are stored locally so the sample covers do not depend on external image requests during browsing.

Owner publishing still requires the one-time hosting credentials in the owner guide. The dashboard existed previously, but a book-specific collection and public reading list were missing; both are included in this revision.

## Review

Check the revised homepage at 1440px and 390px, Work With Me, /books, and the Books editor. Confirm no horizontal overflow, both rejected homepage lines are absent, footer reads Muzila Designs, service choices contain no SVG icons, recommendations follow writings, and book CRUD persists after refresh. Include a check that future publications stay hidden until published, without changing the real content during tests.
