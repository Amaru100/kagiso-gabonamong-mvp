# Editorial revision

## Mystic Mind

Mystic Mind uses Inter, a #050505 foundation, #F8F8F8 primary text, #A8A8A8 body text, #777777 metadata, and restrained #06402B accents with #85B79A highlights. Cards use #0C0C0C and #101010. The reference composition uses a 770px editorial column and an 1180px header and footer. The hero scales to 72px, and major sections use 145px desktop and 100px mobile spacing.

The checked-in source reference is design-reference/kagiso-approved.html. Its eye, open book and lightbulb drawings are extracted into public/sketches with the noise filters removed. Public writing previews use deterministic artwork for legacy placeholder covers and respect custom covers.

Two smooth radial glows drift over a 28-second cycle. A fine-pointer cursor light updates CSS custom properties in requestAnimationFrame. Touch and reduced-motion modes disable cursor lighting, and reduced motion also stops ambient drift. Decorative layers stay behind content and ignore pointer input.

Recommended Books and Books have separate routes and use the same owner collection. Featured recommendations require an approved published entry with a cover, author and owner note. Resource, writing, book and biography grids adapt to narrow viewports. The navigation disclosure supports keyboard focus and Escape. Work With Me and Contact share validated fields and contact configuration.

## Implementation baseline

The prior Vite SPA had home, about, writings and article detail, books, resources, premium guides, events, Work With Me, Contact, and owner routes. It used a single books collection with a type and sample flag. The owner editor used a signed password session and saved locally to JSON or through GitHub on Vercel. The existing Vercel rewrite preserved SPA deep links and excluded the API. The project had six temporary writing covers and three real book covers attached to sample recommendations. The initial isolated Node test command hit a Windows child-process restriction.
