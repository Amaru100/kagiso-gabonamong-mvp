# Visual and functional review

Compared the original committed site in a separate temporary checkout with the revised site. Viewed desktop (1440×900), mobile (390×844), and owner dashboard screenshots. Screenshots remain in the ignored `artifacts/` folder.

The reference blog was reviewed directly, including an actual cover image. The resulting six SVG illustrations are original temporary line studies. They echo the monochrome paper-and-engraving direction without copying the reference artwork. They remain deliberately provisional until the complete writings arrive.

## Changes from the visual review

- The long author name and eight navigation links crowded the header at intermediate sizes. The menu now collapses below 1280px, preserving the 44px mobile button.
- Section headings started at zero opacity, producing empty areas in a full-page capture before scrolling. They now stay visible and move 14px into position, with no movement for reduced-motion users.
- The original hero had three competing actions and a long heading. The revision uses a shorter editorial headline, two actions, one monochrome artwork and a quiet caption. At mobile widths the cover flattens to a 1.65 aspect ratio, with 24px side padding.
- Deep green is too dark as small text against the dark background. Exact #06402B is used on primary buttons and the author panel; light green companion tones keep labels and focus states readable.

## Rubric

| Area | Score / 10 | Observation |
| --- | --- | --- |
| First glance | 8 | Clear headline and one visual focal point |
| Signature | 7 | Original engraved doorway; final writing-specific art will improve it |
| Typography | 9 | Serif headings, restrained body type, consistent hierarchy |
| Composition | 8 | Generous spacing and bounded content widths |
| Colour | 8 | Forest green with readable pale-green text |
| Media | 7 | Cohesive placeholders; author photography is still pending |
| Motion | 8 | Restrained reveals and reduced-motion support |
| Mobile | 9 | Stacked layout, no detected overflow, usable dashboard controls |
| Copy | 8 | Clear enquiry actions and honest unavailable-content states |
| Polish | 8 | Focus states, consistent covers, no broken local images |

Average: 8.0, with no score below 7. Remaining visual improvements depend on the actual writings, approved author biography, and photographs.

Functional checks cover public routes, individual writings, mobile navigation, enquiry subjects, removed checkout routes, dashboard CRUD, publishing, visibility, reordering, saved content after refresh, author settings, logout, authentication, URL validation, conflicting revisions, rate limiting, and GitHub publishing requests. Browser tests use temporary content files and a test-only password. Live GitHub publishing requires hosting secrets; the GitHub write contract is tested with a mocked response rather than a real production content commit.
