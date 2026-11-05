# Visual and functional review

The current revision was checked visually at 1440px and 390px. Viewed the homepage, the text-only Work With Me service list, and the Books editor. Screenshots are in the ignored artifacts folder: desktop-viewport.png, desktop.png, mobile.png, work-with-me.png, and books-admin.png.

The reference sites were opened and captured: Craig Mod, Austin Kleon, and Derek Sivers. The implementation prioritises actual writing and books, uses left-aligned headings and separators, removes the decorative hero panel and slogans, and keeps the requested forest-green brand.

## Review observations

- The homepage now starts with the author name and a real writing preview instead of a marketing slogan and decorative illustration.
- The article index is readable as a list with small monochrome illustrations. Book covers remain small, with the title, author and an explanatory note beside or below them.
- Recommended books appear directly after writings. The sample-selection notice avoids claiming personal endorsements before Kagiso supplies his list.
- The Work With Me service choices contain text and an accessible selected state; no decorative icons or check marks.
- No mobile horizontal overflow was detected by the browser checks. The Books workspace includes the complete editing fields and an own/recommended selector.

Rubric scores: first glance 8, signature 7, typography 9, composition 8, colour 8, media 8, motion 8, mobile 8, copy 8, polish 8. Average 8.0; nothing below 7. The pending author photography, full writings, and approved reading list remain the main limitations.

## Validation

Eight backend tests and three browser tests pass, plus the production build. Browser coverage includes public routes, mobile navigation, removed homepage copy, footer credit, no service SVGs, enquiry subjects, recommendation order, author information, book creation/editing/persistence, future own-book visibility, unpublishing/deletion, writing CRUD, and logout.

Backend coverage includes authentication, draft filtering, invalid asset URLs, revision conflicts, legacy content without books, book-type validation, GitHub write payloads, login throttling, malformed requests, and production fallback behaviour. Browser tests edit temporary content, not the real content file. Actual Vercel publishing still needs the hosting credentials described in owner-guide.md.
