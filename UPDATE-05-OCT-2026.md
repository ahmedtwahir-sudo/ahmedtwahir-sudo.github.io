# ShikaDeal — 5 October 2026 Update

Built from: `ahmedtwahir-sudo.github.io-main 5 Oct 2026.zip`

## Changes

- Standardized public navigation to: **Deals | Shop | Guides | Prints | Bench | Home**.
- Removed hero sections from Deals, Shop, Guides and 3D Prints pages; content now starts directly with the catalogue/content.
- Kept the homepage hero unchanged.
- Added subtle `01`, `02`, `03`... card numbering based on the current display order.
- Made homepage Deal images/titles link to individual Deal pages.
- Kept Bench image/title links pointing to individual article pages.
- Made Guide images/titles point to the existing free preview or full guide destination.
- Standardized card title sizing so long titles do not dominate the cards.
- Moved homepage `VIEW ALL` / `READ ALL` controls below the card grids.
- Standardized child-page counters using the requested compact style, e.g. `01 guide`, `05 deals`, `04 products`.
- Added Prints and Bench to the Deals page navigation.
- Standardized the mobile navigation typography/weight and prevented the desktop-only boldness mismatch on the page navigation controls.
- Fixed Deals admin image previews for external eBay image URLs.
- Changed the Deals admin image workflow so a selected main image is queued, then the Admin Key is requested once during Save; the image upload and deal save use that same key.
- Preserved the existing Deal Engine/eBay monitoring Worker unchanged.

## Worker

`Cloudflare_worker_5_oct_2026.js` is the Worker supplied with the 5 Oct build and was not modified in this update.
